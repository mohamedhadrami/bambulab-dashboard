const WebSocket = require("ws");
const mqtt = require("mqtt");

const wss = new WebSocket.Server({ port: 8080 });

const API_BASE = "https://api.bambulab.com";
const PROFILE_ENDPOINT = "/v1/user-service/my/profile"; // used to get user id

async function getUserId(accessToken) {
  const res = await fetch(`${API_BASE}${PROFILE_ENDPOINT}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const raw = await res.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch {}

  if (!res.ok) {
    throw new Error(`Profile lookup failed (${res.status}): ${data?.message || raw || "unknown"}`);
  }

  // Field names vary by implementation; handle common ones.
  const userId =
    data?.uid ??
    data?.userId ??
    data?.data?.uid ??
    data?.data?.userId;

  if (!userId) {
    throw new Error(`Could not find user id in profile response: ${raw}`);
  }

  return String(userId);
}

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  let mqttClient = null;
  ws.subscriptions = [];

  ws.on("message", async (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (e) {
      ws.send(JSON.stringify({ error: "Invalid JSON", details: String(e) }));
      return;
    }

    const { action, topic, id, command, accessToken } = data;

    try {
      switch (action) {
        case "connect": {
          if (!accessToken) {
            ws.send(JSON.stringify({ action: "mqtt_error", error: "Missing accessToken" }));
            return;
          }

          // Tear down any existing connection for this WS client
          if (mqttClient) {
            mqttClient.end(true);
            mqttClient = null;
          }

          ws.send(JSON.stringify({ action: "mqtt_status", message: "Resolving MQTT username..." }));

          const userId = await getUserId(accessToken);
          const mqttUsername = `u_${userId}`; // cloud MQTT username format :contentReference[oaicite:1]{index=1}

          ws.send(JSON.stringify({ action: "mqtt_status", message: `Connecting as ${mqttUsername}...` }));

          mqttClient = mqtt.connect("mqtts://us.mqtt.bambulab.com:8883", {
            username: mqttUsername,
            password: accessToken,
            protocol: "mqtts",
            rejectUnauthorized: false, // dev
            keepalive: 30,
            reconnectPeriod: 2000,
          });

          mqttClient.on("connect", () => {
            ws.send(JSON.stringify({ action: "mqtt_connected", message: "Connected to MQTT broker" }));
          });

          mqttClient.on("error", (err) => {
            ws.send(JSON.stringify({ action: "mqtt_error", error: "MQTT connection error", details: err.message }));
          });

          mqttClient.on("close", () => {
            ws.send(JSON.stringify({ action: "mqtt_disconnected", message: "MQTT connection closed" }));
            ws.subscriptions = [];
          });

          mqttClient.on("reconnect", () => {
            ws.send(JSON.stringify({ action: "mqtt_status", message: "Reconnecting to MQTT broker" }));
          });

          mqttClient.on("message", (t, payload) => {
            // Send ONLY to this WS client (no leaking across clients)
            if (ws.readyState === WebSocket.OPEN && ws.subscriptions.includes(t)) {
              ws.send(JSON.stringify({ topic: t, message: payload.toString() }));
            }
          });

          return;
        }

        case "subscribe": {
          if (!mqttClient) {
            ws.send(JSON.stringify({ action: "mqtt_error", error: "MQTT not connected" }));
            return;
          }
          if (!topic) {
            ws.send(JSON.stringify({ error: "Missing topic" }));
            return;
          }

          mqttClient.subscribe(topic, (err) => {
            if (err) {
              ws.send(JSON.stringify({ action: "mqtt_error", error: "Subscription error", details: err.message }));
              return;
            }
            if (!ws.subscriptions.includes(topic)) ws.subscriptions.push(topic);

            ws.send(JSON.stringify({
              action: "subscriptions",
              message: `Subscribed to ${topic}`,
              topics: ws.subscriptions,
            }));
          });

          return;
        }

        case "unsubscribe": {
          if (!mqttClient) {
            ws.send(JSON.stringify({ action: "mqtt_error", error: "MQTT not connected" }));
            return;
          }
          if (!topic) {
            ws.send(JSON.stringify({ error: "Missing topic" }));
            return;
          }

          mqttClient.unsubscribe(topic, (err) => {
            if (err) {
              ws.send(JSON.stringify({ action: "mqtt_error", error: "Unsubscribe error", details: err.message }));
              return;
            }
            ws.subscriptions = ws.subscriptions.filter((sub) => sub !== topic);

            ws.send(JSON.stringify({
              action: "subscriptions",
              message: `Unsubscribed from ${topic}`,
              topics: ws.subscriptions,
            }));
          });

          return;
        }

        case "publish": {
          if (!mqttClient) {
            ws.send(JSON.stringify({ action: "mqtt_error", error: "MQTT not connected" }));
            return;
          }
          if (!id) {
            ws.send(JSON.stringify({ error: "Must provide id for publishing" }));
            return;
          }
          if (!command) {
            ws.send(JSON.stringify({ error: "Must provide a command for publishing" }));
            return;
          }

          const pubOptions = {
            qos: 1,
            retain: false,
            properties: {
              payloadFormatIndicator: true,
              contentType: "application/json",
            },
          };

          mqttClient.publish(`device/${id}/request`, JSON.stringify(command), pubOptions, (error) => {
            if (error) {
              ws.send(JSON.stringify({ error: "Error publishing request", details: error.message }));
            }
          });

          return;
        }

        case "disconnect": {
          if (mqttClient) {
            mqttClient.end(true);
            mqttClient = null;
          }
          ws.subscriptions = [];
          ws.send(JSON.stringify({ action: "mqtt_disconnected", message: "Disconnected from MQTT broker" }));
          return;
        }

        default:
          ws.send(JSON.stringify({ error: "Unknown action", action }));
          return;
      }
    } catch (e) {
      ws.send(JSON.stringify({ action: "server_error", error: String(e?.message || e) }));
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    if (mqttClient) mqttClient.end(true);
  });
});

console.log("WebSocket server is running on ws://localhost:8080");

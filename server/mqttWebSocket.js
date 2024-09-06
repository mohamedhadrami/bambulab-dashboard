const WebSocket = require("ws");
const mqtt = require("mqtt");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  let mqttClient;
  ws.subscriptions = []; // Initialize subscriptions list

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    const { id, action, username, password, topic, command } = data;

    if (action === "connect") {
      if (mqttClient) {
        mqttClient.end();
      }
      mqttClient = mqtt.connect("mqtts://us.mqtt.bambulab.com", {
        port: 8883,
        username: username,
        password: password,
        protocol: "mqtts",
        rejectUnauthorized: false,
      });

      mqttClient.on("connect", () => {
        console.log("Connected to MQTT broker");
        ws.send(
          JSON.stringify({
            action: "mqtt_connected",
            message: "Connected to MQTT broker",
          })
        );
      });

      mqttClient.on("error", (err) => {
        console.error("MQTT connection error:", err);
        ws.send(
          JSON.stringify({
            error: "MQTT connection error",
            details: err.message,
          })
        );
      });

      mqttClient.on("message", (topic, message) => {
        wss.clients.forEach((client) => {
          if (
            client.subscriptions.includes(topic) &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(JSON.stringify({ topic, message: message.toString() }));
          }
        });
      });

      mqttClient.on("close", () => {
        console.log("MQTT connection closed");
        ws.send(
          JSON.stringify({
            action: "mqtt_disconnected",
            message: "MQTT connection closed",
          })
        );
      });

      mqttClient.on("reconnect", () => {
        console.log("Reconnecting to MQTT broker");
        ws.send(JSON.stringify({ message: "Reconnecting to MQTT broker" }));
      });
    }

    if (action === "subscribe") {
      if (mqttClient) {
        mqttClient.subscribe(topic, (err) => {
          if (err) {
            console.error(`Subscription error: ${err}`);
            ws.send(
              JSON.stringify({
                error: "Subscription error",
                details: err.message,
              })
            );
          } else {
            console.log(`Subscribed to topic ${topic}`);
            if (!ws.subscriptions.includes(topic)) {
              ws.subscriptions.push(topic);
            }
            ws.send(
              JSON.stringify({
                action: "subscriptions",
                message: `Subscribed to topic ${topic}`,
                topics: ws.subscriptions,
              })
            );
          }
        });
      }
    }

    if (action === "unsubscribe") {
      if (mqttClient) {
        mqttClient.unsubscribe(topic, (err) => {
          if (err) {
            console.error(`Unsubscribe error: ${err}`);
            ws.send(
              JSON.stringify({
                error: "Unsubscribe error",
                details: err.message,
              })
            );
          } else {
            console.log(`Unsubscribed from topic ${topic}`);
            ws.subscriptions = ws.subscriptions.filter((sub) => sub !== topic);
            ws.send(
              JSON.stringify({
                action: "subscriptions",
                message: `Unsubscribed from topic ${topic}`,
                topics: ws.subscriptions,
              })
            );
          }
        });
      }
    }

    if (action === "disconnect") {
      if (mqttClient) {
        mqttClient.end();
        console.log("Disconnected from MQTT broker");
        ws.send(JSON.stringify({ message: "Disconnected from MQTT broker" }));
      }
    }

    if (action === "publish") {
      if (mqttClient) {
        if (id) {
          if (command) {
            const pubOptions = {
              qos: 1,
              retain: false,
              properties: {
                payloadFormatIndicator: true,
                contentType: "application/json",
              },
            };
            mqttClient.publish(
              `device/${id}/request`,
              JSON.stringify(command),
              pubOptions,
              function (error) {
                if (error) {
                  console.error("Error publishing request:", error);
                  ws.send(
                    JSON.stringify({
                      message: `Error publishing request: ${error}`,
                    })
                  );
                }
              }
            );
          } else {
            ws.send(
              JSON.stringify({
                message: "Must provide a command for publishing",
              })
            );
          }
        }
      } else {
        ws.send(
          JSON.stringify({
            message: "Must provide id for publishing",
          })
        );
      }
    } else {
      ws.send(
        JSON.stringify({
          message: "MQTT Client not setup and/or connected",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
    if (mqttClient) {
      mqttClient.end();
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");

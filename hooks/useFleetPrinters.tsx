// @/hooks/useFleetPrinters.ts

"use client";

import { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { printPushStatus } from "@/services/bambuMqtt";
import type { BambuDevice } from "@/types/bambuApi/bambuApi";
import type { FleetPrinterState, FleetStats } from "@/types/fleet";
import {
  extractFlags,
  getDevIdFromTopic,
  getHmsModule,
  getHmsSeverity,
  isDoorOpenFromHomeFlag,
  isLowWifi,
  numberOrUndefined,
  wikiUrl,
} from "@/services/utils";

const OFFLINE_MS = 60_000;

// You said you get full snapshots ~ every 15s.
// Stale should warn before we declare offline.
const STALE_MS = 30_000;

// “Stuck” should tolerate “percent not moving” for a while
// (some prints stay at the same percent for a few minutes).
const STUCK_MS = 10 * 60_000;

// Paused too long is a “hey, check this” signal
const PAUSED_TOO_LONG_MS = 10 * 60_000;

// Temp deltas from target while printing (heuristics; tune later)
const NOZZLE_DELTA_WARN = 25; // °C below target
const BED_DELTA_WARN = 10;    // °C below target

function classifyGcode(gcodeRaw: unknown) {
  const g = String(gcodeRaw ?? "").toUpperCase();

  const isPaused = g.includes("PAUSE");

  const isPrinting =
    g.includes("PRINT") ||
    g.includes("RUN") ||
    g.includes("WORK") ||
    g.includes("HEATING") ||
    g.includes("CALIB");

  const isIdle = !isPrinting && !isPaused;

  return { gcodeUpper: g, isPrinting, isPaused, isIdle };
}

function worstSeverityFromSummaries(
  summaries: { severity: string }[]
): FleetPrinterState["hmsWorst"] {
  // Your constants map will decide exact labels; we normalize loosely.
  // Priority: fatal > error > warning > info
  let worst: FleetPrinterState["hmsWorst"] = "info";

  for (const s of summaries) {
    const sev = String(s.severity ?? "").toLowerCase();
    if (sev.includes("fatal")) return "fatal";
    if (sev.includes("error")) worst = worst === "fatal" ? worst : "error";
    else if (sev.includes("warn")) worst = ["fatal", "error"].includes(String(worst)) ? worst : "warning";
  }
  return worst;
}

export function useFleetPrinters() {
  const [printers, setPrinters] = useState<BambuDevice[]>([]);
  const [fleet, setFleet] = useState<Record<string, FleetPrinterState>>({});

  const { subscribe, publish, latestMessage, subscribedTopics, isMqttConnected } = useWebSocket();

  // Fetch printers list
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/bambulab/printers");
      if (res.ok) {
        const data = await res.json();
        setPrinters(data.data.devices ?? []);
      }
    };
    fetchData();
  }, []);

  // Subscribe to all printers + push initial status
  useEffect(() => {
    if (!isMqttConnected) return;
    if (!printers?.length) return;

    for (const p of printers) {
      const reportTopic = `device/${p.dev_id}/report`;
      const requestTopic = `device/${p.dev_id}/request`;

      if (!subscribedTopics.includes(reportTopic) || !subscribedTopics.includes(requestTopic)) {
        subscribe(p.dev_id);
      }

      publish(p.dev_id, printPushStatus());
    }
  }, [isMqttConnected, printers, subscribe, publish, subscribedTopics]);

  // Update fleet map from live reports
  useEffect(() => {
    if (!latestMessage?.topic) return;

    const devId = getDevIdFromTopic(latestMessage.topic);
    if (!devId) return;

    if (!latestMessage.topic.endsWith("/report")) return;

    const print = latestMessage.data?.print;
    if (!print) return;

    setFleet((prev) => {
      const prior = prev[devId];
      const now = Date.now();

      // Extract core fields (may be missing on partial reports)
      const nextGcode = print.gcode_state ?? prior?.gcodeState;
      const nextPercent = numberOrUndefined(print.mc_percent ?? print.percent) ?? prior?.percent;
      const nextRemaining =
        numberOrUndefined(print.mc_remaining_time ?? print.remain_time) ?? prior?.remainingMin;

      const wifiSignal = (typeof print.wifi_signal === "string" ? print.wifi_signal : prior?.wifiSignal);

      const nozzleTemp = numberOrUndefined(print.nozzle_temper) ?? prior?.nozzleTemp;
      const bedTemp = numberOrUndefined(print.bed_temper) ?? prior?.bedTemp;

      const nozzleTargetTemp = numberOrUndefined(print.nozzle_target_temper) ?? prior?.nozzleTargetTemp;
      const bedTargetTemp = numberOrUndefined(print.bed_target_temper) ?? prior?.bedTargetTemp;

      const nozzleDiameter = numberOrUndefined(print.nozzle_diameter) ?? prior?.nozzleDiameter;

      const hmsArr = Array.isArray(print.hms) ? print.hms : null;
      const hmsCount = hmsArr ? hmsArr.length : (prior?.hmsCount ?? 0);

      const doorOpen =
        typeof print.home_flag === "number"
          ? isDoorOpenFromHomeFlag(extractFlags(print.home_flag))
          : (prior?.doorOpen ?? false);

      const { isPrinting, isPaused } = classifyGcode(nextGcode);

      // Track change timestamps for “stuck” and “paused too long”
      const percentChanged =
        typeof nextPercent === "number" &&
        typeof prior?.percent === "number" &&
        nextPercent !== prior.percent;

      const remainingChanged =
        typeof nextRemaining === "number" &&
        typeof prior?.remainingMin === "number" &&
        nextRemaining !== prior.remainingMin;

      const gcodeChanged = (prior?.gcodeState ?? "") !== (nextGcode ?? "");

      const lastPercentAt = percentChanged ? now : (prior?.lastPercentAt ?? now);
      const lastRemainingAt = remainingChanged ? now : (prior?.lastRemainingAt ?? now);
      const lastGcodeAt = gcodeChanged ? now : (prior?.lastGcodeAt ?? now);

      // Stale = the stream is late (warning), Offline = computed later for stats (hard down)
      const stale = now - (prior?.lastSeen ?? now) > STALE_MS;

      // Stuck = printing but neither percent nor remaining time has moved for a while
      const stuck =
        Boolean(isPrinting) &&
        typeof lastPercentAt === "number" &&
        typeof lastRemainingAt === "number" &&
        (now - lastPercentAt > STUCK_MS) &&
        (now - lastRemainingAt > STUCK_MS);

      const wifiLow = typeof wifiSignal === "string" ? isLowWifi(wifiSignal) : false;

      // Better temp risk: compare actual vs target when targets exist
      const nozzleTooLow =
        Boolean(isPrinting) &&
        typeof nozzleTemp === "number" &&
        typeof nozzleTargetTemp === "number" &&
        nozzleTemp < nozzleTargetTemp - NOZZLE_DELTA_WARN;

      const bedTooLow =
        Boolean(isPrinting) &&
        typeof bedTemp === "number" &&
        typeof bedTargetTemp === "number" &&
        bedTemp < bedTargetTemp - BED_DELTA_WARN;

      const tempMissingWhilePrinting =
        Boolean(isPrinting) &&
        (typeof nozzleTemp !== "number" || typeof bedTemp !== "number");

      // Job / layers
      const jobName = typeof print.subtask_name === "string" ? print.subtask_name : prior?.jobName;
      const layerNum = numberOrUndefined(print.layer_num) ?? prior?.layerNum;
      const totalLayerNum = numberOrUndefined(print.total_layer_num) ?? prior?.totalLayerNum;

      // AMS summary (safe against partial payloads)
      let ams: FleetPrinterState["ams"] = prior?.ams;
      if (print.ams) {
        const existsBits = String(print.ams.ams_exist_bits ?? "");
        const exists = existsBits !== "" ? existsBits !== "0" : prior?.ams?.exists;

        const trayNow = typeof print.ams.tray_now === "string" ? print.ams.tray_now : prior?.ams?.trayNow;

        // Resolve active tray details
        let active = prior?.ams?.active;
        const amsList = Array.isArray(print.ams.ams) ? print.ams.ams : null;

        if (amsList && typeof trayNow === "string") {
          // tray_now is a tray id (0-3). Assume AMS id "0" unless we find otherwise.
          // Many farms use a single AMS; if you have multiple, we can improve selection later.
          const ams0 = amsList.find((a: any) => String(a?.id) === "0") ?? amsList[0];
          const trays = Array.isArray(ams0?.tray) ? ams0.tray : null;
          const tray = trays ? trays.find((t: any) => String(t?.id) === String(trayNow)) : null;

          if (tray) {
            active = {
              amsId: String(ams0?.id ?? "0"),
              trayId: String(tray?.id ?? trayNow),
              trayType: typeof tray?.tray_type === "string" ? tray.tray_type : undefined,
              trayColor: typeof tray?.tray_color === "string" ? tray.tray_color : undefined,
              trayInfoIdx: typeof tray?.tray_info_idx === "string" ? tray.tray_info_idx : undefined,
            };
          }
        }

        const humidity = numberOrUndefined(
          (Array.isArray(print.ams.ams) && print.ams.ams[0]?.humidity) ?? undefined
        ) ?? prior?.ams?.humidity;

        const amsTemp = numberOrUndefined(
          (Array.isArray(print.ams.ams) && print.ams.ams[0]?.temp) ?? undefined
        ) ?? prior?.ams?.temp;

        ams = {
          exists,
          trayNow,
          active,
          humidity,
          temp: amsTemp,
        };
      }

      // HMS summary (optional, but uses your helpers)
      let hmsSummary: FleetPrinterState["hmsSummary"] = prior?.hmsSummary;
      let hmsWorst: FleetPrinterState["hmsWorst"] = prior?.hmsWorst;

      if (hmsArr) {
        const summaries = hmsArr
          .map((h: any) => {
            const attr = numberOrUndefined(h?.attr) ?? 0;
            const code = numberOrUndefined(h?.code) ?? 0;
            if (!attr || !code) return null;

            const module = getHmsModule(attr);
            const severity = getHmsSeverity(code);
            const url = wikiUrl(attr, code);

            return { module: String(module), severity: String(severity), url };
          })
          .filter(Boolean) as { module: string; severity: string; url?: string }[];

        hmsSummary = summaries;
        hmsWorst = worstSeverityFromSummaries(summaries);
      }

      // Issues & severity
      const issues: string[] = [];

      // Offline is NOT decided here; this is live message handling.
      // We treat stale separately and show offline in stats by lastSeen threshold.

      if (!prior) issues.push("New");
      if (stale) issues.push("Stale");
      if (stuck) issues.push("Stuck");

      if (hmsCount > 0) issues.push("HMS");

      if (doorOpen && isPrinting) issues.push("Door open");

      if (wifiLow) issues.push(isPrinting ? "Low Wi-Fi (printing)" : "Low Wi-Fi");

      if (nozzleTooLow) issues.push("Nozzle low");
      if (bedTooLow) issues.push("Bed low");
      if (!nozzleTooLow && !bedTooLow && tempMissingWhilePrinting) issues.push("Temps missing");

      const pausedTooLong = Boolean(isPaused) && (now - lastGcodeAt > PAUSED_TOO_LONG_MS);
      if (pausedTooLong) issues.push("Paused long");

      // Severity rules
      // crit: stuck, HMS error-ish (we only know count/worst), door open while printing
      // warn: stale, low wifi (esp printing), paused too long, temp anomalies
      // ok: none
      let severity: FleetPrinterState["severity"] = "ok";

      const hmsCrit = hmsCount > 0 && (hmsWorst === "fatal" || hmsWorst === "error");
      const hmsWarn = hmsCount > 0 && !hmsCrit;

      if (stuck || (doorOpen && isPrinting) || hmsCrit) severity = "crit";
      else if (stale || wifiLow || pausedTooLong || nozzleTooLow || bedTooLow || tempMissingWhilePrinting || hmsWarn)
        severity = "warn";

      return {
        ...prev,
        [devId]: {
          lastSeen: now,

          gcodeState: nextGcode,
          percent: nextPercent,
          remainingMin: nextRemaining,

          wifiSignal,
          hmsCount,
          doorOpen,

          nozzleTemp,
          bedTemp,
          nozzleTargetTemp,
          bedTargetTemp,
          nozzleDiameter,

          jobName,
          layerNum,
          totalLayerNum,

          ams,
          hmsSummary,
          hmsWorst,

          lastPercentAt,
          lastRemainingAt,
          lastGcodeAt,

          stale,
          stuck,
          severity,
          issues,
        },
      };
    });
  }, [latestMessage]);

  const stats: FleetStats = useMemo(() => {
    const now = Date.now();

    const total = printers.length;
    let online = 0;
    let offline = 0;

    let printing = 0;
    let paused = 0;
    let idle = 0;

    let needsAttention = 0;
    let hmsIssues = 0;
    let lowWifi = 0;
    let doorOpen = 0;

    let stale = 0;
    let stuck = 0;
    let printingWithLowWifi = 0;
    let doorOpenWhilePrinting = 0;

    const nozzleTemps: number[] = [];
    const bedTemps: number[] = [];

    for (const p of printers) {
      const s = fleet[p.dev_id];
      const isOnline = s ? now - s.lastSeen <= OFFLINE_MS : Boolean(p.online);

      if (isOnline) online++;
      else offline++;

      const { isPrinting, isPaused, isIdle } = classifyGcode(s?.gcodeState ?? p.print_status);

      if (isPrinting) printing++;
      else if (isPaused) paused++;
      else if (isOnline && isIdle) idle++;

      const hasHms = (s?.hmsCount ?? 0) > 0;
      const hasLowWifi = s?.wifiSignal ? isLowWifi(s.wifiSignal) : false;
      const isDoorOpen = Boolean(s?.doorOpen);

      if (hasHms) hmsIssues++;
      if (hasLowWifi) lowWifi++;
      if (isDoorOpen) doorOpen++;

      const isStale = Boolean(s && now - s.lastSeen > STALE_MS && now - s.lastSeen <= OFFLINE_MS);
      if (isStale) stale++;

      const isStuck = Boolean(s?.stuck);
      if (isStuck) stuck++;

      if (isPrinting && hasLowWifi) printingWithLowWifi++;
      if (isPrinting && isDoorOpen) doorOpenWhilePrinting++;

      const hasAttention =
        !isOnline ||
        isStale ||
        isStuck ||
        hasHms ||
        (isDoorOpen && isPrinting) ||
        hasLowWifi;

      if (hasAttention) needsAttention++;

      if (typeof s?.nozzleTemp === "number") nozzleTemps.push(s.nozzleTemp);
      if (typeof s?.bedTemp === "number") bedTemps.push(s.bedTemp);
    }

    const printingStates = printers
      .map((p) => ({ p, s: fleet[p.dev_id] }))
      .filter(({ p, s }) => {
        const { isPrinting } = classifyGcode(s?.gcodeState ?? p.print_status);
        return isPrinting;
      });

    const printingPercents = printingStates
      .map(({ s }) => s?.percent)
      .filter((v): v is number => typeof v === "number");

    const avgPercent =
      printingPercents.length > 0
        ? Math.round(printingPercents.reduce((a, b) => a + b, 0) / printingPercents.length)
        : 0;

    const remainingList = printingStates
      .map(({ s }) => s?.remainingMin)
      .filter((v): v is number => typeof v === "number" && v >= 0)
      .sort((a, b) => a - b);

    const soonestMin = remainingList.length ? remainingList[0] : null;

    const avgNozzle =
      nozzleTemps.length > 0 ? Math.round(nozzleTemps.reduce((a, b) => a + b, 0) / nozzleTemps.length) : null;

    const avgBed =
      bedTemps.length > 0 ? Math.round(bedTemps.reduce((a, b) => a + b, 0) / bedTemps.length) : null;

    const utilizationPct = total > 0 ? Math.round((printing / total) * 100) : 0;
    const connectivityPct = total > 0 ? Math.round((online / total) * 100) : 0;

    return {
      total,
      online,
      offline,

      printing,
      paused,
      idle,

      utilizationPct,
      connectivityPct,

      avgPercent,
      soonestMin,

      needsAttention,
      hmsIssues,
      lowWifi,
      doorOpen,

      avgNozzle,
      avgBed,

      stale,
      stuck,
      printingWithLowWifi,
      doorOpenWhilePrinting,
    };
  }, [printers, fleet]);

  return { printers, fleet, stats };
}

export { OFFLINE_MS };

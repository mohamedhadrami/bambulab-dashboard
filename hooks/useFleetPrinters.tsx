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
  isDoorOpenFromHomeFlag,
  isLowWifi,
  numberOrUndefined,
} from "@/services/utils";

const OFFLINE_MS = 60_000;

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

    setFleet((prev) => ({
      ...prev,
      [devId]: {
        lastSeen: Date.now(),
        gcodeState: print.gcode_state,
        percent: numberOrUndefined(print.mc_percent),
        remainingMin: numberOrUndefined(print.mc_remaining_time),
        wifiSignal: print.wifi_signal,
        hmsCount: Array.isArray(print.hms) ? print.hms.length : 0,
        doorOpen: Boolean(print.home_flag && isDoorOpenFromHomeFlag(extractFlags(print.home_flag))),
        nozzleTemp: numberOrUndefined(print.nozzle_temper),
        bedTemp: numberOrUndefined(print.bed_temper),
      },
    }));
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

    const nozzleTemps: number[] = [];
    const bedTemps: number[] = [];

    for (const p of printers) {
      const s = fleet[p.dev_id];
      const isOnline = s ? now - s.lastSeen <= OFFLINE_MS : Boolean(p.online);

      if (isOnline) online++;
      else offline++;

      const gcode = (s?.gcodeState ?? p.print_status ?? "").toUpperCase();

      const isPaused = gcode.includes("PAUSE");
      const isPrinting =
        gcode.includes("PRINT") ||
        gcode.includes("RUN") ||
        gcode.includes("WORK") ||
        gcode.includes("HEATING") ||
        gcode.includes("CALIB");

      const isIdle = isOnline && !isPrinting && !isPaused;

      if (isPrinting) printing++;
      else if (isPaused) paused++;
      else if (isIdle) idle++;

      const hasHms = (s?.hmsCount ?? 0) > 0;
      const hasLowWifi = s?.wifiSignal ? isLowWifi(s.wifiSignal) : false;
      const isDoorOpen = Boolean(s?.doorOpen);

      if (hasHms) hmsIssues++;
      if (hasLowWifi) lowWifi++;
      if (isDoorOpen) doorOpen++;

      if (hasHms || hasLowWifi || isDoorOpen) needsAttention++;

      if (typeof s?.nozzleTemp === "number") nozzleTemps.push(s.nozzleTemp);
      if (typeof s?.bedTemp === "number") bedTemps.push(s.bedTemp);
    }

    const printingStates = printers
      .map((p) => ({ p, s: fleet[p.dev_id] }))
      .filter(({ p, s }) => {
        const g = (s?.gcodeState ?? p.print_status ?? "").toUpperCase();
        return g.includes("PRINT") || g.includes("RUN") || g.includes("WORK");
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
    };
  }, [printers, fleet]);

  return { printers, fleet, stats };
}

export { OFFLINE_MS };

// @/components/Printers/PrinterCard.tsx

"use client";

import React, { useMemo } from "react";
import { Card, CardBody, Chip, Image, Progress, Link } from "@heroui/react";
import type { BambuDevice } from "@/types/bambuApi/bambuApi";
import type { FleetPrinterState } from "@/types/fleet";
import { clamp, formatMinutes, getProductImageURL, isLowWifi } from "@/services/utils";
import { OFFLINE_MS } from "@/hooks/useFleetPrinters";

function formatAge(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

function severityToBorder(sev?: FleetPrinterState["severity"]) {
  if (sev === "crit") return "border-danger-500/60";
  if (sev === "warn") return "border-warning-500/60";
  return "border-transparent";
}

export default function PrinterCard({ printer, state }: { printer: BambuDevice; state?: FleetPrinterState }) {
  const now = Date.now();

  const gcode = (state?.gcodeState ?? printer.print_status ?? "").toUpperCase();
  const isPrinting =
    gcode.includes("PRINT") || gcode.includes("RUN") || gcode.includes("WORK") || gcode.includes("HEATING") || gcode.includes("CALIB");
  const isPaused = gcode.includes("PAUSE");
  const isOnline = state ? now - state.lastSeen <= OFFLINE_MS : Boolean(printer.online);

  const wifiLabel = state?.wifiSignal ? state.wifiSignal : "—";
  const wifiLow = state?.wifiSignal ? isLowWifi(state.wifiSignal) : false;

  const hmsCount = state?.hmsCount ?? 0;
  const doorOpen = Boolean(state?.doorOpen);
  const isStuck = Boolean(state?.stuck);
  const isStale = Boolean(state?.stale);

  const jobName = state?.jobName?.trim() || null;
  const layerText =
    typeof state?.layerNum === "number" && typeof state?.totalLayerNum === "number"
      ? `${state.layerNum}/${state.totalLayerNum} layers`
      : null;

  const nozzleTemp = typeof state?.nozzleTemp === "number" ? Math.round(state.nozzleTemp) : null;
  const bedTemp = typeof state?.bedTemp === "number" ? Math.round(state.bedTemp) : null;

  const nozzleTarget = typeof state?.nozzleTargetTemp === "number" ? Math.round(state.nozzleTargetTemp) : null;
  const bedTarget = typeof state?.bedTargetTemp === "number" ? Math.round(state.bedTargetTemp) : null;

  const nozzleDelta = useMemo(() => {
    if (nozzleTemp === null || nozzleTarget === null) return null;
    return nozzleTemp - nozzleTarget;
  }, [nozzleTemp, nozzleTarget]);

  const bedDelta = useMemo(() => {
    if (bedTemp === null || bedTarget === null) return null;
    return bedTemp - bedTarget;
  }, [bedTemp, bedTarget]);

  const tempWarn =
    isPrinting &&
    ((nozzleDelta !== null && nozzleDelta < -25) || (bedDelta !== null && bedDelta < -10) || (nozzleTemp === null || bedTemp === null));

  const amsExists = state?.ams?.exists;
  const amsActive = state?.ams?.active;
  const amsHumidity = typeof state?.ams?.humidity === "number" ? state.ams!.humidity : null;

  const lastSeenAge = state ? formatAge(now - state.lastSeen) : null;

  const statusChip = !isOnline
    ? { text: "Offline", color: "danger" as const }
    : isPaused
    ? { text: "Paused", color: "warning" as const }
    : isPrinting
    ? { text: "Printing", color: "success" as const }
    : { text: "Idle", color: "default" as const };

  const borderClass = severityToBorder(state?.severity);

  const issues = state?.issues ?? [];

  return (
    <Link href={`/printers/${printer.dev_id}`}>
      <Card
        radius="sm"
        className={`
          bg-gradient-to-br
          from-primary-300 to-primary-400
          dark:from-primary-700 dark:to-primary-900
          w-full
          border
          ${borderClass}
        `}
      >
        <CardBody className="gap-3 p-4">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <p className="font-extralight text-xl truncate">{printer.name}</p>
              {jobName && (
                <p className="text-tiny text-foreground-400 truncate">
                  {jobName}
                  {layerText ? ` • ${layerText}` : ""}
                </p>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Chip size="sm" variant="flat" color={statusChip.color}>
                {statusChip.text}
              </Chip>

              {/* last seen */}
              {isOnline && lastSeenAge && (
                <Chip size="sm" variant="flat" color={isStale ? "warning" : "default"}>
                  Seen {lastSeenAge}
                </Chip>
              )}

              {/* Online dot */}
              <div className="relative">
                <div
                  className={`rounded-full h-2 w-2 m-1 animate-ping absolute ${isOnline ? "bg-green-500" : "bg-red-500"}`}
                />
                <div className={`rounded-full h-2 w-2 m-1 relative ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            </div>
          </div>

          {/* Identity row */}
          <div className="flex items-center gap-3">
            <Image
              src={getProductImageURL(printer.dev_product_name)}
              alt={printer.dev_product_name}
              className="w-16 h-16 object-contain"
            />
            <div className="min-w-0">
              <p className="font-semibold">{printer.dev_product_name}</p>
              <p className="text-foreground-400 hidden-text reveal-text truncate">{printer.dev_id}</p>

              {/* Health chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Chip size="sm" variant="flat" color={wifiLow ? "warning" : "default"}>
                  Wi-Fi {wifiLabel}
                </Chip>

                <Chip size="sm" variant="flat" color={hmsCount > 0 ? "danger" : "default"}>
                  HMS {hmsCount}
                </Chip>

                {doorOpen && (
                  <Chip size="sm" variant="flat" color={isPrinting ? "danger" : "warning"}>
                    Door open
                  </Chip>
                )}

                {isStuck && (
                  <Chip size="sm" variant="flat" color="danger">
                    Stuck
                  </Chip>
                )}

                {tempWarn && (
                  <Chip size="sm" variant="flat" color="warning">
                    Temp
                  </Chip>
                )}

                {/* Temps (show target if present) */}
                {(nozzleTemp !== null || nozzleTarget !== null) && (
                  <Chip size="sm" variant="flat">
                    Nozzle {nozzleTemp ?? "—"}°{nozzleTarget !== null ? ` / ${nozzleTarget}°` : ""}
                  </Chip>
                )}

                {(bedTemp !== null || bedTarget !== null) && (
                  <Chip size="sm" variant="flat">
                    Bed {bedTemp ?? "—"}°{bedTarget !== null ? ` / ${bedTarget}°` : ""}
                  </Chip>
                )}

                {/* AMS */}
                {amsExists !== undefined && (
                  <Chip size="sm" variant="flat" color={amsExists ? "default" : "warning"}>
                    {amsExists ? "AMS" : "No AMS"}
                  </Chip>
                )}

                {amsActive?.trayId && (
                  <Chip size="sm" variant="flat">
                    Tray {amsActive.trayId}
                    {amsActive.trayType ? ` • ${amsActive.trayType}` : ""}
                  </Chip>
                )}

                {amsHumidity !== null && (
                  <Chip size="sm" variant="flat">
                    Humidity {amsHumidity}
                  </Chip>
                )}
              </div>

              {/* Extra issues row if you want all computed labels visible */}
              {issues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {issues.slice(0, 5).map((x) => (
                    <Chip
                      key={x}
                      size="sm"
                      variant="flat"
                      color={x === "Stuck" || x === "HMS" ? "danger" : x === "Stale" ? "warning" : "default"}
                    >
                      {x}
                    </Chip>
                  ))}
                  {issues.length > 5 && (
                    <Chip size="sm" variant="flat">
                      +{issues.length - 5}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {(isPrinting || isPaused) && (typeof state?.percent === "number" || typeof state?.remainingMin === "number") && (
            <div className="mt-1">
              <div className="flex justify-between text-tiny text-foreground-400 mb-1">
                <span className="truncate">{state?.gcodeState ?? printer.print_status}</span>
                <span className="shrink-0">
                  {typeof state?.remainingMin === "number" ? formatMinutes(state.remainingMin) : "—"}
                </span>
              </div>

              <Progress
                aria-label="Print progress"
                size="sm"
                value={typeof state?.percent === "number" ? clamp(state.percent, 0, 100) : undefined}
                isIndeterminate={typeof state?.percent !== "number"}
                showValueLabel={typeof state?.percent === "number"}
                className="max-w-full"
              />
            </div>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}

// @/components/Printers/PrinterCard.tsx

"use client";

import React from "react";
import { Card, CardBody, Chip, Image, Progress, Link } from "@heroui/react";
import type { BambuDevice } from "@/types/bambuApi/bambuApi";
import type { FleetPrinterState } from "@/types/fleet";
import { clamp, formatMinutes, getProductImageURL, isLowWifi } from "@/services/utils";
import { OFFLINE_MS } from "@/hooks/useFleetPrinters";

export default function PrinterCard({ printer, state }: { printer: BambuDevice; state?: FleetPrinterState }) {
  const gcode = (state?.gcodeState ?? printer.print_status ?? "").toUpperCase();
  const isPrinting = gcode.includes("PRINT") || gcode.includes("RUN") || gcode.includes("WORK");
  const isPaused = gcode.includes("PAUSE");

  const wifiLabel = state?.wifiSignal ? state.wifiSignal : "—";
  const wifiLow = state?.wifiSignal ? isLowWifi(state.wifiSignal) : false;
  const hmsCount = state?.hmsCount ?? 0;

  const isOnline = state ? Date.now() - state.lastSeen <= OFFLINE_MS : Boolean(printer.online);

  const statusChip = !isOnline
    ? { text: "Offline", color: "danger" as const }
    : isPaused
    ? { text: "Paused", color: "warning" as const }
    : isPrinting
    ? { text: "Printing", color: "success" as const }
    : { text: "Idle", color: "default" as const };

  return (
    <Link href={`/printers/${printer.dev_id}`}>
      <Card
        className="
          bg-gradient-to-br
          from-primary-300 to-primary-400
          dark:from-primary-700 dark:to-primary-900
          w-full"
        radius="sm"
      >
        <CardBody className="gap-3 p-4">
          <div className="flex items-center">
            <p className="font-extralight text-xl">{printer.name}</p>
            <div className="ml-auto flex items-center gap-2">
              <Chip size="sm" variant="flat" color={statusChip.color}>
                {statusChip.text}
              </Chip>
              <div className="relative">
                <div className={`rounded-full h-2 w-2 m-1 animate-ping absolute ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                <div className={`rounded-full h-2 w-2 m-1 relative ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Image src={getProductImageURL(printer.dev_product_name)} alt={printer.dev_product_name} className="w-16 h-16 object-contain" />
            <div className="min-w-0">
              <p className="font-semibold">{printer.dev_product_name}</p>
              <p className="text-foreground-400 hidden-text reveal-text truncate">{printer.dev_id}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                <Chip size="sm" variant="flat" color={wifiLow ? "warning" : "default"}>
                  Wi-Fi {wifiLabel}
                </Chip>

                <Chip size="sm" variant="flat" color={hmsCount > 0 ? "danger" : "default"}>
                  HMS {hmsCount}
                </Chip>

                {typeof state?.nozzleTemp === "number" && (
                  <Chip size="sm" variant="flat">
                    Nozzle {Math.round(state.nozzleTemp)}°C
                  </Chip>
                )}

                {typeof state?.bedTemp === "number" && (
                  <Chip size="sm" variant="flat">
                    Bed {Math.round(state.bedTemp)}°C
                  </Chip>
                )}
              </div>
            </div>
          </div>

          {(isPrinting || isPaused) &&
            (typeof state?.percent === "number" || typeof state?.remainingMin === "number") && (
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

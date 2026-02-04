// @/components/Printers/FleetSummary.tsx
// Change layout to a vertical stack for the left rail (responsive -> stacks nicely on mobile)

"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip, Progress } from "@nextui-org/react";
import type { FleetStats } from "@/types/fleet";
import { formatMinutes } from "@/services/utils";

export default function FleetSummary({ stats, mqttSeen }: { stats: FleetStats; mqttSeen: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
      {/* Utilization */}
      <Card
        isFooterBlurred
        radius="lg"
        className="bg-gradient-to-br from-primary-300 to-primary-400
          dark:from-primary-800 dark:to-primary-900 border border-primary-600"
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <p className="text-md">Utilization</p>
          <Chip size="sm" variant="flat">
            {stats.utilizationPct}% printing
          </Chip>
        </CardHeader>
        <CardBody className="px-6 py-4 gap-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-tiny text-foreground-400">Printing now</p>
              <p className="text-4xl">{stats.printing}</p>
            </div>
            <div className="text-right">
              <p className="text-tiny text-foreground-400">Avg progress</p>
              <p className="text-2xl">{stats.printing > 0 ? `${stats.avgPercent}%` : "—"}</p>
            </div>
          </div>
          <div className="flex justify-between text-tiny text-foreground-400">
            <span>Idle {stats.idle}</span>
            <span>Paused {stats.paused}</span>
            <span>Next {typeof stats.soonestMin === "number" ? formatMinutes(stats.soonestMin) : "—"}</span>
          </div>
          <Progress aria-label="Fleet utilization" size="sm" value={stats.utilizationPct} showValueLabel className="max-w-full" />
        </CardBody>
      </Card>

      {/* Connectivity */}
      <Card
        isFooterBlurred
        radius="lg"
        className="bg-gradient-to-br from-primary-300 to-primary-400
          dark:from-primary-800 dark:to-primary-900 border border-primary-600"
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <p className="text-md">Connectivity</p>
          <Chip size="sm" variant="flat" color={stats.offline > 0 ? "danger" : "success"}>
            {stats.online}/{stats.total} online
          </Chip>
        </CardHeader>
        <CardBody className="px-6 py-4 gap-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-tiny text-foreground-400">Offline</p>
              <p className="text-4xl">{stats.offline}</p>
            </div>
            <div className="text-right">
              <p className="text-tiny text-foreground-400">Low Wi-Fi</p>
              <p className="text-2xl">{stats.lowWifi}</p>
            </div>
          </div>
          <div className="flex justify-between text-tiny text-foreground-400">
            <span>Total {stats.total}</span>
            <span>MQTT {mqttSeen}</span>
            <span>Online {stats.connectivityPct}%</span>
          </div>
          <Progress aria-label="Fleet connectivity" size="sm" value={stats.connectivityPct} showValueLabel className="max-w-full" />
        </CardBody>
      </Card>

      {/* Attention */}
      <Card
        isFooterBlurred
        radius="lg"
        className="bg-gradient-to-br from-primary-300 to-primary-400
          dark:from-primary-800 dark:to-primary-900 border border-primary-800"
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <p className="text-md">Attention</p>
          <div className="flex gap-2">
            <Chip size="sm" variant="flat" color={stats.hmsIssues > 0 ? "danger" : "default"}>
              HMS {stats.hmsIssues}
            </Chip>
            <Chip size="sm" variant="flat" color={stats.doorOpen > 0 ? "danger" : "default"}>
              Door {stats.doorOpen}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4 gap-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-tiny text-foreground-400">Needs attention</p>
              <p className="text-4xl">{stats.needsAttention}</p>
            </div>
            <div className="text-right">
              <p className="text-tiny text-foreground-400">Avg temps</p>
              <p className="text-2xl">
                {stats.avgNozzle !== null ? `${stats.avgNozzle}° / ${stats.avgBed ?? "—"}°` : "—"}
              </p>
            </div>
          </div>

          <div className="flex justify-between text-tiny text-foreground-400">
            <span>Wi-Fi {stats.lowWifi}</span>
            <span>HMS {stats.hmsIssues}</span>
            <span>Door {stats.doorOpen}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

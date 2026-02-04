// @/app/page.tsx

"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import FleetSummary from "@/components/Printer/FleetSummary";
import PrinterCard from "@/components/Printer/PrinterCard";
import { useFleetPrinters } from "@/hooks/useFleetPrinters";

const Page: React.FC = () => {
  const { printers, fleet, stats } = useFleetPrinters();

  return (
    <div className="w-full mx-auto px-3 md:px-6">
      {/* Split starts at lg now */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left rail */}
        <aside className="max-w-sm lg:col-span-4 xl:col-span-3 lg:sticky lg:top-4">
          <FleetSummary stats={stats} mqttSeen={Object.keys(fleet).length} />
        </aside>

        {/* Main area */}
        <main className="lg:col-span-8 xl:col-span-9">
          <Card
            className="
              bg-gradient-to-br
              from-primary-100 to-primary-300
              dark:from-primary-800 dark:to-primary-900"
          >
            <CardHeader className="flex items-center justify-between">
              <p className="text-lg font-bold">Active Printers</p>
              <p className="text-tiny text-foreground-400">
                {stats.online}/{stats.total} online • {stats.printing} printing
              </p>
            </CardHeader>

            <CardBody
              className="
                grid grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-3
                gap-3"
            >
              {printers.map((printer) => (
                <PrinterCard
                  key={printer.dev_id}
                  printer={printer}
                  state={fleet[printer.dev_id]}
                />
              ))}
            </CardBody>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Page;

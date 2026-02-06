// @/types/fleet.ts

export type FleetPrinterState = {
  lastSeen: number;
  gcodeState?: string;
  percent?: number;
  remainingMin?: number;
  wifiSignal?: string;
  hmsCount?: number;
  doorOpen?: boolean;
  nozzleTemp?: number;
  bedTemp?: number;

  // existing history/derived
  lastPercentAt?: number;
  lastRemainingAt?: number;
  lastGcodeAt?: number;
  stuck?: boolean;
  stale?: boolean;
  severity?: "ok" | "warn" | "crit";
  issues?: string[];

  // NEW extracted fields
  jobName?: string;
  layerNum?: number;
  totalLayerNum?: number;

  nozzleTargetTemp?: number;
  bedTargetTemp?: number;
  nozzleDiameter?: number;

  // NEW AMS summary
  ams?: {
    exists?: boolean;
    trayNow?: string; // "2" etc
    active?: {
      amsId?: string;      // "0"
      trayId?: string;     // "2"
      trayType?: string;   // "ABS"
      trayColor?: string;  // "FFF144FF"
      trayInfoIdx?: string; // "GFB00"
    };
    humidity?: number;
    temp?: number;
  };

  // OPTIONAL but strongly recommended for “farm health”
  hmsWorst?: "info" | "warning" | "error" | "fatal";
  hmsSummary?: { module: string; severity: string; url?: string }[];
};


export type FleetStats = {
  total: number;
  online: number;
  offline: number;

  printing: number;
  paused: number;
  idle: number;

  utilizationPct: number;
  connectivityPct: number;

  avgPercent: number;
  soonestMin: number | null;

  needsAttention: number;
  hmsIssues: number;
  lowWifi: number;
  doorOpen: number;

  avgNozzle: number | null;
  avgBed: number | null;

  stale: number;
  stuck: number;
  printingWithLowWifi: number;
  doorOpenWhilePrinting: number;
};

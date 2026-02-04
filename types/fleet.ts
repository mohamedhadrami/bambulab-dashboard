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
};

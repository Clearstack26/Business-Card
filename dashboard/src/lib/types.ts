export type TrendPeriod = "7d" | "30d" | "90d" | "1y";

export type ScanEvent = {
  id: string;
  scanned_at: string;
  scan_date: string;
  source: string;
  session_id: string | null;
  device_type: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
};

export type DailyScan = {
  scan_date: string;
  total_scans: number;
  unique_sessions: number;
};

export type TrendPoint = {
  label: string;
  date: string;
  scans: number;
  cumulative: number;
};

export type DashboardStats = {
  today: number;
  week: number;
  total: number;
  uniqueToday: number;
  daily: DailyScan[];
  recent: ScanEvent[];
  trend: TrendPoint[];
  period: TrendPeriod;
  changePercent: number;
};

export const PERIOD_DAYS: Record<TrendPeriod, number> = {
  "7d": 6,
  "30d": 29,
  "90d": 89,
  "1y": 364,
};

export const PERIOD_LABELS: Record<TrendPeriod, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
};

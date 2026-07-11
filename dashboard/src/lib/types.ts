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

export type BreakdownSlice = {
  key: string;
  name: string;
  value: number;
  color: string;
};

export type DashboardStats = {
  today: number;
  week: number;
  total: number;
  uniqueToday: number;
  avgDaily: number;
  peakDay: { date: string; scans: number } | null;
  mobileShare: number;
  qrShare: number;
  bySource: BreakdownSlice[];
  byDevice: BreakdownSlice[];
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

export const SOURCE_COLORS: Record<string, string> = {
  qr: "#1affff",
  referral: "#7dd3fc",
  direct: "#94a3b8",
};

export const DEVICE_COLORS: Record<string, string> = {
  mobile: "#1affff",
  tablet: "#38bdf8",
  desktop: "#64748b",
  unknown: "#475569",
};

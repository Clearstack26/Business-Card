import { createClient } from "@supabase/supabase-js";
import type {
  BreakdownSlice,
  DailyScan,
  DashboardStats,
  ScanEvent,
  TrendPeriod,
  TrendPoint,
} from "./types";
import { DEVICE_COLORS, PERIOD_DAYS, SOURCE_COLORS } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => sessionStorage.getItem(key),
      setItem: (key, value) => sessionStorage.setItem(key, value),
      removeItem: (key) => sessionStorage.removeItem(key),
    },
  },
});

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysAgoUtc(days: number) {
  const d = startOfUtcDay();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function formatTrendLabel(dateStr: string, period: TrendPeriod) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (period === "1y") {
    return date.toLocaleDateString(undefined, { month: "short" });
  }
  if (period === "90d") {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

function buildTrendSeries(daily: DailyScan[], period: TrendPeriod): TrendPoint[] {
  const span = PERIOD_DAYS[period];
  const start = daysAgoUtc(span);
  const byDate = new Map(daily.map((row) => [row.scan_date, row.total_scans]));

  const points: TrendPoint[] = [];
  let cumulative = 0;

  for (let offset = span; offset >= 0; offset -= 1) {
    const date = daysAgoUtc(offset);
    if (date < start) continue;
    const scans = byDate.get(date) || 0;
    cumulative += scans;
    points.push({
      date,
      label: formatTrendLabel(date, period),
      scans,
      cumulative,
    });
  }

  return points;
}

function computeChangePercent(trend: TrendPoint[]) {
  if (trend.length < 2) return 0;
  const midpoint = Math.floor(trend.length / 2);
  const firstHalf = trend.slice(0, midpoint).reduce((sum, p) => sum + p.scans, 0);
  const secondHalf = trend.slice(midpoint).reduce((sum, p) => sum + p.scans, 0);
  if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
}

function sourceLabel(source: string) {
  if (source === "qr") return "QR scan";
  if (source === "referral") return "Referral";
  return "Direct";
}

function deviceLabel(device: string) {
  if (device === "mobile") return "Mobile";
  if (device === "tablet") return "Tablet";
  if (device === "desktop") return "Desktop";
  return "Unknown";
}

function buildBreakdown(
  rows: { key: string }[],
  labelFn: (key: string) => string,
  colorMap: Record<string, string>
): BreakdownSlice[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row.key || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, value]) => ({
      key,
      name: labelFn(key),
      value,
      color: colorMap[key] || "#64748b",
    }))
    .sort((a, b) => b.value - a.value);
}

export async function fetchDashboardStats(period: TrendPeriod = "30d"): Promise<DashboardStats> {
  const span = PERIOD_DAYS[period];
  const rangeStart = daysAgoUtc(span);
  const today = daysAgoUtc(0);
  const weekStart = daysAgoUtc(6);

  const [dailyRes, recentRes, periodRes] = await Promise.all([
    supabase
      .from("business_card_scans_by_day")
      .select("scan_date, total_scans, unique_sessions")
      .gte("scan_date", rangeStart)
      .order("scan_date", { ascending: true }),
    supabase
      .from("qr_scan_events")
      .select(
        "id, scanned_at, scan_date, source, session_id, device_type, country, city, referrer"
      )
      .order("scanned_at", { ascending: false })
      .limit(50),
    supabase
      .from("qr_scan_events")
      .select("source, device_type, scan_date")
      .gte("scan_date", rangeStart)
      .limit(5000),
  ]);

  if (dailyRes.error) throw dailyRes.error;
  if (recentRes.error) throw recentRes.error;
  if (periodRes.error) throw periodRes.error;

  const daily = (dailyRes.data || []) as DailyScan[];
  const recent = (recentRes.data || []) as ScanEvent[];
  const periodEvents = (periodRes.data || []) as {
    source: string | null;
    device_type: string | null;
    scan_date: string;
  }[];
  const trend = buildTrendSeries(daily, period);

  const todayRow = daily.find((row) => row.scan_date === today);
  const weekTotal = daily
    .filter((row) => row.scan_date >= weekStart)
    .reduce((sum, row) => sum + row.total_scans, 0);
  const totalAll = daily.reduce((sum, row) => sum + row.total_scans, 0);
  const activeDays = daily.filter((row) => row.total_scans > 0).length;
  const avgDaily = activeDays ? Math.round((totalAll / activeDays) * 10) / 10 : 0;

  let peakDay: { date: string; scans: number } | null = null;
  for (const row of daily) {
    if (!peakDay || row.total_scans > peakDay.scans) {
      peakDay = { date: row.scan_date, scans: row.total_scans };
    }
  }
  if (peakDay && peakDay.scans === 0) peakDay = null;

  const bySource = buildBreakdown(
    periodEvents.map((e) => ({ key: String(e.source || "direct").toLowerCase() })),
    sourceLabel,
    SOURCE_COLORS
  );
  const byDevice = buildBreakdown(
    periodEvents.map((e) => ({ key: String(e.device_type || "unknown").toLowerCase() })),
    deviceLabel,
    DEVICE_COLORS
  );

  const periodCount = periodEvents.length || 1;
  const mobileCount = periodEvents.filter(
    (e) => String(e.device_type || "").toLowerCase() === "mobile"
  ).length;
  const qrCount = periodEvents.filter(
    (e) => String(e.source || "").toLowerCase() === "qr"
  ).length;

  return {
    today: todayRow?.total_scans || 0,
    week: weekTotal,
    total: totalAll,
    uniqueToday: todayRow?.unique_sessions || 0,
    avgDaily,
    peakDay,
    mobileShare: Math.round((mobileCount / periodCount) * 100),
    qrShare: Math.round((qrCount / periodCount) * 100),
    bySource,
    byDevice,
    daily,
    recent,
    trend,
    period,
    changePercent: computeChangePercent(trend),
  };
}

export type { DailyScan, DashboardStats, ScanEvent, TrendPeriod, TrendPoint, BreakdownSlice };

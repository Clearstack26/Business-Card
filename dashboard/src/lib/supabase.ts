import { createClient } from "@supabase/supabase-js";
import type {
  BreakdownSlice,
  CardInteraction,
  DailyScan,
  DashboardStats,
  ScanEvent,
  TrendPeriod,
  TrendPoint,
} from "./types";
import { DEVICE_COLORS, PERIOD_DAYS, SOURCE_COLORS } from "./types";
import { businessDate, daysAgoBusiness, todayBusiness } from "./activity";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // localStorage so login survives closing the browser / device sleep.
    // Only Sign out clears the session.
    storage: localStorage,
  },
});

function formatTrendLabel(dateStr: string, period: TrendPeriod) {
  const date = new Date(`${dateStr}T12:00:00+10:00`);
  if (period === "1y") {
    return date.toLocaleDateString("en-AU", { month: "short", timeZone: "Australia/Brisbane" });
  }
  if (period === "90d") {
    return date.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      timeZone: "Australia/Brisbane",
    });
  }
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    timeZone: "Australia/Brisbane",
  });
}

function buildTrendSeries(daily: DailyScan[], period: TrendPeriod): TrendPoint[] {
  const span = PERIOD_DAYS[period];
  const start = daysAgoBusiness(span);
  const byDate = new Map(daily.map((row) => [row.scan_date, row.total_scans]));

  const points: TrendPoint[] = [];
  let cumulative = 0;

  for (let offset = span; offset >= 0; offset -= 1) {
    const date = daysAgoBusiness(offset);
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

export async function fetchSessionInteractions(sessionId: string): Promise<CardInteraction[]> {
  if (!sessionId) return [];
  const { data, error } = await supabase
    .from("card_interactions")
    .select("id, session_id, event_type, link_id, link_label, occurred_at")
    .eq("session_id", sessionId)
    .order("occurred_at", { ascending: true })
    .limit(300);
  if (error) throw error;
  return (data || []) as CardInteraction[];
}

export async function fetchDashboardStats(period: TrendPeriod = "7d"): Promise<DashboardStats> {
  const span = PERIOD_DAYS[period];
  const rangeStart = daysAgoBusiness(span);
  const today = todayBusiness();
  const weekStart = daysAgoBusiness(6);
  const monthStart = daysAgoBusiness(29);

  const [dailyRes, recentRes, interactionsRes, periodRes, monthDailyRes, allTimeRes] =
    await Promise.all([
      supabase
        .from("business_card_scans_by_day")
        .select("scan_date, total_scans, unique_sessions, qr_scans")
        .gte("scan_date", rangeStart)
        .order("scan_date", { ascending: true }),
      supabase
        .from("qr_scan_events")
        .select(
          "id, scanned_at, scan_date, source, session_id, visitor_id, device_type, country, region, city, latitude, longitude, scanner_timezone, referrer"
        )
        .order("scanned_at", { ascending: false })
        .limit(500),
      supabase
        .from("card_interactions")
        .select("id, session_id, event_type, link_id, link_label, occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(800),
      supabase
        .from("qr_scan_events")
        .select("source, device_type, scanned_at")
        .gte("scanned_at", `${rangeStart}T00:00:00+10:00`)
        .limit(8000),
      supabase
        .from("business_card_scans_by_day")
        .select("scan_date, total_scans, qr_scans")
        .gte("scan_date", monthStart),
      supabase.from("qr_scan_events").select("id", { count: "exact", head: true }),
    ]);

  if (dailyRes.error) throw dailyRes.error;
  if (recentRes.error) throw recentRes.error;
  if (interactionsRes.error) throw interactionsRes.error;
  if (periodRes.error) throw periodRes.error;
  if (monthDailyRes.error) throw monthDailyRes.error;
  if (allTimeRes.error) throw allTimeRes.error;

  const daily = (dailyRes.data || []) as DailyScan[];
  const recent = (recentRes.data || []) as ScanEvent[];
  const interactions = (interactionsRes.data || []) as CardInteraction[];
  const periodEvents = (periodRes.data || []) as {
    source: string | null;
    device_type: string | null;
    scanned_at: string;
  }[];
  const monthDaily = (monthDailyRes.data || []) as {
    scan_date: string;
    total_scans: number;
    qr_scans?: number;
  }[];
  const trend = buildTrendSeries(daily, period);
  const currentDaily = daily.filter((row) => row.scan_date >= rangeStart);

  const todayRow = currentDaily.find((row) => row.scan_date === today);
  const weekTotal = currentDaily
    .filter((row) => row.scan_date >= weekStart)
    .reduce((sum, row) => sum + row.total_scans, 0);
  const monthTotal = monthDaily.reduce((sum, row) => sum + row.total_scans, 0);
  const totalAll = currentDaily.reduce((sum, row) => sum + row.total_scans, 0);
  const totalAllTime = allTimeRes.count ?? totalAll;
  const activeDays = currentDaily.filter((row) => row.total_scans > 0).length;
  const avgDaily = activeDays ? Math.round((totalAll / activeDays) * 10) / 10 : 0;

  let peakDay: { date: string; scans: number } | null = null;
  for (const row of currentDaily) {
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
    month: monthTotal,
    total: totalAll,
    totalAllTime,
    uniqueToday: todayRow?.unique_sessions || 0,
    avgDaily,
    peakDay,
    mobileShare: Math.round((mobileCount / periodCount) * 100),
    qrShare: Math.round((qrCount / periodCount) * 100),
    qrToday: todayRow?.qr_scans || 0,
    bySource,
    byDevice,
    daily: currentDaily,
    recent,
    interactions,
    trend,
    period,
    changePercent: computeChangePercent(trend),
  };
}

export { businessDate, todayBusiness };
export type { CardInteraction, DailyScan, DashboardStats, ScanEvent, TrendPeriod, TrendPoint, BreakdownSlice };

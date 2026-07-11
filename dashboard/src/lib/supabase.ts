import { createClient } from "@supabase/supabase-js";

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

export type DashboardStats = {
  today: number;
  week: number;
  total: number;
  uniqueToday: number;
  daily: DailyScan[];
  recent: ScanEvent[];
  deviceBreakdown: { name: string; value: number }[];
  sourceBreakdown: { name: string; value: number }[];
};

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysAgoUtc(days: number) {
  const d = startOfUtcDay();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function countByField<T extends string>(
  items: T[],
  labels?: Record<string, string>
) {
  const map = new Map<string, number>();
  for (const raw of items) {
    const key = String(raw || "unknown").trim() || "unknown";
    const label = labels?.[key] || key.charAt(0).toUpperCase() + key.slice(1);
    map.set(label, (map.get(label) || 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const thirtyDaysAgo = daysAgoUtc(29);
  const today = daysAgoUtc(0);
  const weekStart = daysAgoUtc(6);

  const [dailyRes, recentRes, allForBreakdownRes] = await Promise.all([
    supabase
      .from("business_card_scans_by_day")
      .select("scan_date, total_scans, unique_sessions")
      .gte("scan_date", thirtyDaysAgo)
      .order("scan_date", { ascending: true }),
    supabase
      .from("qr_scan_events")
      .select(
        "id, scanned_at, scan_date, source, session_id, device_type, country, city, referrer"
      )
      .order("scanned_at", { ascending: false })
      .limit(25),
    supabase
      .from("qr_scan_events")
      .select("source, device_type")
      .gte("scan_date", thirtyDaysAgo),
  ]);

  if (dailyRes.error) throw dailyRes.error;
  if (recentRes.error) throw recentRes.error;
  if (allForBreakdownRes.error) throw allForBreakdownRes.error;

  const daily = (dailyRes.data || []) as DailyScan[];
  const recent = (recentRes.data || []) as ScanEvent[];
  const breakdownEvents = (allForBreakdownRes.data || []) as Pick<
    ScanEvent,
    "source" | "device_type"
  >[];

  const todayRow = daily.find((row) => row.scan_date === today);
  const weekTotal = daily
    .filter((row) => row.scan_date >= weekStart)
    .reduce((sum, row) => sum + row.total_scans, 0);
  const totalAll = daily.reduce((sum, row) => sum + row.total_scans, 0);

  return {
    today: todayRow?.total_scans || 0,
    week: weekTotal,
    total: totalAll,
    uniqueToday: todayRow?.unique_sessions || 0,
    daily,
    recent,
    deviceBreakdown: countByField(
      breakdownEvents.map((e) => e.device_type || "unknown")
    ),
    sourceBreakdown: countByField(
      breakdownEvents.map((e) => e.source || "direct"),
      { qr: "QR scan", referral: "Referral", direct: "Direct" }
    ),
  };
}

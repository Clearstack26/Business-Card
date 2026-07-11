/**
 * Verifies dashboard stats match Supabase (same queries as fetchDashboardStats).
 */
import { createClient } from "@supabase/supabase-js";

const url = "https://siaktnkaavgefjxgprrf.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY to run this check.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function daysAgoUtc(days) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const rangeStart = daysAgoUtc(29);
const today = daysAgoUtc(0);

const [dailyRes, recentRes] = await Promise.all([
  supabase
    .from("business_card_scans_by_day")
    .select("scan_date, total_scans, unique_sessions")
    .gte("scan_date", rangeStart)
    .order("scan_date", { ascending: true }),
  supabase
    .from("qr_scan_events")
    .select("id, scanned_at, source, device_type, session_id")
    .order("scanned_at", { ascending: false })
    .limit(10),
]);

if (dailyRes.error) throw dailyRes.error;
if (recentRes.error) throw recentRes.error;

const daily = dailyRes.data || [];
const recent = recentRes.data || [];
const todayRow = daily.find((row) => row.scan_date === today);

console.log("Dashboard data check (30d window)");
console.log("Today scans:", todayRow?.total_scans ?? 0);
console.log("Unique today:", todayRow?.unique_sessions ?? 0);
console.log("Recent activity rows:", recent.length);
console.log("Latest scans:");
for (const row of recent.slice(0, 5)) {
  console.log(`  - ${row.scanned_at} | ${row.source} | ${row.device_type} | ${row.session_id}`);
}

if (!todayRow || todayRow.total_scans < 9) {
  console.error("Expected at least 9 scans today.");
  process.exit(1);
}

console.log("OK: Supabase data ready for admin dashboard sync.");

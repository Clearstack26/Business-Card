/**
 * Verifies dashboard stats match Supabase (same queries as fetchDashboardStats).
 * Safe for a clean/zero database — reports readiness without requiring fake scans.
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

const [dailyRes, recentRes, interactionsRes, allTimeRes] = await Promise.all([
  supabase
    .from("business_card_scans_by_day")
    .select("scan_date, total_scans, unique_sessions")
    .gte("scan_date", rangeStart)
    .order("scan_date", { ascending: true }),
  supabase
    .from("qr_scan_events")
    .select("id, scanned_at, source, device_type, session_id, city, region, country")
    .order("scanned_at", { ascending: false })
    .limit(10),
  supabase
    .from("card_interactions")
    .select("id, session_id, event_type, link_id, link_label, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(20),
  supabase.from("qr_scan_events").select("id", { count: "exact", head: true }),
]);

if (dailyRes.error) throw dailyRes.error;
if (recentRes.error) throw recentRes.error;
if (interactionsRes.error) throw interactionsRes.error;
if (allTimeRes.error) throw allTimeRes.error;

const daily = dailyRes.data || [];
const recent = recentRes.data || [];
const interactions = interactionsRes.data || [];
const todayRow = daily.find((row) => row.scan_date === today);
const totalAllTime = allTimeRes.count ?? 0;

console.log("Dashboard data check (real data)");
console.log("All-time scans:", totalAllTime);
console.log("Today scans:", todayRow?.total_scans ?? 0);
console.log("Unique today:", todayRow?.unique_sessions ?? 0);
console.log("Recent activity rows:", recent.length);
console.log("Recent interactions:", interactions.length);

if (recent.length) {
  console.log("Latest scans:");
  for (const row of recent.slice(0, 5)) {
    console.log(`  - ${row.scanned_at} | ${row.source} | ${row.device_type} | ${row.session_id}`);
  }
}

if (interactions.length) {
  console.log("Latest interactions:");
  for (const row of interactions.slice(0, 5)) {
    console.log(
      `  - ${row.occurred_at} | ${row.event_type} | ${row.session_id} | ${row.link_id}`
    );
  }
}

console.log(
  totalAllTime === 0
    ? "OK: Clean slate (0 scans). Ready for real card traffic."
    : "OK: Supabase data ready for admin dashboard sync."
);

const { createClient } = require("@supabase/supabase-js");

const rateLimit = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateLimit.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

function detectDeviceType(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function normalizeSource(value) {
  const source = String(value || "direct").trim().toLowerCase();
  if (source === "qr" || source.startsWith("qr")) return "qr";
  if (source === "referral") return "referral";
  return "direct";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).end();
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars for track-scan");
    res.status(500).end();
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).end();
      return;
    }
  }

  const sessionId = String(body?.session_id || "").trim().slice(0, 128);
  const source = normalizeSource(body?.source);
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 512);
  const referrer = String(req.headers.referer || body?.referrer || "").slice(0, 512);
  const country = String(req.headers["x-vercel-ip-country"] || "").slice(0, 8) || null;
  const city = String(
    req.headers["x-vercel-ip-city"] ||
      req.headers["x-vercel-ip-country-region"] ||
      ""
  ).slice(0, 128) || null;

  const now = new Date();
  const scanDate = now.toISOString().slice(0, 10);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("qr_scan_events").insert({
    scanned_at: now.toISOString(),
    scan_date: scanDate,
    source,
    session_id: sessionId || null,
    device_type: detectDeviceType(userAgent),
    country,
    city,
    referrer: referrer || null,
    user_agent: userAgent || null,
  });

  if (error) {
    console.error("track-scan insert failed:", error.message);
    res.status(500).end();
    return;
  }

  res.status(204).end();
};

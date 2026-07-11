const { createClient } = require("@supabase/supabase-js");

const rateLimit = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const BUSINESS_TZ = "Australia/Brisbane";

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

function decodeHeader(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

function parseCoord(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Calendar date in Australia/Brisbane for business-day metrics. */
function businessDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function sanitizeReferrer(value) {
  const raw = String(value || "").trim().slice(0, 512);
  if (!raw) return null;
  // Ignore self-referrals (API / card page as Referer header)
  try {
    const url = new URL(raw);
    if (/\/card\/?$/i.test(url.pathname) || /track-scan/i.test(url.pathname)) {
      return null;
    }
  } catch {
    /* keep raw string */
  }
  return raw;
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
  const visitorId = String(body?.visitor_id || "").trim().slice(0, 128) || null;
  const source = normalizeSource(body?.source);
  const userAgent = String(req.headers["user-agent"] || "").slice(0, 512);
  // Prefer client-sent inbound referrer over the request Referer (usually the card URL)
  const referrer =
    sanitizeReferrer(body?.referrer) || sanitizeReferrer(req.headers.referer);
  const scannerTimezone = String(body?.timezone || "")
    .trim()
    .slice(0, 64) || null;

  const country = (decodeHeader(req.headers["x-vercel-ip-country"]) || "").toUpperCase().slice(0, 8) || null;
  const region = (decodeHeader(req.headers["x-vercel-ip-country-region"]) || "").toUpperCase().slice(0, 32) || null;
  const city = (decodeHeader(req.headers["x-vercel-ip-city"]) || "").slice(0, 128) || null;
  const latitude = parseCoord(req.headers["x-vercel-ip-latitude"]);
  const longitude = parseCoord(req.headers["x-vercel-ip-longitude"]);

  const now = new Date();
  const scanDate = businessDate(now);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("qr_scan_events").insert({
    scanned_at: now.toISOString(),
    scan_date: scanDate,
    source,
    session_id: sessionId || null,
    visitor_id: visitorId,
    device_type: detectDeviceType(userAgent),
    country,
    region,
    city,
    latitude,
    longitude,
    scanner_timezone: scannerTimezone,
    referrer: referrer || null,
    user_agent: userAgent || null,
  });

  if (error) {
    // Unique session_id — already counted this tab session
    if (error.code === "23505") {
      res.status(204).end();
      return;
    }
    console.error("track-scan insert failed:", error.message);
    res.status(500).end();
    return;
  }

  res.status(204).end();
};

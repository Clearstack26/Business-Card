const { createClient } = require("@supabase/supabase-js");

const rateLimit = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 80;

const ALLOWED_EVENT_TYPES = new Set([
  "link_click",
  "card_open",
  "card_leave",
  "card_return",
  "card_continue",
]);

const ALLOWED_LINK_ID = /^[a-z0-9_-]{1,64}$/;

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
    console.error("Missing Supabase env vars for track-interaction");
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
  const eventType = String(body?.event_type || "link_click")
    .trim()
    .toLowerCase()
    .slice(0, 32);
  const linkId = String(body?.link_id || "").trim().toLowerCase().slice(0, 64);
  const linkLabel = String(body?.link_label || "").trim().slice(0, 128) || null;
  const occurredAt = body?.occurred_at
    ? new Date(body.occurred_at).toISOString()
    : new Date().toISOString();

  if (
    !sessionId ||
    !linkId ||
    !ALLOWED_LINK_ID.test(linkId) ||
    !ALLOWED_EVENT_TYPES.has(eventType)
  ) {
    res.status(400).end();
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("card_interactions").insert({
    session_id: sessionId,
    event_type: eventType,
    link_id: linkId,
    link_label: linkLabel,
    occurred_at: occurredAt,
  });

  if (error) {
    console.error("track-interaction insert failed:", error.message);
    res.status(500).end();
    return;
  }

  res.status(204).end();
};

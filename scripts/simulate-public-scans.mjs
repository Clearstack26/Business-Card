/**
 * Simulates multiple people scanning the shirt QR in public.
 * Each scan = unique session, mobile user-agent, source=qr.
 */
const BASE = process.env.CARD_URL || "https://business-card-mathew.vercel.app";

const MOBILE_UAS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
];

async function postScan(sessionId, index) {
  const res = await fetch(`${BASE}/api/track-scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": MOBILE_UAS[index % MOBILE_UAS.length],
    },
    body: JSON.stringify({
      session_id: sessionId,
      source: "qr",
      referrer: null,
    }),
  });
  return res.status;
}

const count = Number(process.env.SCAN_COUNT || 8);
const stamp = Date.now();

console.log(`Simulating ${count} public shirt QR scans → ${BASE}/api/track-scan`);

const results = await Promise.all(
  Array.from({ length: count }, (_, i) =>
    postScan(`public-shirt-${stamp}-${i + 1}`, i).then((status) => ({ i: i + 1, status }))
  )
);

const ok = results.filter((r) => r.status === 204).length;
const failed = results.filter((r) => r.status !== 204);

console.log(`Done: ${ok}/${count} recorded (HTTP 204)`);
if (failed.length) {
  console.error("Failures:", failed);
  process.exit(1);
}

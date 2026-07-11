/**
 * DEV ONLY — simulates link taps after a card scan.
 * Refuses production unless ALLOW_PROD_SIMULATE=1 is set.
 */
const BASE = process.env.CARD_URL || "http://localhost:3000";
const PROD_HOST = "business-card-mathew.vercel.app";

function isProdTarget(url) {
  try {
    return new URL(url).hostname === PROD_HOST;
  } catch {
    return String(url).includes(PROD_HOST);
  }
}

if (isProdTarget(BASE) && process.env.ALLOW_PROD_SIMULATE !== "1") {
  console.error(
    "Refusing to simulate against production.\n" +
      "Set CARD_URL to a local/preview URL, or ALLOW_PROD_SIMULATE=1 to override."
  );
  process.exit(1);
}

const SESSIONS = [
  {
    session_id: process.env.SIM_SESSION_ID || `dev-sim-session-${Date.now()}`,
    clicks: [
      { link_id: "book", link_label: "Book a call", delayMs: 200 },
      { link_id: "linkedin", link_label: "LinkedIn", delayMs: 200 },
      { link_id: "website", link_label: "Website", delayMs: 200 },
    ],
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postInteraction(sessionId, click) {
  const res = await fetch(`${BASE}/api/track-interaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      event_type: "link_click",
      link_id: click.link_id,
      link_label: click.link_label,
    }),
  });
  return res.status;
}

console.log(`Simulating card link taps → ${BASE}/api/track-interaction`);

const results = [];
for (const session of SESSIONS) {
  for (const click of session.clicks) {
    await sleep(click.delayMs);
    const status = await postInteraction(session.session_id, click);
    results.push({ session: session.session_id, link: click.link_id, status });
  }
}

const ok = results.filter((row) => row.status === 204).length;
console.log(`Done: ${ok}/${results.length} interactions recorded (HTTP 204)`);
for (const row of results) {
  console.log(`  - ${row.session} → ${row.link}: ${row.status}`);
}

if (ok !== results.length) process.exit(1);

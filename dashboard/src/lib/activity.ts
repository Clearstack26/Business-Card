import type { ActivityFilter, CardInteraction, ScanEvent } from "./types";

export function activityRangeStart(filter: ActivityFilter, todayUtc: string) {
  if (filter === "today") return todayUtc;
  if (filter === "week") {
    const d = new Date(`${todayUtc}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 6);
    return d.toISOString().slice(0, 10);
  }
  return null;
}

export function filterScans(scans: ScanEvent[], filter: ActivityFilter, todayUtc: string) {
  const start = activityRangeStart(filter, todayUtc);
  if (!start) return scans;
  return scans.filter((scan) => scan.scan_date >= start);
}

export function sessionVisitCounts(scans: ScanEvent[]) {
  const counts = new Map<string, number>();
  for (const scan of scans) {
    const sid = scan.session_id;
    if (!sid) continue;
    counts.set(sid, (counts.get(sid) || 0) + 1);
  }
  return counts;
}

export function isReturnVisit(
  scan: ScanEvent,
  visitCounts: Map<string, number>,
  interactions: CardInteraction[] = []
) {
  if (!scan.session_id) return false;
  if ((visitCounts.get(scan.session_id) || 0) > 1) return true;
  return interactions.some(
    (row) =>
      row.session_id === scan.session_id &&
      (row.event_type === "card_return" || row.link_id === "card_return")
  );
}

export type TimelineEntry =
  | { kind: "scan"; at: string; scan: ScanEvent }
  | { kind: "event"; at: string; interaction: CardInteraction };

export function buildSessionTimeline(
  sessionId: string | null,
  scans: ScanEvent[],
  interactions: CardInteraction[]
): TimelineEntry[] {
  if (!sessionId) return [];

  const sessionInteractions = interactions
    .filter((row) => row.session_id === sessionId)
    .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());

  const entries: TimelineEntry[] = sessionInteractions.map((interaction) => ({
    kind: "event" as const,
    at: interaction.occurred_at,
    interaction,
  }));

  const hasOpenEvent = sessionInteractions.some(
    (row) => row.event_type === "card_open" || row.link_id === "card_open"
  );

  if (!hasOpenEvent) {
    for (const scan of scans) {
      if (scan.session_id === sessionId) {
        entries.push({ kind: "scan", at: scan.scanned_at, scan });
      }
    }
  }

  return entries.sort((a, b) => {
    const delta = new Date(a.at).getTime() - new Date(b.at).getTime();
    if (delta !== 0) return delta;
    if (a.kind === "scan" && b.kind !== "scan") return -1;
    if (b.kind === "scan" && a.kind !== "scan") return 1;
    return 0;
  });
}

export function countLinkClicks(timeline: TimelineEntry[]) {
  const systemIds = new Set(["card_open", "card_leave", "card_return"]);
  return timeline.filter((entry) => {
    if (entry.kind !== "event") return false;
    const type = String(entry.interaction.event_type || "").toLowerCase();
    if (type === "link_click") return true;
    if (type === "card_open" || type === "card_leave" || type === "card_return") return false;
    return !systemIds.has(entry.interaction.link_id);
  }).length;
}

export function sessionScanIndex(scan: ScanEvent, scans: ScanEvent[]) {
  if (!scan.session_id) return 1;
  const sessionScans = scans
    .filter((row) => row.session_id === scan.session_id)
    .sort((a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime());
  const index = sessionScans.findIndex((row) => row.id === scan.id);
  return index >= 0 ? index + 1 : 1;
}

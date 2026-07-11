import type { ActivityFilter, CardInteraction, ScanEvent } from "./types";
import { BUSINESS_TIMEZONE } from "./types";

/** YYYY-MM-DD in the business timezone (Australia/Brisbane). */
export function businessDate(isoOrDate: string | Date = new Date(), timeZone = BUSINESS_TIMEZONE) {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function todayBusiness() {
  return businessDate(new Date());
}

export function daysAgoBusiness(days: number) {
  const today = todayBusiness();
  const d = new Date(`${today}T12:00:00+10:00`);
  d.setDate(d.getDate() - days);
  return businessDate(d);
}

export function activityRangeStart(filter: ActivityFilter, today: string) {
  if (filter === "today") return today;
  if (filter === "week") {
    const d = new Date(`${today}T12:00:00+10:00`);
    d.setUTCDate(d.getUTCDate() - 6);
    return businessDate(d);
  }
  return null;
}

export function filterScans(scans: ScanEvent[], filter: ActivityFilter, today: string) {
  const start = activityRangeStart(filter, today);
  if (!start) return scans;
  return scans.filter((scan) => businessDate(scan.scanned_at) >= start);
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

/**
 * True returning visitor: same durable visitor_id has an earlier visit.
 * Tab focus (card_return) does NOT count as a return visit.
 */
export function isReturnVisit(scan: ScanEvent, allScans: ScanEvent[]) {
  if (scan.visitor_id) {
    const at = new Date(scan.scanned_at).getTime();
    return allScans.some(
      (row) =>
        row.visitor_id === scan.visitor_id &&
        row.id !== scan.id &&
        new Date(row.scanned_at).getTime() < at
    );
  }
  return false;
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

  // Always include the visit/land event so the funnel is clear
  for (const scan of scans) {
    if (scan.session_id === sessionId) {
      entries.push({ kind: "scan", at: scan.scanned_at, scan });
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
  const systemIds = new Set([
    "card_open",
    "card_leave",
    "card_return",
    "card_continue",
  ]);
  return timeline.filter((entry) => {
    if (entry.kind !== "event") return false;
    const type = String(entry.interaction.event_type || "").toLowerCase();
    if (type === "link_click") return true;
    if (
      type === "card_open" ||
      type === "card_leave" ||
      type === "card_return" ||
      type === "card_continue"
    ) {
      return false;
    }
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

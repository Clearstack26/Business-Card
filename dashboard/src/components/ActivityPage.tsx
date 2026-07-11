import { motion } from "framer-motion";
import type { ScanEvent } from "../lib/supabase";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function sourceLabel(source: string) {
  if (source === "qr") return "QR scan";
  if (source === "referral") return "Referral";
  return "Direct";
}

export function ActivityPage({ recent }: { recent: ScanEvent[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Activity</h1>
        <p className="mt-1 text-sm text-muted">Most recent card opens, synced in real time.</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/70 text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((scan) => (
                  <tr key={scan.id} className="border-t border-border/50">
                    <td className="px-5 py-3 whitespace-nowrap">{formatTimestamp(scan.scanned_at)}</td>
                    <td className="px-5 py-3">{sourceLabel(scan.source || "direct")}</td>
                    <td className="px-5 py-3 capitalize">{scan.device_type || "Unknown"}</td>
                    <td className="px-5 py-3">
                      {[scan.city, scan.country].filter(Boolean).join(", ") || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted">
                    No scans yet. Open your card on a phone to see the first entry appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}

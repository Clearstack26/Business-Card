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

function formatLocation(scan: ScanEvent) {
  const city = String(scan.city || "").trim();
  const country = String(scan.country || "").trim().toUpperCase();
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "Unknown";
}

export function ActivityPage({ recent }: { recent: ScanEvent[] }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="font-display text-2xl font-semibold">Activity</h1>
        <p className="mt-1 text-sm text-muted">
          Most recent card opens, synced in real time.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/70 text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="px-3 py-3 font-medium sm:px-5">When</th>
                <th className="px-3 py-3 font-medium sm:px-5">Source</th>
                <th className="px-3 py-3 font-medium sm:px-5">Device</th>
                <th className="px-3 py-3 font-medium sm:px-5">Location</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((scan, index) => (
                  <motion.tr
                    key={scan.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.3) }}
                    className="border-t border-border/50 transition hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-3 py-3 sm:px-5">
                      {formatTimestamp(scan.scanned_at)}
                    </td>
                    <td className="px-3 py-3 sm:px-5">
                      {sourceLabel(scan.source || "direct")}
                    </td>
                    <td className="px-3 py-3 capitalize sm:px-5">
                      {scan.device_type || "Unknown"}
                    </td>
                    <td className="px-3 py-3 sm:px-5">{formatLocation(scan)}</td>
                  </motion.tr>
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

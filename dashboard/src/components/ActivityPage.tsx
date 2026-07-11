import { motion } from "framer-motion";
import type { ScanEvent } from "../lib/supabase";
import {
  formatScanLocation,
  formatScanWhen,
  resolveDisplayTimezone,
  sourceLabel,
} from "../lib/format";

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
          Where and when each person scanned, synced live.
        </p>
      </motion.div>

      {/* Mobile / tablet cards */}
      <div className="space-y-3 lg:hidden">
        {recent.length ? (
          recent.map((scan, index) => {
            const tz = resolveDisplayTimezone(scan);
            const when = formatScanWhen(scan.scanned_at, tz);
            return (
              <motion.article
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.35) }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-metrics text-base font-semibold text-foreground">
                      {formatScanLocation(scan)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {when.day}
                    </p>
                    <p className="mt-0.5 text-sm text-primary">
                      {when.time}{" "}
                      <span className="text-xs text-muted">{when.zone}</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p className="rounded-full border border-border/70 px-2 py-1">
                      {sourceLabel(scan.source || "direct")}
                    </p>
                    <p className="mt-2 capitalize">{scan.device_type || "Unknown"}</p>
                  </div>
                </div>
              </motion.article>
            );
          })
        ) : (
          <div className="glass-card px-5 py-10 text-center text-sm text-muted">
            No scans yet. Open your card on a phone to see the first entry appear here.
          </div>
        )}
      </div>

      {/* Desktop table */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card hidden overflow-hidden lg:block"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border/70 text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((scan, index) => {
                  const tz = resolveDisplayTimezone(scan);
                  const when = formatScanWhen(scan.scanned_at, tz);
                  return (
                    <motion.tr
                      key={scan.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      className="border-t border-border/50 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3">
                        <p className="whitespace-nowrap font-medium text-foreground">
                          {when.day}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-primary">
                          {when.time}{" "}
                          <span className="text-xs text-muted">{when.zone}</span>
                        </p>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatScanLocation(scan)}
                      </td>
                      <td className="px-5 py-3">
                        {sourceLabel(scan.source || "direct")}
                      </td>
                      <td className="px-5 py-3 capitalize">
                        {scan.device_type || "Unknown"}
                      </td>
                    </motion.tr>
                  );
                })
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

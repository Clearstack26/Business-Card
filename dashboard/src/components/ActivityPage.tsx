import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ActivityFilter, CardInteraction, ScanEvent } from "../lib/types";
import {
  formatScanLocation,
  formatScanWhen,
  resolveDisplayTimezone,
  sourceLabel,
} from "../lib/format";
import { filterScans, todayBusiness } from "../lib/activity";
import { ActivityDetailSheet } from "./ActivityDetailSheet";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "all", label: "All" },
];

function ActivityFilterToggle({
  value,
  onChange,
}: {
  value: ActivityFilter;
  onChange: (next: ActivityFilter) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-background/40 p-1">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={[
            "rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition",
            value === filter.id
              ? "bg-primary text-background"
              : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

function ScanRow({
  scan,
  index,
  onSelect,
}: {
  scan: ScanEvent;
  index: number;
  onSelect: (scan: ScanEvent) => void;
}) {
  const tz = resolveDisplayTimezone(scan);
  const when = formatScanWhen(scan.scanned_at, tz);

  return (
    <motion.button
      type="button"
      key={scan.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.35) }}
      onClick={() => onSelect(scan)}
      className="activity-card w-full p-4 text-left transition hover:bg-white/[0.03] lg:hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-metrics text-base font-semibold text-foreground">
            {formatScanLocation(scan)}
          </p>
          <p className="mt-1 text-sm text-muted">{when.day}</p>
          <p className="mt-0.5 text-sm text-primary">
            {when.time} <span className="text-xs text-muted">{when.zone}</span>
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <p className="rounded-full border border-white/15 px-2 py-1">
            {sourceLabel(scan.source || "direct")}
          </p>
          <p className="mt-2 capitalize">{scan.device_type || "Unknown"}</p>
        </div>
      </div>
    </motion.button>
  );
}

export function ActivityPage({
  recent,
  interactions,
}: {
  recent: ScanEvent[];
  interactions: CardInteraction[];
}) {
  const [filter, setFilter] = useState<ActivityFilter>("today");
  const [selected, setSelected] = useState<ScanEvent | null>(null);

  const filtered = useMemo(
    () => filterScans(recent, filter, todayBusiness()),
    [recent, filter]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="font-display text-2xl font-semibold text-white">Activity</h1>
        <p className="mt-1 text-sm text-muted">
          Every visit, synced live. Days use Brisbane time.
        </p>
        <div className="mt-4 flex justify-center sm:justify-start">
          <ActivityFilterToggle value={filter} onChange={setFilter} />
        </div>
      </motion.div>

      <div className="space-y-3 lg:hidden">
        {filtered.length ? (
          filtered.map((scan, index) => (
            <ScanRow
              key={scan.id}
              scan={scan}
              index={index}
              onSelect={setSelected}
            />
          ))
        ) : (
          <div className="activity-card px-5 py-10 text-center text-sm text-muted">
            No visits in this period yet.
          </div>
        )}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="activity-card hidden overflow-hidden lg:block"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Device</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((scan, index) => {
                  const tz = resolveDisplayTimezone(scan);
                  const when = formatScanWhen(scan.scanned_at, tz);
                  return (
                    <motion.tr
                      key={scan.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      onClick={() => setSelected(scan)}
                      className="cursor-pointer border-t border-white/10 transition hover:bg-white/[0.03]"
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
                    No visits in this period yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      <ActivityDetailSheet
        scan={selected}
        allScans={recent}
        interactions={interactions}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

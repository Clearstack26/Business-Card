import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { PERIOD_LABELS } from "../lib/types";

const PERIODS: TrendPeriod[] = ["7d", "30d", "90d", "1y"];

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { label: string; scans: number; cumulative: number; date: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-medium text-foreground">{point.label}</p>
      <p className="mt-1 text-muted">{point.date}</p>
      <p className="mt-2 text-primary">{point.scans} scans</p>
      <p className="text-muted">{point.cumulative} total in period</p>
    </div>
  );
}

export function StockTrendChart({
  stats,
  period,
  onPeriodChange,
}: {
  stats: DashboardStats;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}) {
  const latest = stats.trend.length
    ? stats.trend[stats.trend.length - 1].cumulative
    : stats.total;
  const positive = stats.changePercent >= 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Scan progression</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="font-metrics text-4xl font-semibold gradient-text">{latest}</p>
            <p
              className={[
                "mb-1 text-sm font-medium",
                positive ? "text-emerald-300" : "text-rose-300",
              ].join(" ")}
            >
              {positive ? "+" : ""}
              {stats.changePercent}% vs prior half
            </p>
          </div>
          <p className="mt-1 text-sm text-muted">
            Cumulative scans over the last {PERIOD_LABELS[period]}
          </p>
        </div>

        <div className="flex rounded-xl border border-border bg-background/40 p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition",
                period === p
                  ? "bg-primary text-background"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[340px] px-2 py-4 sm:px-4">
        {stats.trend.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="hsl(200 18% 22% / 0.35)"
                strokeDasharray="2 6"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="hsl(200 8% 78%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="hsl(200 8% 78%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={36}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#1affff", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Total scans"
                stroke="#1affff"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#1affff", stroke: "#0f1218", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="scans"
                name="Daily scans"
                stroke="hsl(200 100% 70% / 0.55)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No scan data yet. When someone opens your card, the trend line will appear here.
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-border/70 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-primary" />
          Cumulative total
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded border border-dashed border-sky-300/60" />
          Daily scans
        </span>
      </div>
    </motion.section>
  );
}

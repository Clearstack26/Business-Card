import { motion } from "framer-motion";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { StockTrendChart } from "./StockTrendChart";

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass-card p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-metrics text-3xl font-semibold gradient-text">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </motion.div>
  );
}

export function OverviewPage({
  stats,
  period,
  onPeriodChange,
}: {
  stats: DashboardStats;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Live sync from your business card — every scan, every day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Today" value={stats.today} sub="Scans so far today" />
        <Metric label="This week" value={stats.week} sub="Last 7 days" />
        <Metric label="Unique today" value={stats.uniqueToday} sub="Distinct sessions" />
        <Metric label="Period total" value={stats.total} sub="In selected range" />
      </div>

      <StockTrendChart stats={stats} period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
}

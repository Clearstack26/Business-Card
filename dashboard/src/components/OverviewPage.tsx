import { motion } from "framer-motion";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { MetricRings } from "./MetricRings";
import { StockTrendChart } from "./StockTrendChart";

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
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Live visits to your business card. Metrics use Brisbane business days.
        </p>
        {stats.totalAllTime > 0 ? (
          <p className="mt-2 text-xs text-muted">
            {stats.qrShare}% from QR
            {stats.today > 0 ? ` · ${stats.qrToday} QR today` : ""}
            {stats.uniqueToday > 0 ? ` · ${stats.uniqueToday} unique today` : ""}
          </p>
        ) : null}
      </motion.div>

      <MetricRings
        today={stats.today}
        week={stats.week}
        month={stats.month}
        total={stats.totalAllTime}
      />

      <StockTrendChart stats={stats} period={period} onPeriodChange={onPeriodChange} />
    </div>
  );
}

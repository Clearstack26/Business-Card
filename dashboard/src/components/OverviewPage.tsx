import { motion } from "framer-motion";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { AnimatedNumber } from "./AnimatedNumber";
import { BreakdownPie } from "./BreakdownPie";
import { StockTrendChart } from "./StockTrendChart";

function Metric({
  label,
  value,
  sub,
  decimals = 0,
  delay = 0,
}: {
  label: string;
  value: number;
  sub?: string;
  decimals?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="glass-card p-4 sm:p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-metrics text-3xl font-semibold gradient-text">
        <AnimatedNumber value={value} decimals={decimals} />
      </p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </motion.div>
  );
}

function InsightCard({
  label,
  value,
  detail,
  delay = 0,
}: {
  label: string;
  value: string;
  detail: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="glass-card p-4 sm:p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-metrics text-2xl font-semibold text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </motion.div>
  );
}

function formatPeakDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Live sync from your business card. Every scan updates these metrics.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <Metric label="Today" value={stats.today} sub="Scans so far today" delay={0.02} />
        <Metric label="This week" value={stats.week} sub="Last 7 days" delay={0.06} />
        <Metric
          label="Unique today"
          value={stats.uniqueToday}
          sub="Distinct sessions"
          delay={0.1}
        />
        <Metric
          label="Period total"
          value={stats.total}
          sub="In selected range"
          delay={0.14}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <InsightCard
          label="Avg / active day"
          value={String(stats.avgDaily)}
          detail="Mean scans on days with activity"
          delay={0.08}
        />
        <InsightCard
          label="Peak day"
          value={stats.peakDay ? String(stats.peakDay.scans) : "—"}
          detail={
            stats.peakDay
              ? `${formatPeakDate(stats.peakDay.date)} · busiest day`
              : "No peak yet"
          }
          delay={0.12}
        />
        <InsightCard
          label="QR share"
          value={`${stats.qrShare}%`}
          detail={`${stats.mobileShare}% of scans are mobile`}
          delay={0.16}
        />
      </div>

      <StockTrendChart stats={stats} period={period} onPeriodChange={onPeriodChange} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownPie
          title="Scan source"
          subtitle="Where people opened your card from"
          data={stats.bySource}
        />
        <BreakdownPie
          title="Device mix"
          subtitle="Phones vs tablets vs desktop"
          data={stats.byDevice}
        />
      </div>
    </div>
  );
}

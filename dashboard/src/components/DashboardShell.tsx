import { useState } from "react";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { ActivityPage } from "./ActivityPage";
import { OverviewPage } from "./OverviewPage";
import { Sidebar, type NavItem } from "./Sidebar";

export function DashboardShell({
  stats,
  period,
  onPeriodChange,
  onSignOut,
  syncing = false,
}: {
  stats: DashboardStats;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  onSignOut: () => void;
  syncing?: boolean;
}) {
  const [active, setActive] = useState<NavItem>("overview");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar active={active} onNavigate={setActive} onSignOut={onSignOut} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex items-center justify-end gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1",
              syncing ? "border-primary/40 text-primary" : "border-border/70",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full bg-primary",
                syncing ? "animate-pulse" : "",
              ].join(" ")}
            />
            {syncing ? "Syncing" : "Live"}
          </span>
        </div>
        {active === "overview" ? (
          <OverviewPage stats={stats} period={period} onPeriodChange={onPeriodChange} />
        ) : (
          <ActivityPage recent={stats.recent} />
        )}
      </main>
    </div>
  );
}

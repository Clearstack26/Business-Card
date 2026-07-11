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
}: {
  stats: DashboardStats;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  onSignOut: () => void;
}) {
  const [active, setActive] = useState<NavItem>("overview");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar active={active} onNavigate={setActive} onSignOut={onSignOut} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {active === "overview" ? (
          <OverviewPage stats={stats} period={period} onPeriodChange={onPeriodChange} />
        ) : (
          <ActivityPage recent={stats.recent} />
        )}
      </main>
    </div>
  );
}

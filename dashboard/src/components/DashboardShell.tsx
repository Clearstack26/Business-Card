import { useEffect, useState } from "react";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { ActivityPage } from "./ActivityPage";
import { OverviewPage } from "./OverviewPage";
import { Sidebar, type NavItem } from "./Sidebar";

function EdgeTab({
  open,
  onClick,
  ariaLabel,
}: {
  open: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={open}
      onClick={onClick}
      data-open={open ? "true" : "false"}
      className="sidebar-edge-tab"
    >
      <svg
        viewBox="0 0 24 24"
        className={["sidebar-edge-tab__icon", open ? "is-open" : ""].join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden
      >
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function LiveBadge({ syncing }: { syncing: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em]",
        "ring-1 ring-primary/55",
        syncing ? "text-primary" : "text-muted",
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
  );
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [active]);

  const handleNavigate = (item: NavItem) => {
    setActive(item);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <div className="relative min-h-screen">
      <Sidebar
        open={sidebarOpen}
        active={active}
        onNavigate={handleNavigate}
        onSignOut={onSignOut}
        onClose={() => setSidebarOpen(false)}
      />

      <EdgeTab
        open={sidebarOpen}
        onClick={() => setSidebarOpen((v) => !v)}
        ariaLabel={sidebarOpen ? "Close menu" : "Open menu"}
      />

      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:px-10">
        <header className="mb-5 flex flex-col items-center text-center sm:mb-8">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/clearstack-logo.png"
              alt="ClearStack Digital"
              className="h-9 w-auto sm:h-11"
            />
            <div>
              <p className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                Card Scans
              </p>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">Business card analytics</p>
            </div>
          </div>

          <div className="mt-4">
            <LiveBadge syncing={syncing} />
          </div>
        </header>

        {active === "overview" ? (
          <OverviewPage stats={stats} period={period} onPeriodChange={onPeriodChange} />
        ) : (
          <ActivityPage recent={stats.recent} interactions={stats.interactions} />
        )}
      </main>
    </div>
  );
}

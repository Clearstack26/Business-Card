import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen">
      <Sidebar
        open={sidebarOpen}
        active={active}
        onNavigate={setActive}
        onSignOut={onSignOut}
        onClose={() => setSidebarOpen(false)}
      />

      <motion.button
        type="button"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setSidebarOpen((open) => !open)}
        className={[
          "fixed z-[60] flex h-14 w-8 items-center justify-center rounded-r-xl border border-l-0 border-border/80 bg-card/90 text-muted shadow-lg backdrop-blur transition hover:border-primary/40 hover:text-primary",
          "left-0 top-[max(5.5rem,18%)] sm:top-1/2 sm:-translate-y-1/2",
          sidebarOpen ? "translate-x-[min(18rem,86vw)]" : "translate-x-0",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          className={["h-4 w-4 transition-transform", sidebarOpen ? "rotate-180" : ""].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <main className="min-h-screen px-4 pb-8 pt-5 pl-10 sm:px-6 sm:pl-12 lg:px-10 lg:pb-10 lg:pt-7 lg:pl-12">
        <header className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <div className="flex flex-col items-center gap-3">
            <img
              src="/clearstack-logo.png"
              alt="ClearStack Digital"
              className="h-10 w-auto sm:h-11"
            />
            <div>
              <p className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                Card Scans
              </p>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">Business card analytics</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]",
                syncing
                  ? "border-primary/40 text-primary"
                  : "border-border/70 text-muted",
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
        </header>

        {active === "overview" ? (
          <OverviewPage stats={stats} period={period} onPeriodChange={onPeriodChange} />
        ) : (
          <ActivityPage recent={stats.recent} />
        )}
      </main>
    </div>
  );
}

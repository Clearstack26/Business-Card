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

      {/* Edge pull tab - all devices */}
      <motion.button
        type="button"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSidebarOpen((open) => !open)}
        className={[
          "fixed z-[60] flex h-16 w-9 items-center justify-center rounded-r-2xl border border-l-0 border-border/80 bg-card/95 text-muted shadow-xl backdrop-blur transition hover:border-primary/40 hover:text-primary",
          "left-0 top-[max(6rem,22vh)] sm:top-1/2 sm:-translate-y-1/2",
          "pl-[env(safe-area-inset-left)]",
          sidebarOpen ? "translate-x-[min(20rem,88vw)] sm:translate-x-80" : "translate-x-0",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          className={["h-5 w-5 transition-transform duration-200", sidebarOpen ? "rotate-180" : ""].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <main className="min-h-screen px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] pl-11 sm:px-6 sm:pl-14 md:px-8 lg:px-10 lg:pl-14">
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

          <div className="mt-4 flex items-center justify-center gap-2">
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

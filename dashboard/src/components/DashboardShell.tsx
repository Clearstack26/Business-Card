import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

      {/* Edge pull tab: only when closed, vertically centered like ClearStack admin */}
      <AnimatePresence>
        {!sidebarOpen ? (
          <motion.button
            key="sidebar-edge-tab"
            type="button"
            aria-label="Open menu"
            aria-expanded={false}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed left-0 top-1/2 z-[60] flex h-14 w-8 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-border/80 bg-card/95 text-muted shadow-xl backdrop-blur transition hover:border-primary/40 hover:text-primary pl-[env(safe-area-inset-left)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <main className="min-h-screen px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] pl-10 sm:px-6 sm:pl-12 md:px-8 lg:px-10 lg:pl-12">
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

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export type NavItem = "overview" | "activity";

const NAV: { id: NavItem; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Trends and totals" },
  { id: "activity", label: "Activity", hint: "Where and when" },
];

const DRAWER_WIDTH = "min(15rem, 70vw)";

export function Sidebar({
  open,
  active,
  onNavigate,
  onSignOut,
  onClose,
}: {
  open: boolean;
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  onSignOut: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[4px]"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            style={{ width: DRAWER_WIDTH }}
            className="sidebar-glass fixed inset-y-0 left-0 z-50 flex flex-col px-3.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl"
          >
            <div className="mb-8 px-1">
              <p className="font-display text-sm font-semibold leading-tight">Navigation</p>
              <p className="text-[11px] text-muted">Card analytics</p>
            </div>

            <nav className="flex flex-1 flex-col gap-2">
              {NAV.map((item) => {
                const selected = active === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={[
                      "min-h-[3.25rem] rounded-2xl px-4 py-3 text-left transition",
                      selected
                        ? "bg-primary/12 text-foreground ring-1 ring-primary/30"
                        : "text-muted hover:bg-white/[0.06] hover:text-foreground",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-medium sm:text-[15px]">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] opacity-70">{item.hint}</span>
                  </motion.button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSignOut}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted transition hover:border-primary/35 hover:text-foreground"
              >
                Sign out
              </motion.button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

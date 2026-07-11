import { AnimatePresence, motion } from "framer-motion";

export type NavItem = "overview" | "activity";

const NAV: { id: NavItem; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Trends & totals" },
  { id: "activity", label: "Activity", hint: "Recent scans" },
];

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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          />

          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="sidebar fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col border-r border-border/80 bg-[hsl(220_18%_9%/0.96)] px-4 py-6 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold leading-tight">Navigation</p>
                <p className="text-[11px] text-muted">Card analytics</p>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                aria-label="Collapse sidebar"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-primary/40 hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
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
                      "rounded-xl px-3 py-3 text-left transition",
                      selected
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/25"
                        : "text-muted hover:bg-white/5 hover:text-foreground",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] opacity-70">{item.hint}</span>
                  </motion.button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border/70 pt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSignOut}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-muted transition hover:border-primary/30 hover:text-foreground"
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

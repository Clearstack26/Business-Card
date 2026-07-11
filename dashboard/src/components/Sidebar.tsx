import { motion } from "framer-motion";

export type NavItem = "overview" | "activity";

const NAV: { id: NavItem; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Trends & totals" },
  { id: "activity", label: "Activity", hint: "Recent scans" },
];

export function Sidebar({
  active,
  onNavigate,
  onSignOut,
}: {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  onSignOut: () => void;
}) {
  return (
    <aside className="sidebar flex h-full w-full flex-col border-r border-border/80 bg-card/30 px-4 py-6 lg:w-64 lg:shrink-0">
      <div className="mb-10 flex items-center gap-3 px-2">
        <img src="/clearstack-logo.png" alt="ClearStack" className="h-9 w-auto" />
        <div>
          <p className="font-display text-sm font-semibold leading-tight">Card Scans</p>
          <p className="text-[11px] text-muted">Business card analytics</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const selected = active === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
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
    </aside>
  );
}

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "../lib/supabase";

const PIE_COLORS = ["#1affff", "#66e0ff", "#99ebff", "#ccefff"];

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-metrics text-3xl font-semibold gradient-text">{value}</p>
    </motion.div>
  );
}

function EmptyPie() {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-muted">
      No scan data yet
    </div>
  );
}

export function DashboardPage({
  stats,
  onSignOut,
}: {
  stats: DashboardStats;
  onSignOut: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <img src="/clearstack-logo.png" alt="ClearStack Digital" className="h-10 w-auto" />
          <div>
            <h1 className="font-display text-2xl font-semibold">Business Card Scans</h1>
            <p className="text-sm text-muted">Live QR and card visit analytics</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignOut}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground"
        >
          Sign out
        </motion.button>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard label="Scans today" value={stats.today} />
        <KpiCard label="This week" value={stats.week} />
        <KpiCard label="Total (30 days)" value={stats.total} />
        <KpiCard label="Unique today" value={stats.uniqueToday} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card mb-6 p-5"
      >
        <h2 className="mb-4 font-display text-lg font-medium">Scans per day</h2>
        <div className="h-72">
          {stats.daily.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.daily}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1affff" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#1affff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(200 18% 22% / 0.5)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="scan_date"
                  tickFormatter={formatDateLabel}
                  stroke="hsl(200 8% 78%)"
                  fontSize={12}
                />
                <YAxis allowDecimals={false} stroke="hsl(200 8% 78%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 16% 11%)",
                    border: "1px solid hsl(200 18% 22%)",
                    borderRadius: "0.75rem",
                  }}
                  labelFormatter={(label) => formatDateLabel(String(label))}
                />
                <Area
                  type="monotone"
                  dataKey="total_scans"
                  name="Scans"
                  stroke="#1affff"
                  fill="url(#scanGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyPie />
          )}
        </div>
      </motion.section>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <h2 className="mb-4 font-display text-lg font-medium">Device mix</h2>
          {stats.deviceBreakdown.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.deviceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {stats.deviceBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(220 16% 11%)",
                      border: "1px solid hsl(200 18% 22%)",
                      borderRadius: "0.75rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPie />
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <h2 className="mb-4 font-display text-lg font-medium">Scan source</h2>
          {stats.sourceBreakdown.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sourceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {stats.sourceBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(220 16% 11%)",
                      border: "1px solid hsl(200 18% 22%)",
                      borderRadius: "0.75rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPie />
          )}
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card overflow-hidden"
      >
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-medium">Recent scans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.length ? (
                stats.recent.map((scan) => (
                  <tr key={scan.id} className="border-t border-border/70">
                    <td className="px-5 py-3 whitespace-nowrap">
                      {formatTimestamp(scan.scanned_at)}
                    </td>
                    <td className="px-5 py-3 capitalize">{scan.source || "direct"}</td>
                    <td className="px-5 py-3 capitalize">{scan.device_type || "unknown"}</td>
                    <td className="px-5 py-3">
                      {[scan.city, scan.country].filter(Boolean).join(", ") || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted">
                    No scans recorded yet. Open /card to test tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
}

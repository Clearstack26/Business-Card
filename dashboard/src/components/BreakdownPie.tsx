import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownSlice } from "../lib/types";

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: BreakdownSlice }[];
}) {
  if (!active || !payload?.length) return null;
  const slice = payload[0];
  return (
    <div className="rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-medium text-foreground">{slice.name}</p>
      <p className="mt-1 text-primary">{slice.value} scans</p>
    </div>
  );
}

export function BreakdownPie({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: BreakdownSlice[];
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="glass-card flex h-full flex-col overflow-hidden"
    >
      <div className="border-b border-border/70 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{title}</p>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>

      <div className="grid flex-1 grid-cols-1 items-center gap-2 px-3 py-4 sm:grid-cols-[1fr_1fr]">
        <div className="mx-auto h-44 w-full max-w-[220px]">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="84%"
                  paddingAngle={2}
                  stroke="transparent"
                  isAnimationActive
                  animationDuration={700}
                >
                  {data.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No data yet
            </div>
          )}
        </div>

        <ul className="space-y-2.5 px-2 pb-2">
          {data.length ? (
            data.map((slice) => {
              const pct = total ? Math.round((slice.value / total) * 100) : 0;
              return (
                <li key={slice.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: slice.color }}
                    />
                    <span className="truncate text-foreground">{slice.name}</span>
                  </span>
                  <span className="shrink-0 font-metrics text-muted">
                    {slice.value} · {pct}%
                  </span>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-muted">Waiting for scans...</li>
          )}
        </ul>
      </div>
    </motion.section>
  );
}

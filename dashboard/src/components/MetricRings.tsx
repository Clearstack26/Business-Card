import { motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";

const RING_SIZE = 88;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function MetricRing({
  label,
  value,
  fill,
  delay = 0,
}: {
  label: string;
  value: number;
  fill: number;
  delay?: number;
}) {
  const [ready, setReady] = useState(false);
  const gradId = useId().replace(/:/g, "");
  const clamped = Math.max(0, Math.min(1, fill));
  const offset = RING_CIRCUMFERENCE * (1 - clamped);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(true);
      return;
    }
    const timer = window.setTimeout(() => setReady(true), 80 + delay * 1000);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-2.5"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="absolute inset-0 -rotate-90 overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1affff" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(185 100% 55% / 0.14)"
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ready ? offset : RING_CIRCUMFERENCE}
            style={{
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </svg>
        <span className="relative font-metrics text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          <AnimatedNumber value={value} />
        </span>
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
    </motion.div>
  );
}

export function MetricRings({
  today,
  week,
  month,
  total,
}: {
  today: number;
  week: number;
  month: number;
  total: number;
}) {
  const peak = Math.max(today, week, month, total, 1);

  return (
    <section className="mx-auto grid w-full max-w-[20rem] grid-cols-2 justify-items-center gap-x-5 gap-y-7 px-2 py-2 sm:max-w-xl sm:grid-cols-4 sm:gap-x-8 sm:py-4">
      <MetricRing label="Today" value={today} fill={today > 0 ? today / peak : 0} delay={0.05} />
      <MetricRing label="Week" value={week} fill={week > 0 ? week / peak : 0} delay={0.12} />
      <MetricRing label="Month" value={month} fill={month > 0 ? month / peak : 0} delay={0.19} />
      <MetricRing label="Total" value={total} fill={total > 0 ? total / peak : 0} delay={0.26} />
    </section>
  );
}

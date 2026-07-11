import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats, TrendPeriod } from "../lib/supabase";
import { PERIOD_LABELS, type TrendPoint } from "../lib/types";

const PERIODS: TrendPeriod[] = ["7d", "30d", "90d", "1y"];

/** Visible day window in expanded chart (no pinch/zoom). */
const WINDOW_BY_PERIOD: Record<TrendPeriod, number> = {
  "7d": 7,
  "30d": 14,
  "90d": 21,
  "1y": 30,
};

type ExpandLayout = "card" | "mobile-portrait" | "mobile-landscape" | "desktop-modal";

type ChartPoint = TrendPoint;

type Viewport = { start: number; end: number };

function useCanExpandChart() {
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setCanExpand(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return canExpand;
}

function useExpandLayout(expanded: boolean): ExpandLayout {
  const [layout, setLayout] = useState<ExpandLayout>("card");

  useEffect(() => {
    if (!expanded) {
      setLayout("card");
      return;
    }

    const update = () => {
      const landscape = window.matchMedia("(orientation: landscape)").matches;
      setLayout(landscape ? "mobile-landscape" : "mobile-portrait");
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [expanded]);

  return layout;
}

function chartDomain(maxValue: number): [number, number] {
  if (maxValue <= 0) return [0, 4];
  const headroom = Math.max(1, Math.ceil(maxValue * 0.12));
  return [0, maxValue + headroom];
}

function hapticTick() {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(8);
    }
  } catch {
    /* ignore */
  }
}

function ExpandIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeriodToggle({
  period,
  onPeriodChange,
  onExpand,
  glass = false,
}: {
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  onExpand?: () => void;
  glass?: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-1 rounded-xl p-1",
        glass
          ? "border border-white/15 bg-white/[0.06] backdrop-blur-md"
          : "border border-border bg-background/40",
      ].join(" ")}
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPeriodChange(p)}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition",
            period === p ? "bg-primary text-background" : "text-muted hover:text-foreground",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
      {onExpand ? (
        <>
          <span className="mx-0.5 h-5 w-px bg-border/80" aria-hidden />
          <button
            type="button"
            onClick={onExpand}
            title="Expand chart"
            aria-label="Expand chart to full screen"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10"
          >
            <ExpandIcon />
          </button>
        </>
      ) : null}
    </div>
  );
}

function CloseXButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Close chart" className="chart-close-x">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25">
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function StockCrosshair({
  points,
  height,
}: {
  points?: Array<{ x: number; y: number }>;
  height?: number;
  width?: number;
}) {
  if (!points?.length || !height) return null;
  const { x, y } = points[0];
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={height} stroke="#1affff" strokeWidth={1} strokeOpacity={0.4} />
      <circle cx={x} cy={y} r={6} fill="#1affff" stroke="#0a0d12" strokeWidth={2.5} />
      <circle cx={x} cy={y} r={11} fill="#1affff" fillOpacity={0.16} />
    </g>
  );
}

function StockPointTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="stock-tooltip">
      <p className="stock-tooltip__date">{point.label}</p>
      <p className="stock-tooltip__value">
        {point.scans} <span>scan{point.scans === 1 ? "" : "s"}</span>
      </p>
      <p className="stock-tooltip__sub">{point.cumulative} total</p>
    </div>
  );
}

function CardTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-medium text-foreground">{point.label}</p>
      <p className="mt-1 text-primary">{point.cumulative} total</p>
      <p className="text-muted">{point.scans} that day</p>
    </div>
  );
}

function stockDot(props: { cx?: number; cy?: number; payload?: ChartPoint }) {
  const { cx = 0, cy = 0 } = props;
  return <circle cx={cx} cy={cy} r={3.5} fill="#1affff" stroke="#0a0d12" strokeWidth={1.5} />;
}

function LastValueLabel({
  viewBox,
  value,
}: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  value: number;
}) {
  if (!viewBox || viewBox.x == null || viewBox.y == null) return null;
  const x = (viewBox.x || 0) + (viewBox.width || 0) - 4;
  const y = viewBox.y || 0;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-40} y={-10} width={36} height={20} rx={6} fill="#1affff" />
      <text x={-22} y={4} textAnchor="middle" fill="#041016" fontSize={11} fontWeight={700}>
        {value}
      </text>
    </g>
  );
}

function clampViewport(start: number, end: number, length: number, minSpan: number): Viewport {
  const maxIndex = Math.max(0, length - 1);
  let nextStart = Math.max(0, Math.min(start, maxIndex));
  let nextEnd = Math.max(0, Math.min(end, maxIndex));
  if (nextEnd - nextStart + 1 < minSpan) {
    nextEnd = Math.min(maxIndex, nextStart + minSpan - 1);
    nextStart = Math.max(0, nextEnd - minSpan + 1);
  }
  return { start: nextStart, end: nextEnd };
}

function latestWindow(length: number, windowSize: number): Viewport {
  const maxIndex = Math.max(0, length - 1);
  const span = Math.min(windowSize, length);
  const end = maxIndex;
  const start = Math.max(0, end - span + 1);
  return { start, end };
}

/** Pan-only timeline window — no pinch or wheel zoom. */
function useChartWindow(length: number, period: TrendPeriod, enabled: boolean) {
  const windowSize = WINDOW_BY_PERIOD[period];
  const [viewport, setViewport] = useState<Viewport>(() => latestWindow(length, windowSize));
  const touchRef = useRef<{
    startX: number;
    startViewport: Viewport;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setViewport(latestWindow(length, windowSize));
  }, [length, windowSize, enabled]);

  const span = Math.max(1, viewport.end - viewport.start + 1);
  const canGoEarlier = viewport.start > 0;
  const canGoLater = viewport.end < length - 1;
  const isAtLatest = viewport.end >= length - 1;

  const step = Math.max(1, Math.floor(span / 2));

  const goEarlier = () => {
    if (!canGoEarlier) return;
    setViewport(
      clampViewport(viewport.start - step, viewport.end - step, length, Math.min(span, length))
    );
  };

  const goLater = () => {
    if (!canGoLater) return;
    setViewport(
      clampViewport(viewport.start + step, viewport.end + step, length, Math.min(span, length))
    );
  };

  const jumpLatest = () => setViewport(latestWindow(length, windowSize));

  const onTouchStart = (event: React.TouchEvent) => {
    if (!enabled || event.touches.length !== 1) return;
    touchRef.current = {
      startX: event.touches[0].clientX,
      startViewport: viewport,
    };
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!enabled || !touchRef.current || event.touches.length !== 1) return;
    const width = (event.currentTarget as HTMLElement).clientWidth || 1;
    const deltaX = event.touches[0].clientX - touchRef.current.startX;
    const shift = Math.round((-deltaX / width) * span);
    setViewport(
      clampViewport(
        touchRef.current.startViewport.start + shift,
        touchRef.current.startViewport.end + shift,
        length,
        Math.min(span, length)
      )
    );
  };

  const onTouchEnd = () => {
    touchRef.current = null;
  };

  return {
    viewport,
    canGoEarlier,
    canGoLater,
    isAtLatest,
    goEarlier,
    goLater,
    jumpLatest,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    needsNav: length > windowSize,
  };
}

function TrendChartBody({
  stats,
  layout = "card",
  stockExtras = false,
  viewport,
  onActiveIndex,
}: {
  stats: DashboardStats;
  layout?: ExpandLayout;
  stockExtras?: boolean;
  viewport?: Viewport;
  onActiveIndex?: (index: number | null) => void;
}) {
  const expanded = layout !== "card";
  const landscape = layout === "mobile-landscape";
  const stockMode = expanded || stockExtras;
  const fullData = stats.trend as ChartPoint[];
  const data =
    viewport && stockMode
      ? fullData.slice(viewport.start, viewport.end + 1)
      : fullData;
  const peak = data.reduce((max, point) => Math.max(max, point.cumulative), 0);
  const maxDaily = data.reduce((max, point) => Math.max(max, point.scans), 0);
  const pointCount = data.length;
  const showAllDots = stockMode && pointCount <= 45;
  const last = data.length ? data[data.length - 1] : null;
  const lastIndexInFull = fullData.length ? fullData.length - 1 : -1;
  const lastVisible =
    last && viewport
      ? viewport.end >= lastIndexInFull
      : Boolean(last);

  if (!fullData.length) {
    return (
      <div
        className={[
          "flex w-full items-center justify-center px-6 text-center text-sm text-muted",
          expanded ? "h-full min-h-[12rem]" : "h-[min(52vw,20rem)] sm:h-[20rem] lg:h-[22rem]",
        ].join(" ")}
      >
        No scan data yet. When someone opens your card, the trend line will appear here.
      </div>
    );
  }

  return (
    <div
      className={
        expanded
          ? "h-full min-h-0 w-full"
          : "h-[min(52vw,20rem)] w-full sm:h-[20rem] lg:h-[22rem]"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: stockMode ? 12 : 12,
            right: stockMode ? 8 : 10,
            left: stockMode ? 4 : -6,
            bottom: stockMode ? 28 : 8,
          }}
          onMouseMove={(state) => {
            const idx = typeof state?.activeTooltipIndex === "number" ? state.activeTooltipIndex : null;
            onActiveIndex?.(idx);
          }}
          onMouseLeave={() => onActiveIndex?.(null)}
        >
          <defs>
            <linearGradient id="scanTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1affff" stopOpacity={stockMode ? 0.28 : 0.32} />
              <stop offset="100%" stopColor="#1affff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="hsl(200 18% 22% / 0.28)"
            strokeDasharray={stockMode ? "3 8" : "2 8"}
            vertical={false}
            horizontal
          />
          <XAxis
            dataKey="label"
            stroke="hsl(200 8% 78%)"
            fontSize={11}
            height={stockMode ? 32 : 30}
            tickLine={false}
            axisLine={{ stroke: "hsl(200 18% 22% / 0.35)", strokeWidth: 1 }}
            minTickGap={landscape ? 16 : stockMode ? 18 : 20}
            interval="preserveStartEnd"
            padding={{ left: 4, right: 4 }}
            tickMargin={8}
          />
          {stockMode ? (
            <YAxis
              yAxisId="volume"
              orientation="left"
              hide
              domain={[0, Math.max(4, maxDaily * 4)]}
            />
          ) : null}
          <YAxis
            yAxisId="price"
            stroke="hsl(200 8% 78%)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={stockMode ? 24 : 28}
            domain={chartDomain(peak)}
            orientation="right"
            tickMargin={4}
          />
          <Tooltip
            cursor={stockMode ? <StockCrosshair /> : { stroke: "#1affff", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={stockMode ? <StockPointTooltip /> : <CardTooltip />}
            isAnimationActive={false}
            offset={16}
          />
          {stockMode ? (
            <Bar
              yAxisId="volume"
              dataKey="scans"
              name="Daily scans"
              fill="hsl(185 100% 55% / 0.22)"
              radius={[3, 3, 0, 0]}
              maxBarSize={pointCount > 60 ? 6 : 14}
              isAnimationActive={false}
            />
          ) : null}
          <Area
            yAxisId="price"
            type={stockMode ? "linear" : "monotone"}
            dataKey="cumulative"
            stroke="none"
            fill="url(#scanTrendFill)"
            isAnimationActive={!stockMode}
            animationDuration={700}
          />
          <Line
            yAxisId="price"
            type={stockMode ? "linear" : "monotone"}
            dataKey="cumulative"
            name="Total scans"
            stroke="#1affff"
            strokeWidth={stockMode ? 2.5 : 2.75}
            dot={showAllDots ? stockDot : false}
            activeDot={{
              r: stockMode ? 7 : 5,
              fill: "#1affff",
              stroke: "#0a0d12",
              strokeWidth: 2.5,
            }}
            isAnimationActive={!stockMode}
            animationDuration={700}
          />
          {!stockMode ? (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="scans"
              name="Daily scans"
              stroke="hsl(200 100% 70% / 0.45)"
              strokeWidth={1.25}
              dot={false}
              strokeDasharray="4 5"
            />
          ) : null}
          {stockMode && last && lastVisible ? (
            <>
              <ReferenceLine
                yAxisId="price"
                y={last.cumulative}
                stroke="#1affff"
                strokeOpacity={0.35}
                strokeDasharray="4 6"
                label={<LastValueLabel value={last.cumulative} />}
              />
              <ReferenceDot
                yAxisId="price"
                x={last.label}
                y={last.cumulative}
                r={5}
                fill="#1affff"
                stroke="#0a0d12"
                strokeWidth={2}
              />
            </>
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 border-t border-border/70 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-muted">
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-6 rounded bg-primary" />
        Cumulative total
      </span>
      <span className="flex items-center gap-2">
        <span className="h-2 w-3 rounded-sm bg-primary/25" />
        Daily volume
      </span>
    </div>
  );
}

function ChartHeaderStats({
  latest,
  period,
}: {
  latest: number;
  period: TrendPeriod;
}) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl font-semibold text-white">Scan progression</p>
      <p className="mt-2 font-metrics text-4xl font-semibold gradient-text">{latest}</p>
      <p className="mt-1 text-sm text-muted">
        Cumulative scans over the last {PERIOD_LABELS[period]}
      </p>
    </div>
  );
}

function ChartNavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "earlier" | "later";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={direction === "earlier" ? "Earlier dates" : "Later dates"}
      className="chart-nav-arrow"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25">
        {direction === "earlier" ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function ExpandedChartOverlay({
  stats,
  period,
  onPeriodChange,
  onClose,
  layout,
}: {
  stats: DashboardStats;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  onClose: () => void;
  layout: ExpandLayout;
}) {
  const isDesktopModal = layout === "desktop-modal";
  const isLandscape = layout === "mobile-landscape";
  const length = stats.trend.length;
  const {
    viewport,
    canGoEarlier,
    canGoLater,
    isAtLatest,
    goEarlier,
    goLater,
    jumpLatest,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    needsNav,
  } = useChartWindow(length, period, true);
  const lastActive = useRef<number | null>(null);

  const handleActiveIndex = (index: number | null) => {
    if (index == null) {
      lastActive.current = null;
      return;
    }
    if (lastActive.current !== index) {
      lastActive.current = index;
      hapticTick();
    }
  };

  const rangeLabel =
    stats.trend.length && viewport
      ? `${stats.trend[viewport.start]?.label || ""} - ${stats.trend[viewport.end]?.label || ""}`
      : "";

  const shell = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={[
        "chart-fullscreen-shell",
        isDesktopModal ? "chart-fullscreen-shell--desktop" : "chart-fullscreen-shell--mobile",
        isLandscape ? "chart-fullscreen-shell--landscape" : "",
      ].join(" ")}
      onClick={isDesktopModal ? onClose : undefined}
    >
      <motion.div
        initial={isDesktopModal ? { opacity: 0, y: 16, scale: 0.98 } : { opacity: 0, y: 24 }}
        animate={isDesktopModal ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0 }}
        exit={isDesktopModal ? { opacity: 0, y: 12, scale: 0.98 } : { opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className={[
          "chart-fullscreen-panel flex flex-col",
          isDesktopModal ? "chart-fullscreen-panel--desktop" : "chart-fullscreen-panel--mobile",
          isLandscape ? "chart-fullscreen-panel--landscape" : "",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chart-glass-bar">
          <div className="chart-glass-bar__top">
            <CloseXButton onClick={onClose} />
            {!isAtLatest ? (
              <div className="ml-auto">
                <button type="button" className="chart-tool-chip" onClick={jumpLatest}>
                  Jump to latest
                </button>
              </div>
            ) : null}
          </div>
          <div className="chart-glass-bar__periods">
            <PeriodToggle period={period} onPeriodChange={onPeriodChange} glass />
          </div>
          {rangeLabel ? <p className="chart-glass-hint">{rangeLabel}</p> : null}
        </div>

        <div
          className="chart-fullscreen-canvas"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="chart-plot">
            <TrendChartBody
              stats={stats}
              layout={layout}
              stockExtras
              viewport={viewport}
              onActiveIndex={handleActiveIndex}
            />
          </div>
        </div>

        {needsNav ? (
          <div className="chart-nav-bar">
            <ChartNavArrow direction="earlier" disabled={!canGoEarlier} onClick={goEarlier} />
            <p className="chart-nav-bar__label">Swipe or tap arrows to move through dates</p>
            <ChartNavArrow direction="later" disabled={!canGoLater} onClick={goLater} />
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );

  return createPortal(shell, document.body);
}

export function StockTrendChart({
  stats,
  period,
  onPeriodChange,
}: {
  stats: DashboardStats;
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = useCanExpandChart();
  const expandLayout = useExpandLayout(expanded);
  const latest = stats.trend.length
    ? stats.trend[stats.trend.length - 1].cumulative
    : stats.total;

  useEffect(() => {
    if (!canExpand && expanded) setExpanded(false);
  }, [canExpand, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="border-b border-border/70 px-5 py-4">
          <ChartHeaderStats latest={latest} period={period} />

          <div className="mt-4 flex justify-center">
            <PeriodToggle
              period={period}
              onPeriodChange={onPeriodChange}
              onExpand={canExpand ? () => setExpanded(true) : undefined}
            />
          </div>
        </div>

        <TrendChartBody stats={stats} layout="card" />
        <ChartLegend />
      </motion.section>

      <AnimatePresence>
        {expanded && canExpand ? (
          <ExpandedChartOverlay
            stats={stats}
            period={period}
            onPeriodChange={onPeriodChange}
            onClose={() => setExpanded(false)}
            layout={expandLayout}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

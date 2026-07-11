import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { CardInteraction, ScanEvent } from "../lib/types";
import {
  formatScanLocation,
  formatScanWhen,
  interactionTitle,
  resolveDisplayTimezone,
  sourceLabel,
} from "../lib/format";
import {
  buildSessionTimeline,
  countLinkClicks,
  isReturnVisit,
} from "../lib/activity";
import { fetchSessionInteractions } from "../lib/supabase";

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { body, documentElement } = document;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      htmlOverflow: documentElement.style.overflow,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      documentElement.style.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

export function ActivityDetailSheet({
  scan,
  allScans,
  interactions,
  open,
  onClose,
}: {
  scan: ScanEvent | null;
  allScans: ScanEvent[];
  interactions: CardInteraction[];
  open: boolean;
  onClose: () => void;
}) {
  useBodyScrollLock(open && Boolean(scan));
  const [sessionInteractions, setSessionInteractions] = useState<CardInteraction[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !scan?.session_id) {
      setSessionInteractions([]);
      return;
    }

    let cancelled = false;
    const cached = interactions.filter((row) => row.session_id === scan.session_id);
    setSessionInteractions(cached);
    setLoadingJourney(true);

    fetchSessionInteractions(scan.session_id)
      .then((rows) => {
        if (!cancelled) setSessionInteractions(rows);
      })
      .catch(() => {
        if (!cancelled) setSessionInteractions(cached);
      })
      .finally(() => {
        if (!cancelled) setLoadingJourney(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, scan?.session_id, scan?.id, interactions]);

  if (!scan) return null;

  const tz = resolveDisplayTimezone(scan);
  const when = formatScanWhen(scan.scanned_at, tz);
  const returnVisit = isReturnVisit(scan, allScans);
  const timeline = buildSessionTimeline(scan.session_id, allScans, sessionInteractions);
  const clickCount = countLinkClicks(timeline);

  const sheet = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="visit-sheet-backdrop"
          />
          <div className="visit-sheet-shell">
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Visit details"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="visit-sheet sidebar-glass"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="visit-sheet__chrome">
                <div className="visit-sheet__handle" aria-hidden />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">
                      Visit details
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold md:text-2xl">
                      {formatScanLocation(scan)}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="visit-sheet__close"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`visit-badge${returnVisit ? " visit-badge--return" : ""}`}>
                    {returnVisit ? "Return visitor" : "First visit"}
                  </span>
                  {clickCount > 0 ? (
                    <span className="visit-badge">
                      {clickCount} action{clickCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="visit-sheet__body">
                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div className="visit-card">
                    <dt className="visit-card__label">When</dt>
                    <dd className="mt-1 font-medium">{when.day}</dd>
                    <dd className="text-primary">
                      {when.time}{" "}
                      <span className="text-xs text-muted">{when.zone}</span>
                    </dd>
                  </div>
                  <div className="visit-card">
                    <dt className="visit-card__label">Source</dt>
                    <dd className="mt-1 font-medium">
                      {sourceLabel(scan.source || "direct")}
                    </dd>
                  </div>
                  <div className="visit-card">
                    <dt className="visit-card__label">Device</dt>
                    <dd className="mt-1 font-medium capitalize">
                      {scan.device_type || "Unknown"}
                    </dd>
                  </div>
                  <div className="visit-card">
                    <dt className="visit-card__label">Location</dt>
                    <dd className="mt-1 font-medium">{formatScanLocation(scan)}</dd>
                    <dd className="mt-1 text-[11px] text-muted">Approximate (IP-based)</dd>
                  </div>
                  {scan.referrer ? (
                    <div className="visit-card sm:col-span-2 lg:col-span-4">
                      <dt className="visit-card__label">Referrer</dt>
                      <dd className="mt-1 break-all text-foreground/90">
                        {scan.referrer}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">
                    Session timeline
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Land → view card → taps. Tab switches show as left / came back to tab.
                  </p>
                  {loadingJourney && !timeline.length ? (
                    <p className="mt-3 text-sm text-muted">Loading journey...</p>
                  ) : timeline.length ? (
                    <ol className="mt-3 space-y-2">
                      {timeline.map((entry, index) => {
                        if (entry.kind === "scan") {
                          const entryWhen = formatScanWhen(
                            entry.scan.scanned_at,
                            resolveDisplayTimezone(entry.scan)
                          );
                          return (
                            <li key={`scan-${entry.scan.id}`} className="timeline-item">
                              <span className="timeline-item__step" aria-hidden>
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">Landed on card</p>
                                <p className="text-xs text-muted">
                                  {entryWhen.day} - {entryWhen.time}
                                </p>
                              </div>
                            </li>
                          );
                        }

                        const entryWhen = formatScanWhen(
                          entry.interaction.occurred_at,
                          resolveDisplayTimezone(scan)
                        );
                        return (
                          <li
                            key={`event-${entry.interaction.id}`}
                            className="timeline-item"
                          >
                            <span className="timeline-item__step" aria-hidden>
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {interactionTitle(entry.interaction)}
                              </p>
                              <p className="text-xs text-muted">
                                {entryWhen.day} - {entryWhen.time}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm text-muted">
                      No journey events yet. Lands, views, and taps will appear here in
                      order.
                    </p>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(sheet, document.body);
}

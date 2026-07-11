const ICONS = {
  website:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  typeform:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>',
  calendar:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h4"/></svg>',
  email:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  external:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
  portfolio:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
};

/* Port of BusinessCardStats ring math from ClearStack site */
/* Matches ClearStack PerformanceRing compact: 68px ring, 4px stroke */
const RING_SIZE = 68;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ratingStarSvg() {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2.75l2.18 4.52 4.97.76-3.6 3.38.85 4.94L12 14.9l-4.4 2.45.85-4.94-3.6-3.38 4.97-.76L12 2.75z" fill="currentColor"/></svg>`;
}

function iconFor(id) {
  if (id === "linkedin") return ICONS.linkedin;
  if (id === "book") return ICONS.calendar;
  if (id === "typeform") return ICONS.typeform;
  if (id === "website") return ICONS.website;
  if (id === "portfolio") return ICONS.portfolio;
  if (id === "email") return ICONS.email;
  return ICONS.external;
}

function absoluteUrl(baseUrl, path) {
  try {
    return new URL(path, baseUrl).href;
  } catch {
    return path;
  }
}

function metaBaseUrl(cfg) {
  const placeholder = "your-card.vercel.app";
  const raw = String(cfg.baseUrl || "").trim();
  if (typeof window !== "undefined" && (!raw || raw.includes(placeholder))) {
    return window.location.origin;
  }
  return raw.replace(/\/$/, "");
}

function canonicalCardUrl(cfg) {
  const base = metaBaseUrl(cfg).replace(/\/$/, "");
  let path = String(cfg.cardPath || "/card").trim() || "/card";
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}

function contactActionLinks(cfg) {
  const contact = cfg.contact || {};
  const actions = [];
  const email = String(contact.email || "").trim();
  if (email) {
    actions.push({ id: "email", label: "Email", url: `mailto:${email}` });
  }
  return actions;
}

function linkDescription(link) {
  return String(link.description || "").trim();
}

function appendLinkContents(textWrap, labelText, optionalDesc) {
  const label = document.createElement("span");
  label.className = "link-card__label";
  label.textContent = labelText;
  textWrap.append(label);
  const descStr = String(optionalDesc || "").trim();
  if (descStr) {
    const desc = document.createElement("span");
    desc.className = "link-card__desc";
    desc.textContent = descStr;
    textWrap.append(desc);
  }
}

function linkPrefersSameTab(link) {
  const url = String(link.url || "");
  if (link.id === "book" || link.id === "typeform") return true;
  return /calendly\.com|typeform\.com|clearstackdigital\.com\.au\/start-website-build/i.test(
    url
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const SCAN_SESSION_KEY = "clearstack-card-scan-session";

function getOrCreateScanSessionId() {
  try {
    const existing = sessionStorage.getItem(SCAN_SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SCAN_SESSION_KEY, id);
    return id;
  } catch {
    return `sess-${Date.now()}`;
  }
}

function resolveScanSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const src = String(params.get("src") || "").trim().toLowerCase();
    if (src === "qr" || src.startsWith("qr")) return "qr";
    if (document.referrer) return "referral";
    return "direct";
  } catch {
    return "direct";
  }
}

function trackCardScan() {
  if (typeof window === "undefined" || typeof fetch !== "function") return;

  const sessionId = getOrCreateScanSessionId();
  const dedupeKey = `clearstack-card-scan-sent:${sessionId}`;
  try {
    if (sessionStorage.getItem(dedupeKey) === "1") return;
    sessionStorage.setItem(dedupeKey, "1");
  } catch {
    /* continue without dedupe storage */
  }

  const payload = JSON.stringify({
    session_id: sessionId,
    source: resolveScanSource(),
    referrer: document.referrer || null,
  });

  fetch("/api/track-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    /* silent — never interrupt the card experience */
  });
}

function appendLinkRow(linksMount, link, { external, primary }) {
  const li = document.createElement("li");
  li.className = "link-list__item";
  const desc = linkDescription(link);

  const a = document.createElement("a");
  a.className = [
    "link-card",
    desc ? "" : "link-card--compact",
    primary ? "link-card--primary" : "",
  ]
    .filter(Boolean)
    .join(" ");
  a.href = link.url;
  const opensNewTab = external && !linkPrefersSameTab(link);
  if (opensNewTab) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute(
      "aria-label",
      desc ? `${link.label}: ${desc} (opens in new tab)` : `${link.label} (opens in new tab)`
    );
  } else {
    a.setAttribute(
      "aria-label",
      desc ? `${link.label}: ${desc}` : link.label
    );
  }

  const text = document.createElement("div");
  text.className = "link-card__text";
  appendLinkContents(text, link.label, desc);

  const iconWrap = document.createElement("span");
  iconWrap.className = "link-card__icon";
  iconWrap.innerHTML = iconFor(link.id);

  a.append(text, iconWrap);
  li.append(a);
  linksMount.append(li);
}

function ringProgress(item) {
  if (typeof item.ring === "number" && Number.isFinite(item.ring)) {
    return Math.min(1, Math.max(0, item.ring));
  }
  if (typeof item.value === "number" && Number.isFinite(item.value)) {
    return Math.min(1, Math.max(0, item.value / 100));
  }
  return 1;
}

function createProofGauge(item, index) {
  const progress = ringProgress(item);
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  const display = String(item.display || item.value || "").trim();
  const labelText = String(item.label || "");

  const article = document.createElement("article");
  article.className = "proof-gauge";
  article.style.setProperty("--circumference", String(RING_CIRCUMFERENCE));
  article.style.setProperty("--offset", String(offset));
  article.dataset.proofId = String(item.id || index);
  article.setAttribute("aria-label", `${labelText}: ${display}`);

  const ring = document.createElement("div");
  ring.className = "proof-gauge__ring";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "proof-gauge__svg");
  svg.setAttribute("width", String(RING_SIZE));
  svg.setAttribute("height", String(RING_SIZE));
  svg.setAttribute("viewBox", `0 0 ${RING_SIZE} ${RING_SIZE}`);
  svg.setAttribute("aria-hidden", "true");

  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  track.setAttribute("class", "proof-gauge__track");
  track.setAttribute("cx", String(cx));
  track.setAttribute("cy", String(cy));
  track.setAttribute("r", String(RING_RADIUS));

  const bar = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  bar.setAttribute("class", "proof-gauge__progress");
  bar.setAttribute("cx", String(cx));
  bar.setAttribute("cy", String(cy));
  bar.setAttribute("r", String(RING_RADIUS));

  svg.append(track, bar);

  const valueWrap = document.createElement("div");
  valueWrap.className = "proof-gauge__value";

  const valueEl = document.createElement("span");
  valueEl.className = "proof-gauge__number";
  valueEl.textContent = display;
  valueWrap.append(valueEl);

  if (item.star) {
    const star = document.createElement("span");
    star.className = "proof-gauge__star";
    star.innerHTML = ratingStarSvg();
    valueWrap.append(star);
  }

  ring.append(svg, valueWrap);

  const label = document.createElement("p");
  label.className = "proof-gauge__label";
  label.textContent = labelText;

  article.append(ring, label);

  return {
    el: article,
    valueEl,
    item,
    display,
    progress,
  };
}

function runProofAnimations(gauges) {
  const reduced = prefersReducedMotion();

  gauges.forEach((gauge, index) => {
    const { el, valueEl, display } = gauge;
    valueEl.textContent = display;

    const start = () => {
      el.classList.add("is-ready");

      if (reduced) {
        el.classList.add("is-instant", "is-complete");
        return;
      }

      el.classList.add("is-animated");
      requestAnimationFrame(() => {
        el.classList.add("is-complete");
      });
    };

    if (reduced) {
      start();
      return;
    }

    window.setTimeout(start, 90 + index * 160);
  });
}

function scrollCardToTop() {
  if (typeof window === "undefined") return;
  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  } catch {
    /* ignore */
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function renderIntro(root, cfg) {
  const intro = cfg.intro || {};
  const bodyMount = root.querySelector("[data-mount='intro']");
  const section = root.querySelector(".card__intro");
  if (!bodyMount || !section) return false;

  const paragraphs = Array.isArray(intro.paragraphs)
    ? intro.paragraphs.map((p) => String(p || "").trim()).filter(Boolean)
    : [];

  if (!paragraphs.length) {
    section.hidden = true;
    return false;
  }

  bodyMount.innerHTML = "";
  for (const text of paragraphs) {
    const p = document.createElement("p");
    p.textContent = text;
    bodyMount.append(p);
  }
  return true;
}

function renderProof(root, cfg) {
  const mount = root.querySelector("[data-mount='proof']");
  if (!mount) return [];

  const items = Array.isArray(cfg.proof) ? cfg.proof : [];
  mount.innerHTML = "";

  if (!items.length) {
    mount.hidden = true;
    return [];
  }

  const gauges = items.map((item, index) => createProofGauge(item, index));
  for (const gauge of gauges) {
    mount.append(gauge.el);
  }
  return gauges;
}

function continueLabel(cfg) {
  const label = String(cfg.welcome?.continueLabel || "Continue").trim();
  return label || "Continue";
}

/**
 * Curved-arc wipe up — identical to ClearStack SiteIntroLoader exit
 * (the motion after the loader hits 100%). No progress bar here:
 * tapping Continue = that 100% moment.
 *
 * SiteIntroLoader sequence:
 *   HOLD_MS (300) → setExiting(true) → EXIT_MS (750) → unmount
 */
const HOLD_MS = 300;
const EXIT_MS = 750;
const SETTLE_RAF_COUNT = 3;

function runCurvedWipeExit(panel, onComplete) {
  if (!panel) {
    onComplete?.();
    return;
  }

  if (prefersReducedMotion()) {
    panel.hidden = true;
    onComplete?.();
    return;
  }

  // Pin scroll so iOS doesn't fight the transform mid-wipe
  panel.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  let remaining = SETTLE_RAF_COUNT;
  function settleStep() {
    remaining -= 1;
    if (remaining > 0) {
      requestAnimationFrame(settleStep);
      return;
    }

    // Same HOLD_MS as SiteIntroLoader after counter snaps to 100
    window.setTimeout(() => {
      // Drop any entrance animation so wipe transform owns the layer
      panel.style.animation = "none";
      // Force a layout pass so the transition always fires (esp. iOS)
      void panel.offsetHeight;
      panel.classList.add("is-exiting");

      window.setTimeout(() => {
        panel.hidden = true;
        panel.classList.remove("is-exiting");
        panel.style.animation = "";
        onComplete?.();
      }, EXIT_MS);
    }, HOLD_MS);
  }
  requestAnimationFrame(settleStep);
}

function preloadCardImages(cardStep) {
  const photo = cardStep?.querySelector(".card__photo");
  const logo = cardStep?.querySelector(".card__logo");
  for (const img of [photo, logo]) {
    if (img?.src) {
      const preloader = new Image();
      preloader.src = img.src;
    }
  }
}

function revealCardStep(welcomeStep, cardStep) {
  const skipLink = document.querySelector(".skip-link");
  const continueBtn = welcomeStep.querySelector('[data-action="continue"]');

  if (welcomeStep.classList.contains("is-exiting")) return;
  if (welcomeStep.dataset.exiting === "1") return;
  welcomeStep.dataset.exiting = "1";
  if (continueBtn) continueBtn.disabled = true;

  // Card sits underneath (same as ClearStack site under the loader)
  cardStep.hidden = false;
  cardStep.classList.add("is-visible");
  scrollCardToTop();
  welcomeStep.scrollTop = 0;

  runCurvedWipeExit(welcomeStep, () => {
    delete welcomeStep.dataset.exiting;
    if (continueBtn) continueBtn.disabled = false;
    if (skipLink) skipLink.setAttribute("href", "#main");
    scrollCardToTop();
    cardStep.focus({ preventScroll: true });
    requestAnimationFrame(scrollCardToTop);
  });
}

function showWelcomeStep(welcomeStep, cardStep, gauges) {
  preloadCardImages(cardStep);
  scrollCardToTop();
  runProofAnimations(gauges);
  requestAnimationFrame(() => {
    scrollCardToTop();
    welcomeStep.focus({ preventScroll: true });
  });
}

function wireWelcomeGate(welcomeStep, cardStep, cfg, gauges) {
  const continueBtn = welcomeStep.querySelector('[data-action="continue"]');
  if (!continueBtn) return;

  continueBtn.textContent = continueLabel(cfg);
  continueBtn.addEventListener("click", () => {
    revealCardStep(welcomeStep, cardStep);
  });
}

function setMeta(cfg) {
  const base = metaBaseUrl(cfg);
  const pageTitle =
    String(cfg.documentTitle || "").trim() ||
    `${cfg.name} - ${cfg.organization}`;
  const desc = `${cfg.name}, ${cfg.title} at ${cfg.organization}. Start a website project or book a call.`;
  document.title = pageTitle;

  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };

  const photoAbs = cfg.photo.startsWith("http") ? cfg.photo : absoluteUrl(base, cfg.photo);
  const shareUrl = canonicalCardUrl(cfg);

  set('meta[name="description"]', "content", desc);
  set('meta[property="og:title"]', "content", pageTitle);
  set('meta[property="og:description"]', "content", desc);
  set('meta[property="og:url"]', "content", shareUrl);
  set('meta[property="og:image"]', "content", photoAbs);
  set('meta[name="twitter:title"]', "content", pageTitle);
  set('meta[name="twitter:description"]', "content", desc);
  set('meta[name="twitter:image"]', "content", photoAbs);
}

function render(cfg) {
  const template = document.getElementById("card-template");
  const mount = document.getElementById("app");
  if (!template || !mount) return;

  const node = template.content.cloneNode(true);
  const welcomeStep = node.querySelector('[data-step="welcome"]');
  const cardStep = node.querySelector('[data-step="card"]');
  if (!welcomeStep || !cardStep) return;

  renderIntro(welcomeStep, cfg);
  const gauges = renderProof(welcomeStep, cfg);

  const photo = cardStep.querySelector(".card__photo");
  const logo = cardStep.querySelector(".card__logo");
  const nameEl = cardStep.querySelector('[data-field="name"]');
  const titleEl = cardStep.querySelector('[data-field="title"]');
  const orgEl = cardStep.querySelector('[data-field="organization"]');
  const linksMount = cardStep.querySelector("[data-mount='links']");

  photo.src = cfg.photo.startsWith("http") ? cfg.photo : cfg.photo;
  photo.alt = `Portrait of ${cfg.name}`;

  logo.src = cfg.logo.startsWith("http") ? cfg.logo : cfg.logo;
  logo.alt = `${cfg.organization} logo`;

  nameEl.textContent = cfg.name;
  titleEl.textContent = cfg.title;
  orgEl.textContent = cfg.organization;

  linksMount.innerHTML = "";

  const contactLinks = contactActionLinks(cfg);
  const configLinks = (cfg.links || []).filter(
    (link) => link.url && link.action !== "vcard" && link.action !== "copy-email"
  );
  const allLinks = [...configLinks, ...contactLinks];

  for (const link of allLinks) {
    const external = link.id !== "email";
    const primary = link.id === "book";
    appendLinkRow(linksMount, link, { external, primary });
  }

  mount.innerHTML = "";
  const stage = node.querySelector(".card-stage");
  if (stage) {
    mount.append(stage);
  } else {
    mount.append(welcomeStep, cardStep);
  }
  mount.classList.remove("is-loading");
  mount.removeAttribute("aria-busy");

  wireWelcomeGate(welcomeStep, cardStep, cfg, gauges);
  showWelcomeStep(welcomeStep, cardStep, gauges);
}

async function init() {
  scrollCardToTop();
  trackCardScan();
  try {
    const res = await fetch("/site-config.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Config not found");
    const cfg = await res.json();
    setMeta(cfg);
    render(cfg);
  } catch (e) {
    const mount = document.getElementById("app");
    if (mount) {
      mount.innerHTML =
        '<main class="card" style="padding:2rem;text-align:center"><p>Could not load <code>site-config.json</code>. Serve this folder over HTTP (e.g. <code>npx serve .</code>) or deploy to Vercel.</p></main>';
      mount.classList.remove("is-loading");
    }
    console.error(e);
  }
}

init();

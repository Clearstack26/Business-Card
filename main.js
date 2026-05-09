const ICONS = {
  website:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  typeform:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>',
  contact:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  external:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
};

function iconFor(id) {
  if (id === "linkedin") return ICONS.linkedin;
  if (id === "typeform" || id === "book") return ICONS.typeform;
  if (id === "website") return ICONS.website;
  if (id === "contact") return ICONS.contact;
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

function linkUrlById(links, id) {
  const hit = links?.find((l) => l.id === id && l.url);
  return hit?.url || "";
}

/** Prefer book-a-call URL for vCard if present, else legacy typeform id */
function bookUrlFromLinks(links) {
  return (
    linkUrlById(links, "book") ||
    linkUrlById(links, "typeform") ||
    ""
  );
}

function canonicalCardUrl(cfg) {
  const base = metaBaseUrl(cfg).replace(/\/$/, "");
  let path = String(cfg.cardPath || "/card").trim() || "/card";
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}

/** Plaintext fallback when file share isn't available — good for Messages, partial manual add */
function buildContactDigestText(cfg) {
  const lines = [];
  const contact = cfg.contact || {};
  const links = cfg.links || [];
  const name = String(cfg.name || "").trim();
  if (name) lines.push(name);
  if (cfg.title && cfg.organization) {
    lines.push(`${cfg.title} · ${cfg.organization}`);
  } else if (cfg.title) {
    lines.push(cfg.title);
  } else if (cfg.organization) {
    lines.push(cfg.organization);
  }
  const tel = String(contact.phone || "").trim();
  if (tel) lines.push(`Phone: ${tel}`);
  const email = String(contact.email || "").trim();
  if (email) lines.push(`Email: ${email}`);
  const website =
    String(contact.website || "").trim() || linkUrlById(links, "website");
  if (website) lines.push(`Website: ${website}`);
  const linkedin = linkUrlById(links, "linkedin");
  if (linkedin) lines.push(`LinkedIn: ${linkedin}`);
  const book = bookUrlFromLinks(links);
  if (book) lines.push(`Book a call: ${book}`);
  const note = String(contact.note || "").trim();
  if (note) lines.push(note);
  lines.push("");
  lines.push(`Digital card: ${canonicalCardUrl(cfg)}`);
  return lines.join("\n").trimEnd();
}

/**
 * Opens share sheet with a text digest after vCard file share couldn't run / was unsupported.
 * @returns {Promise<boolean>} true when share completed (not aborted)
 */
async function tryShareContactDigest(cfg) {
  if (!navigator.share) return false;
  const text = buildContactDigestText(cfg);
  if (!text.trim()) return false;
  try {
    await navigator.share({
      title: `Add ${String(cfg.name || "Contact").trim()} to Contacts`,
      text,
    });
    return true;
  } catch (e) {
    if (e && e.name === "AbortError") return false;
    return false;
  }
}

function escapeVCardValue(str) {
  return String(str || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function structuredName(fullName) {
  const full = String(fullName || "").trim();
  if (!full) return { fn: "", n: ";;;;" };
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const g = escapeVCardValue(parts[0]);
    return { fn: escapeVCardValue(full), n: `;${g};;;` };
  }
  const family = escapeVCardValue(parts[parts.length - 1]);
  const given = escapeVCardValue(parts.slice(0, -1).join(" "));
  return { fn: escapeVCardValue(full), n: `${family};${given};;;` };
}

function foldLine(line) {
  const max = 73;
  if (line.length <= max) return line;
  let out = "";
  let rest = line;
  while (rest.length > max) {
    out += `${rest.slice(0, max)}\r\n `;
    rest = rest.slice(max);
  }
  return out + rest;
}

function bytesToBase64(bytes) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function fetchPhotoBase64(photoUrl) {
  const res = await fetch(photoUrl, { mode: "cors", cache: "force-cache" });
  if (!res.ok) throw new Error("photo fetch failed");
  const buf = await res.arrayBuffer();
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const path = (() => {
    try {
      return new URL(photoUrl).pathname.toLowerCase();
    } catch {
      return String(photoUrl).toLowerCase();
    }
  })();
  let type = "PNG";
  if (ct.includes("jpeg") || ct.includes("jpg") || /\.jpe?g$/i.test(path)) {
    type = "JPEG";
  } else if (ct.includes("webp") || path.endsWith(".webp")) {
    type = "WEBP";
  } else if (path.endsWith(".png")) {
    type = "PNG";
  }
  return { base64: bytesToBase64(buf), type };
}

function slugFileName(name) {
  return (
    String(name || "contact")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "contact"
  );
}

async function buildVCardPayload(cfg, opts = { photoMode: "embed" }) {
  const base = metaBaseUrl(cfg);
  const photoHref = cfg.photo.startsWith("http")
    ? cfg.photo
    : absoluteUrl(base, cfg.photo);
  const contact = cfg.contact || {};
  const { fn, n } = structuredName(cfg.name);
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  /** Stable-ish UID helps some clients recognise updates; REV helps sync */
  try {
    const uid = crypto.randomUUID();
    lines.push(`UID:${uid}`);
  } catch {
    lines.push(`UID:urn:business-card:${slugFileName(cfg.name)}:${Date.now()}`);
  }
  const rev =
    typeof cfg.vcardRevision === "string" && cfg.vcardRevision.trim()
      ? cfg.vcardRevision.trim()
      : (() => {
          const d = new Date();
          const p = (n) => String(n).padStart(2, "0");
          return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(
            d.getUTCDate()
          )}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
        })();
  lines.push(`REV:${rev}`);

  if (fn) {
    lines.push(`FN:${fn}`);
    lines.push(`N:${n}`);
  }
  if (cfg.organization) {
    lines.push(`ORG:${escapeVCardValue(cfg.organization)}`);
  }
  if (cfg.title) {
    lines.push(`TITLE:${escapeVCardValue(cfg.title)}`);
  }
  const tel = String(contact.phone || "").trim();
  if (tel) {
    lines.push(`TEL;TYPE=CELL,VOICE:${escapeVCardValue(tel)}`);
  }
  const email = String(contact.email || "").trim();
  if (email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(email)}`);
  }
  const website =
    String(contact.website || "").trim() ||
    linkUrlById(cfg.links, "website");
  if (website) {
    lines.push(`URL;TYPE=WORK:${escapeVCardValue(website)}`);
  }
  const linkedin = linkUrlById(cfg.links, "linkedin");
  if (linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${escapeVCardValue(linkedin)}`);
  }
  const booking = bookUrlFromLinks(cfg.links);
  if (booking) {
    lines.push(`URL;TYPE=Booking:${escapeVCardValue(booking)}`);
  }
  const note = String(contact.note || "").trim();
  if (note) {
    lines.push(`NOTE:${escapeVCardValue(note)}`);
  }

  if (opts.photoMode === "uri") {
    lines.push(`PHOTO;VALUE=URI:${escapeVCardValue(photoHref)}`);
  } else {
    try {
      const { base64, type } = await fetchPhotoBase64(photoHref);
      const raw = `PHOTO;ENCODING=b;TYPE=${type}:${base64}`;
      lines.push(foldLine(raw));
    } catch {
      lines.push(`PHOTO;VALUE=URI:${escapeVCardValue(photoHref)}`);
    }
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** @returns {Promise<"abort" | "ok" | "skip">} */
async function shareVCardBlob(blob, filename, displayName) {
  const file = new File([blob], filename, {
    type: "text/vcard;charset=utf-8",
    lastModified: Date.now(),
  });
  if (!(navigator.share && typeof navigator.canShare === "function")) {
    return "skip";
  }
  let sharable = false;
  try {
    sharable = navigator.canShare({ files: [file] });
  } catch {
    return "skip";
  }
  if (!sharable) return "skip";
  try {
    await navigator.share({
      files: [file],
      title: `Add ${displayName} to Contacts`,
      text: `${displayName}. Open in Contacts to save.`,
    });
    return "ok";
  } catch (e) {
    if (e && e.name === "AbortError") return "abort";
    return "skip";
  }
}

/** Shown in the popup tab while the vCard binary is assembled (often instant if prefetched). */
function writeVcardPreparingPlaceholder(win) {
  if (!win || win.closed) return;
  try {
    win.document.open();
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,color-scheme=light"/><meta name="theme-color" content="#f4f2ed"/><title>Add to Contacts</title><style>
body{font-family:system-ui,-apple-system,sans-serif;margin:0;min-height:100dvh;display:grid;place-items:center;background:#f4f2ed;color:#4a4456;text-align:center;padding:1.5rem;box-sizing:border-box}
p{max-width:18rem;line-height:1.5;margin:0;font-size:15px}
strong{color:#0f0e14;font-weight:600}</style></head><body><p><strong>Opening Contacts save…</strong><br/>You can leave this tab open.</p></body></html>`);
    win.document.close();
  } catch {
    /* about:blank may be restricted on some browsers */
  }
}

/**
 * Share sheet first (often includes “Contacts”), with a smaller vCard retry if the embed is huge.
 * @returns {Promise<"abort" | "ok" | "skip">}
 */
async function shareVCardFromEmbedText(cfg, textEmbed, displayName) {
  const filename = `${slugFileName(cfg.name)}.vcf`;
  const blobEmbed = new Blob([textEmbed], { type: "text/vcard;charset=utf-8" });

  let r = await shareVCardBlob(blobEmbed, filename, displayName);
  if (r === "abort" || r === "ok") return r;

  if (r === "skip" && blobEmbed.size > 120000) {
    try {
      const liteTxt = await buildVCardPayload(cfg, { photoMode: "uri" });
      const liteBlob = new Blob([liteTxt], { type: "text/vcard;charset=utf-8" });
      r = await shareVCardBlob(liteBlob, filename, displayName);
      if (r === "abort" || r === "ok") return r;
    } catch {
      /* fall through */
    }
  }

  if (await tryShareContactDigest(cfg)) return "ok";

  return "skip";
}

function isLikelyInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|LinkedInApp|Line\/|Snapchat|.*; wv\)|MicroMessenger/i.test(
    ua
  );
}

/**
 * Delivers vCard: optionally Web Share first, then blob in helper tab, then download.
 * @param {{ tryShareFirst?: boolean }} [opts] — set false when share was already attempted from the same tap
 */
async function deliverEmbedVCard(cfg, textEmbed, reservedWindow, opts) {
  const tryShareFirst = opts?.tryShareFirst !== false;

  if (tryShareFirst) {
    const sr = await shareVCardFromEmbedText(cfg, textEmbed, cfg.name);
    if (sr === "abort") {
      reservedWindow?.close?.();
      return;
    }
    if (sr === "ok") {
      reservedWindow?.close?.();
      return;
    }
  }

  const filename = `${slugFileName(cfg.name)}.vcf`;
  const blobEmbed = new Blob([textEmbed], { type: "text/vcard;charset=utf-8" });

  let openPayload = textEmbed;
  try {
    if (blobEmbed.size > 220000) {
      openPayload = await buildVCardPayload(cfg, { photoMode: "uri" });
    }
  } catch {
    openPayload = textEmbed;
  }
  const openBlob = new Blob([openPayload], { type: "text/vcard;charset=utf-8" });
  const objectUrl = URL.createObjectURL(openBlob);

  let openedInHelperTab = false;
  const helperWin = reservedWindow;
  if (helperWin && !helperWin.closed) {
    try {
      helperWin.location.replace(objectUrl);
      openedInHelperTab = true;
      setTimeout(() => URL.revokeObjectURL(objectUrl), 120000);
    } catch {
      helperWin.close();
    }
    if (openedInHelperTab) return;
  }

  helperWin?.close?.();
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("Open with Contacts, then tap Save", 5200);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
}

const vcardFlow = {
  prefetch: /** @type {Promise<string> | null} */ (null),
  cfg: /** @type {object | null} */ (null),
  focusReturn: /** @type {HTMLElement | null} */ (null),
  /** Set when prefetch resolves while the modal is open */
  embedText: /** @type {string | null} */ (null),
};

/** @param {"loading" | "ready" | "error"} state */
function setVcardApproveState(state) {
  const btn = document.getElementById("vcard-modal-approve");
  if (!btn) return;
  if (state === "loading") {
    btn.disabled = true;
    btn.textContent = "Preparing…";
  } else if (state === "ready") {
    btn.disabled = false;
    btn.textContent = "Approve";
  } else {
    btn.disabled = false;
    btn.textContent = "Try again";
  }
}

function getVcardModalEls() {
  const root = document.getElementById("vcard-modal");
  if (!root) return null;
  return {
    root,
    approveBtn: document.getElementById("vcard-modal-approve"),
  };
}

function openVcardModal(cfg, focusSource) {
  const els = getVcardModalEls();
  if (!els?.root || !cfg) return;

  vcardFlow.cfg = cfg;
  vcardFlow.embedText = null;
  vcardFlow.focusReturn =
    focusSource instanceof HTMLElement
      ? focusSource
      : /** @type {HTMLElement | null} */ (document.activeElement);
  const desc = document.getElementById("vcard-modal-desc");
  const nm = String(cfg?.name ?? "").trim();
  if (desc) {
    desc.textContent = nm
      ? `Save ${nm} to this device.`
      : `Save this contact to this device.`;
  }

  setVcardApproveState("loading");

  const cfgRef = cfg;
  vcardFlow.prefetch = buildVCardPayload(cfg, { photoMode: "embed" });
  vcardFlow.prefetch
    .then((text) => {
      if (vcardFlow.cfg !== cfgRef) return;
      vcardFlow.embedText = text;
      setVcardApproveState("ready");
    })
    .catch(() => {
      if (vcardFlow.cfg !== cfgRef) return;
      setVcardApproveState("error");
    });

  const iab = document.getElementById("vcard-modal-iab");
  if (iab) iab.hidden = !isLikelyInAppBrowser();

  els.root.hidden = false;
  els.approveBtn?.focus();

  trapVcardEscape(true);
}

function closeVcardModal() {
  const els = getVcardModalEls();
  if (!els?.root) return;

  els.root.hidden = true;
  vcardFlow.prefetch = null;
  vcardFlow.cfg = null;
  vcardFlow.embedText = null;
  trapVcardEscape(false);

  const iab = document.getElementById("vcard-modal-iab");
  if (iab) iab.hidden = true;

  const ret = vcardFlow.focusReturn;
  vcardFlow.focusReturn = null;
  if (ret && typeof ret.focus === "function") {
    window.setTimeout(() => ret.focus(), 0);
  }
}

/** @param {boolean} on */
function trapVcardEscape(on) {
  if (trapVcardEscape._bound === on) return;
  trapVcardEscape._bound = on;
  if (on) {
    document.addEventListener("keydown", onVcardKeydown);
  } else {
    document.removeEventListener("keydown", onVcardKeydown);
  }
}
trapVcardEscape._bound = false;

/** @param {KeyboardEvent} e */
function onVcardKeydown(e) {
  if (e.key !== "Escape") return;
  const els = getVcardModalEls();
  if (!els?.root || els.root.hidden) return;
  e.preventDefault();
  closeVcardModal();
}

function bindVcardModalUiOnce() {
  const els = getVcardModalEls();
  if (!els?.root || els.root.dataset.bound === "1") return;
  els.root.dataset.bound = "1";

  els.root.addEventListener("click", (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    if (t?.closest?.("[data-vcard-dismiss]")) closeVcardModal();
  });

  document.getElementById("vcard-modal-approve")?.addEventListener("click", () => {
    void onVcardApprove();
  });
}

async function onVcardApprove() {
  const cfg = vcardFlow.cfg;
  const prefetchPromise = vcardFlow.prefetch;
  let textEmbed = vcardFlow.embedText;
  if (!cfg) return;

  const approveBtn = document.getElementById("vcard-modal-approve");
  if (approveBtn?.disabled && approveBtn?.textContent === "Preparing…") return;

  if (!textEmbed) {
    if (approveBtn) {
      approveBtn.disabled = true;
      approveBtn.textContent = "Preparing…";
    }
    try {
      textEmbed = await (prefetchPromise != null
        ? prefetchPromise.catch(() => buildVCardPayload(cfg, { photoMode: "embed" }))
        : buildVCardPayload(cfg, { photoMode: "embed" }));
    } catch {
      if (approveBtn) setVcardApproveState("error");
      showToast("Could not load contact. Tap Try again.");
      return;
    }
    if (approveBtn) setVcardApproveState("ready");
  }

  if (isLikelyInAppBrowser()) {
    showToast("Open this page in Safari or Chrome, then tap Add to contacts", 5500);
  }

  closeVcardModal();

  const shareResult = await shareVCardFromEmbedText(cfg, textEmbed, cfg.name);
  if (shareResult === "ok" || shareResult === "abort") return;

  const w = window.open("about:blank", "_blank");
  if (!w) {
    showToast("Allow pop‑ups for this site, then try Approve again", 5000);
    try {
      await deliverEmbedVCard(cfg, textEmbed, null, { tryShareFirst: false });
    } catch {
      showToast("Could not finish save. Open in Safari or Chrome.");
    }
    return;
  }
  writeVcardPreparingPlaceholder(w);
  try {
    await deliverEmbedVCard(cfg, textEmbed, w, { tryShareFirst: false });
  } catch {
    if (!w.closed) w.close();
    showToast("Could not finish. Allow pop-ups or try Safari.");
  }
}

function showToast(message, durationMs = 2800) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    el.hidden = true;
    el.textContent = "";
  }, durationMs);
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

function setMeta(cfg) {
  const base = metaBaseUrl(cfg);
  const pageTitle =
    String(cfg.documentTitle || "").trim() ||
    `${cfg.name} — ${cfg.organization}`;
  const desc = `${cfg.name} — ${cfg.title}, ${cfg.organization}. Website, LinkedIn, book a call.`;
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
  const main = node.querySelector(".card");
  const photo = node.querySelector(".card__photo");
  const logo = node.querySelector(".card__logo");
  const nameEl = node.querySelector('[data-field="name"]');
  const titleEl = node.querySelector('[data-field="title"]');
  const orgEl = node.querySelector('[data-field="organization"]');
  const linksMount = node.querySelector("[data-mount='links']");

  photo.src = cfg.photo.startsWith("http") ? cfg.photo : cfg.photo;
  photo.alt = `Portrait of ${cfg.name}`;

  logo.src = cfg.logo.startsWith("http") ? cfg.logo : cfg.logo;
  logo.alt = `${cfg.organization} logo`;

  nameEl.textContent = cfg.name;
  titleEl.textContent = cfg.title;
  orgEl.textContent = cfg.organization;

  linksMount.innerHTML = "";
  const links = cfg.links || [];

  for (const link of links) {
    if (link.action === "copy-email") continue;

    const li = document.createElement("li");
    li.className = "link-list__item";
    const desc = linkDescription(link);

    if (link.action === "vcard") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "link-card link-card--compact";
      btn.setAttribute(
        "aria-label",
        `${link.label}: save to this device`
      );
      btn.addEventListener("click", () => {
        openVcardModal(cfg, btn);
      });

      const text = document.createElement("div");
      text.className = "link-card__text";
      appendLinkContents(text, link.label, desc);

      const iconWrap = document.createElement("span");
      iconWrap.className = "link-card__icon";
      iconWrap.innerHTML = iconFor(link.id);

      btn.append(text, iconWrap);
      li.append(btn);
      linksMount.append(li);
      continue;
    }

    const a = document.createElement("a");
    a.className = desc ? "link-card" : "link-card link-card--compact";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute(
      "aria-label",
      desc ? `${link.label}: ${desc} (opens in new tab)` : `${link.label} (opens in new tab)`
    );

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

  mount.innerHTML = "";
  mount.append(main);
  mount.classList.remove("is-loading");
  mount.removeAttribute("aria-busy");

  bindVcardModalUiOnce();
}

async function init() {
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

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
      title: `Save ${displayName}`,
      text: `Add ${displayName} to Contacts`,
    });
    return "ok";
  } catch (e) {
    if (e && e.name === "AbortError") return "abort";
    return "skip";
  }
}

/**
 * Saves your details with a standards-based vCard (.vcf).
 * Websites cannot programmatically force the OS Contacts UI open with one tap —
 * the system always parses the card and asks the user to confirm (usually Done /
 * Save). This flow prefers: Share sheet → choose Contacts, else a focused tab with
 * the vCard many phones treat as “add contact”, else download + short helper text.
 */
async function offerVcardDownload(cfg, reservedWindow) {
  let textEmbed;
  try {
    textEmbed = await buildVCardPayload(cfg, { photoMode: "embed" });
  } catch {
    reservedWindow?.close();
    showToast("Could not build contact card");
    throw new Error("vcard-build");
  }

  const filename = `${slugFileName(cfg.name)}.vcf`;
  const blobEmbed = new Blob([textEmbed], { type: "text/vcard;charset=utf-8" });

  let r = await shareVCardBlob(blobEmbed, filename, cfg.name);
  if (r === "abort") {
    reservedWindow?.close();
    return;
  }

  if (r === "skip" && blobEmbed.size > 120000) {
    try {
      const liteTxt = await buildVCardPayload(cfg, { photoMode: "uri" });
      const liteBlob = new Blob([liteTxt], { type: "text/vcard;charset=utf-8" });
      r = await shareVCardBlob(liteBlob, filename, cfg.name);
      if (r === "abort") {
        reservedWindow?.close();
        return;
      }
    } catch {
      /* continue to tab / download */
    }
  }

  if (r === "ok") {
    reservedWindow?.close();
    return;
  }

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

  if (reservedWindow && !reservedWindow.closed) {
    reservedWindow.location.replace(objectUrl);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 120000);
    return;
  }

  reservedWindow?.close();
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("Open the file, then tap Add to Contacts", 5200);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2500);
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

function canonicalCardUrl(cfg) {
  const base = metaBaseUrl(cfg).replace(/\/$/, "");
  let path = String(cfg.cardPath || "/card").trim() || "/card";
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
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
        `${link.label}: open contact card to save in your address book`
      );
      btn.addEventListener("click", () => {
        // Open synchronously on tap (required for mobile). Omit noopener so we get a
        // Window reference to assign the vCard blob URL (opens Contacts on many phones).
        const w = window.open("about:blank", "_blank");
        offerVcardDownload(cfg, w).catch(() => {
          if (w && !w.closed) w.close();
          showToast("Could not open contact card — try again");
        });
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

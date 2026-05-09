const ICONS = {
  website:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  typeform:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>',
  contact:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  mail:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  external:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
};

function iconFor(id) {
  if (id === "linkedin") return ICONS.linkedin;
  if (id === "typeform" || id === "book") return ICONS.typeform;
  if (id === "website") return ICONS.website;
  if (id === "contact") return ICONS.contact;
  if (id === "copy-email") return ICONS.mail;
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

async function buildVCardPayload(cfg) {
  const base = metaBaseUrl(cfg);
  const photoHref = cfg.photo.startsWith("http")
    ? cfg.photo
    : absoluteUrl(base, cfg.photo);
  const contact = cfg.contact || {};
  const { fn, n } = structuredName(cfg.name);
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
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
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(tel)}`);
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

  let photoLine = "";
  try {
    const { base64, type } = await fetchPhotoBase64(photoHref);
    const raw = `PHOTO;ENCODING=b;TYPE=${type}:${base64}`;
    photoLine = foldLine(raw);
  } catch {
    photoLine = `PHOTO;VALUE=URI:${photoHref}`;
  }
  lines.push(photoLine);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

async function offerVcardDownload(cfg) {
  const text = await buildVCardPayload(cfg);
  const blob = new Blob([text], { type: "text/vcard;charset=utf-8" });
  const filename = `${slugFileName(cfg.name)}.vcf`;
  const file = new File([blob], filename, { type: "text/vcard" });

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: `Add ${cfg.name}`,
        text: "Contact card",
      });
      return;
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    el.hidden = true;
    el.textContent = "";
  }, 2600);
}

async function copyEmail(email) {
  const addr = String(email || "").trim();
  if (!addr) return;
  try {
    await navigator.clipboard.writeText(addr);
    showToast("Email copied");
  } catch {
    showToast("Could not copy — select and copy manually");
  }
}

function filterLinks(cfg) {
  return (cfg.links || []).filter((link) => {
    if (link.action === "copy-email" && !(cfg.contact && cfg.contact.email)) {
      return false;
    }
    return true;
  });
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

  set('meta[name="description"]', "content", desc);
  set('meta[property="og:title"]', "content", pageTitle);
  set('meta[property="og:description"]', "content", desc);
  set('meta[property="og:url"]', "content", `${base}/`);
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
  const links = filterLinks(cfg);

  for (const link of links) {
    const li = document.createElement("li");
    li.className = "link-list__item";

    if (link.action === "vcard") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "link-card";
      btn.setAttribute(
        "aria-label",
        `${link.label}: download contact card for your address book`
      );
      btn.addEventListener("click", () => {
        offerVcardDownload(cfg).catch(() =>
          showToast("Could not build contact card — try again")
        );
      });

      const text = document.createElement("div");
      text.className = "link-card__text";
      const label = document.createElement("span");
      label.className = "link-card__label";
      label.textContent = link.label;
      const desc = document.createElement("span");
      desc.className = "link-card__desc";
      desc.textContent = link.description || "Includes photo, phone, links";
      text.append(label, desc);

      const iconWrap = document.createElement("span");
      iconWrap.className = "link-card__icon";
      iconWrap.innerHTML = iconFor(link.id);

      btn.append(text, iconWrap);
      li.append(btn);
      linksMount.append(li);
      continue;
    }

    if (link.action === "copy-email") {
      const email = cfg.contact && cfg.contact.email;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "link-card";
      btn.setAttribute("aria-label", `Copy email ${email} to clipboard`);
      btn.addEventListener("click", () => copyEmail(email));

      const text = document.createElement("div");
      text.className = "link-card__text";
      const label = document.createElement("span");
      label.className = "link-card__label";
      label.textContent = link.label;
      const desc = document.createElement("span");
      desc.className = "link-card__desc";
      desc.textContent = email;
      text.append(label, desc);

      const iconWrap = document.createElement("span");
      iconWrap.className = "link-card__icon";
      iconWrap.innerHTML = iconFor(link.id);

      btn.append(text, iconWrap);
      li.append(btn);
      linksMount.append(li);
      continue;
    }

    const a = document.createElement("a");
    a.className = "link-card";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute(
      "aria-label",
      `${link.label}: ${link.description} (opens in new tab)`
    );

    const text = document.createElement("div");
    text.className = "link-card__text";
    const label = document.createElement("span");
    label.className = "link-card__label";
    label.textContent = link.label;
    const desc = document.createElement("span");
    desc.className = "link-card__desc";
    desc.textContent = link.description;
    text.append(label, desc);

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

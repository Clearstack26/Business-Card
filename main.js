const ICONS = {
  website:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  linkedin:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  typeform:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>',
  calendar:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h4"/></svg>',
  phone:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  email:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  external:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
};

function iconFor(id) {
  if (id === "linkedin") return ICONS.linkedin;
  if (id === "book") return ICONS.calendar;
  if (id === "typeform") return ICONS.typeform;
  if (id === "website") return ICONS.website;
  if (id === "call") return ICONS.phone;
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

function telHref(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

function contactActionLinks(cfg) {
  const contact = cfg.contact || {};
  const actions = [];
  const phone = String(contact.phone || "").trim();
  const tel = telHref(phone);
  if (tel) {
    actions.push({ id: "call", label: "Call", url: tel });
  }
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
  if (link.id === "book") return true;
  return /calendly\.com/i.test(url);
}

function appendLinkRow(linksMount, link, { external }) {
  const li = document.createElement("li");
  li.className = "link-list__item";
  const desc = linkDescription(link);

  const a = document.createElement("a");
  a.className = desc ? "link-card" : "link-card link-card--compact";
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

  const contactLinks = contactActionLinks(cfg);
  const configLinks = (cfg.links || []).filter(
    (link) => link.url && link.action !== "vcard" && link.action !== "copy-email"
  );
  const allLinks = [...configLinks, ...contactLinks];

  for (const link of allLinks) {
    const external = link.id !== "call" && link.id !== "email";
    appendLinkRow(linksMount, link, { external });
  }

  mount.innerHTML = "";
  mount.append(main);
  mount.classList.remove("is-loading");
  mount.removeAttribute("aria-busy");
}

function toCanvasQr(canvas, text, opts) {
  const QRCode = globalThis.QRCode;
  return new Promise((resolve, reject) => {
    if (!QRCode?.toCanvas) {
      reject(new Error("QRCode"));
      return;
    }
    QRCode.toCanvas(canvas, text, opts, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function fillCardQrs(cardRoot, cfg) {
  const deck = cardRoot?.querySelector(".card__qr-deck");
  if (!deck) return;
  const QRCode = globalThis.QRCode;
  if (!QRCode?.toCanvas) {
    deck.remove();
    return;
  }
  try {
    const vcardRes = await fetch("/vcard-qr.json", { cache: "no-store" });
    if (!vcardRes.ok) throw new Error("vcard");
    const vcardQr = await vcardRes.json();
    const payload = String(vcardQr.payload || "").trim();
    if (!payload) throw new Error("empty vcard");
    const cardUrl = canonicalCardUrl(cfg);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssPx = 112;
    const genSize = Math.round(cssPx * dpr);
    const colors = { dark: "#000000", light: "#ffffff" };
    const baseOpts = {
      width: genSize,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: colors.dark, light: colors.light },
    };
    const cardCanvas = deck.querySelector('canvas[data-qr="card"]');
    const contactCanvas = deck.querySelector('canvas[data-qr="contact"]');
    if (cardCanvas) {
      await toCanvasQr(cardCanvas, cardUrl, baseOpts);
      cardCanvas.style.width = `${cssPx}px`;
      cardCanvas.style.height = `${cssPx}px`;
    }
    if (contactCanvas) {
      await toCanvasQr(contactCanvas, payload, baseOpts);
      contactCanvas.style.width = `${cssPx}px`;
      contactCanvas.style.height = `${cssPx}px`;
    }
    deck.hidden = false;
  } catch {
    deck.remove();
  }
}

async function init() {
  try {
    const res = await fetch("/site-config.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Config not found");
    const cfg = await res.json();
    setMeta(cfg);
    render(cfg);
    const cardRoot = document.querySelector("#app .card");
    if (cardRoot) await fillCardQrs(cardRoot, cfg);
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

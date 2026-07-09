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
  star:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  trophy:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M5 5H3v1a4 4 0 0 0 4 4"/><path d="M19 5h2v1a4 4 0 0 1-4 4"/></svg>',
  layers:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12.83 2.18 8 4.66a1 1 0 0 1 0 1.74l-8 4.66a2 2 0 0 1-2 0l-8-4.66a1 1 0 0 1 0-1.74l8-4.66a2 2 0 0 1 2 0z"/><path d="m22 12.65-8 4.66a2 2 0 0 1-2 0l-8-4.66"/><path d="m22 17.65-8 4.66a2 2 0 0 1-2 0l-8-4.66"/></svg>',
};

function iconFor(id) {
  if (id === "linkedin") return ICONS.linkedin;
  if (id === "book") return ICONS.calendar;
  if (id === "typeform") return ICONS.typeform;
  if (id === "website") return ICONS.website;
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

function trustBadgeAria(badge) {
  const type = String(badge.type || "");
  if (type === "stars") {
    return `${badge.stars || 5} star Google reviews`;
  }
  if (type === "awwwards") {
    return `${badge.count || 3} Awwwards Site of the Day wins`;
  }
  if (type === "metric") {
    return `${badge.value || ""} ${badge.label || "metric"}`.trim();
  }
  return badge.label || "Credential";
}

function trustBadgeContent(badge) {
  const type = String(badge.type || "");
  const wrap = document.createElement("div");
  wrap.className = "trust-ring__content";

  if (type === "stars") {
    wrap.classList.add("trust-ring__content--stars");
    const count = Number(badge.stars) || 5;
    const row = document.createElement("div");
    row.className = "trust-stars";
    row.setAttribute("aria-hidden", "true");
    for (let i = 0; i < count; i += 1) {
      const star = document.createElement("span");
      star.className = "trust-stars__item";
      star.style.setProperty("--star-i", String(i));
      star.innerHTML = ICONS.star;
      row.append(star);
    }
    wrap.append(row);
    return wrap;
  }

  if (type === "awwwards") {
    wrap.classList.add("trust-ring__content--awwwards");
    const count = document.createElement("span");
    count.className = "trust-awwwards__count";
    count.textContent = `${badge.count || 3}×`;
    const mark = document.createElement("span");
    mark.className = "trust-awwwards__mark";
    mark.innerHTML = ICONS.trophy;
    wrap.append(count, mark);
    return wrap;
  }

  if (type === "metric") {
    wrap.classList.add("trust-ring__content--metric");
    const value = document.createElement("span");
    value.className = "trust-metric__value";
    value.textContent = String(badge.value || "");
    wrap.append(value);
    return wrap;
  }

  const fallback = document.createElement("span");
  fallback.className = "trust-metric__value";
  fallback.textContent = badge.label || "";
  wrap.append(fallback);
  return wrap;
}

function renderTrustStrip(cfg, mount) {
  if (!mount) return;

  const badges = Array.isArray(cfg.trustBadges) ? cfg.trustBadges : [];
  mount.innerHTML = "";

  if (!badges.length) {
    mount.hidden = true;
    return;
  }

  mount.hidden = false;
  const list = document.createElement("ul");
  list.className = "trust-strip__list";

  badges.forEach((badge, index) => {
    const item = document.createElement("li");
    item.className = "trust-strip__item";

    const ring = document.createElement("button");
    ring.type = "button";
    ring.className = "trust-ring";
    ring.style.setProperty("--trust-i", String(index));
    ring.setAttribute("aria-label", trustBadgeAria(badge));

    const sync = document.createElement("span");
    sync.className = "trust-ring__sync";
    sync.setAttribute("aria-hidden", "true");

    const face = document.createElement("span");
    face.className = "trust-ring__face";
    face.append(trustBadgeContent(badge));

    ring.append(sync, face);

    const label = document.createElement("span");
    label.className = "trust-ring__label";
    label.textContent = String(badge.label || "");

    const sublabel = document.createElement("span");
    sublabel.className = "trust-ring__sublabel";
    sublabel.textContent = String(badge.sublabel || "");

    item.append(ring, label, sublabel);
    list.append(item);
  });

  mount.append(list);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mount.classList.add("is-live");
    });
  });
}

function setMeta(cfg) {
  const base = metaBaseUrl(cfg);
  const pageTitle =
    String(cfg.documentTitle || "").trim() ||
    `${cfg.name} — ${cfg.organization}`;
  const desc = `${cfg.name} — ${cfg.title}, ${cfg.organization}. Website and book a call.`;
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
  const trustMount = node.querySelector("[data-mount='trust']");

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
    appendLinkRow(linksMount, link, { external });
  }

  renderTrustStrip(cfg, trustMount);

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

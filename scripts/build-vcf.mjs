/**
 * Generates mathew-alexander.vcf and vcard-qr.json from site-config.json.
 * Lite vCard: no embedded photo (reliable QR scan size).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfgPath = join(root, "site-config.json");
const MAX_QR_PAYLOAD = 2800;

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

function slugFileName(name) {
  return (
    String(name || "contact")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "contact"
  );
}

function linkUrlById(links, id) {
  const hit = links?.find((l) => l.id === id && l.url);
  return hit?.url || "";
}

function bookUrlFromLinks(links) {
  return linkUrlById(links, "book") || linkUrlById(links, "typeform") || "";
}

function metaBaseUrl(cfg) {
  const raw = String(cfg.baseUrl || "").trim().replace(/\/$/, "");
  const placeholder = "your-card.vercel.app";
  if (!raw || raw.includes(placeholder)) {
    return "https://your-card.vercel.app";
  }
  return raw;
}

function canonicalCardUrl(cfg) {
  const base = metaBaseUrl(cfg);
  let path = String(cfg.cardPath || "/card").trim() || "/card";
  if (!path.startsWith("/")) path = "/" + path;
  return `${base}${path}`;
}

/** @param {object} cfg */
export function buildLiteVCard(cfg) {
  const contact = cfg.contact || {};
  const links = cfg.links || [];
  const { fn, n } = structuredName(cfg.name);
  const slug = slugFileName(cfg.name);
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`UID:urn:business-card:${slug}`);
  lines.push(`REV:20260515000000Z`);

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
    String(contact.website || "").trim() || linkUrlById(links, "website");
  if (website) {
    lines.push(`URL;TYPE=WORK:${escapeVCardValue(website)}`);
  }
  const linkedin = linkUrlById(links, "linkedin");
  if (linkedin) {
    lines.push(`URL;TYPE=LinkedIn:${escapeVCardValue(linkedin)}`);
  }
  const booking = bookUrlFromLinks(links);
  if (booking) {
    lines.push(`URL;TYPE=Booking:${escapeVCardValue(booking)}`);
  }
  const note = String(contact.note || "").trim();
  if (note) {
    lines.push(`NOTE:${escapeVCardValue(note)}`);
  }

  lines.push(`URL;TYPE=DigitalCard:${escapeVCardValue(canonicalCardUrl(cfg))}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function assertVCard(text) {
  if (!text.startsWith("BEGIN:VCARD")) throw new Error("missing BEGIN:VCARD");
  if (!text.endsWith("END:VCARD")) throw new Error("missing END:VCARD");
  if (!text.includes("FN:")) throw new Error("missing FN");
  if (text.length > MAX_QR_PAYLOAD) {
    throw new Error(
      `vCard payload ${text.length} bytes exceeds QR limit ${MAX_QR_PAYLOAD}`
    );
  }
}

const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const vcard = buildLiteVCard(cfg);
assertVCard(vcard);

const filename = `${slugFileName(cfg.name)}.vcf`;
writeFileSync(join(root, filename), vcard, "utf8");
writeFileSync(
  join(root, "vcard-qr.json"),
  JSON.stringify(
    {
      payload: vcard,
      filename,
      byteLength: Buffer.byteLength(vcard, "utf8"),
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`Wrote ${filename} (${Buffer.byteLength(vcard, "utf8")} bytes)`);
console.log("Wrote vcard-qr.json");

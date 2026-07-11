import type { ScanEvent } from "./types";

const AU_REGION_TZ: Record<string, string> = {
  QLD: "Australia/Brisbane",
  NSW: "Australia/Sydney",
  ACT: "Australia/Sydney",
  VIC: "Australia/Melbourne",
  SA: "Australia/Adelaide",
  WA: "Australia/Perth",
  TAS: "Australia/Hobart",
  NT: "Australia/Darwin",
};

export function resolveDisplayTimezone(scan: Pick<ScanEvent, "country" | "region" | "scanner_timezone">) {
  const region = String(scan.region || "").toUpperCase();
  const country = String(scan.country || "").toUpperCase();
  if (country === "AU" && AU_REGION_TZ[region]) return AU_REGION_TZ[region];
  if (scan.scanner_timezone) return scan.scanner_timezone;
  if (country === "AU") return "Australia/Brisbane";
  return "UTC";
}

export function formatScanWhen(scannedAt: string, timeZone: string) {
  const date = new Date(scannedAt);
  const day = date.toLocaleDateString("en-AU", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-AU", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const zone = date
    .toLocaleTimeString("en-AU", {
      timeZone,
      timeZoneName: "short",
    })
    .split(" ")
    .pop();

  return {
    day,
    time,
    zone: zone || timeZone,
    full: `${day} - ${time} ${zone || ""}`.trim(),
  };
}

export function formatScanLocation(
  scan: Pick<ScanEvent, "city" | "region" | "country">
) {
  const city = String(scan.city || "").trim();
  const region = String(scan.region || "").trim().toUpperCase();
  const country = String(scan.country || "").trim().toUpperCase();

  const parts: string[] = [];
  if (city) parts.push(city);
  if (region && region !== city.toUpperCase()) parts.push(region);
  if (country) parts.push(country);

  return parts.length ? parts.join(", ") : "Unknown";
}

export function sourceLabel(source: string) {
  if (source === "qr") return "QR scan";
  if (source === "referral") return "Referral";
  return "Direct";
}

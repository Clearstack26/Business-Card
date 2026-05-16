# ClearStack digital business card

Static HTML/CSS card meant to open from **QR codes** (printed, on screen, or via a wallet/pass app). Deploy to **Vercel** and use the dual QR page at **`/`**.

## Two QR codes (recommended for events)

| QR on **`/`** | Label | What happens when scanned |
| --- | --- | --- |
| **#1** | View digital card | Opens **`/card`** (photo, links, booking) |
| **#2** | Add to contacts | Encodes a **vCard** — camera apps offer **Add Contact** (works offline) |

At events you can say: *“Scan this one to add me to your contacts.”* (point at QR #2.)

After you change [`site-config.json`](site-config.json), run:

```bash
npm run build:vcf
```

That regenerates **`mathew-alexander.vcf`** and **`vcard-qr.json`** (used by the contact QR).

## Customize

### URLs

| Path | Page |
| --- | --- |
| **`/`** | **Dual QR** — card URL + vCard save |
| **`/card`** | Full digital **business card** |
| **`/mathew-alexander.vcf`** | Downloadable contact file (same data as QR #2) |

Edit **[site-config.json](site-config.json)**:

| Field | Purpose |
| --- | --- |
| `baseUrl` | Live site origin for QR #1 when not on localhost. Set after first deploy. |
| `cardPath` | Path for QR #1 (default **`/card`**). |
| `name`, `title`, `organization` | Shown on card and in vCard. |
| `photo`, `logo` | Asset paths. |
| `contact` | Phone, website, note — used in the **vCard** (contact QR / `.vcf`). Optional `email` adds an **Email** row on the card if set. |
| `links` | Website, LinkedIn, book a call (`url` entries only). |

### Card links

- **Email** appears only if `contact.email` is set in config.
- Normal links use `"url"` and optional `"description"`.

## Assets

- **Logo**: `clearstack-logo.png`
- **Photo**: `headshot.png` — update file or change `photo` in config.

## Local preview

Serve over **HTTP** (not `file://`):

```bash
npm install
npm run build:vcf
npm start
```

Open **http://localhost:3000/** (dual QR) or **http://localhost:3000/card**.

On **Windows PowerShell**, use **`;`** instead of **`&&`** between commands if needed.

## Deploy on Vercel

1. Push to GitHub and import in Vercel, or run `vercel` from this folder.
2. Build command: **`npm run vercel-build`** (bundles QR library + generates vCard files).  
   Or set **Build Command** to `npm run vercel-build` and leave output as repo root.
3. Set `baseUrl` in `site-config.json` to your production URL and redeploy.

## QR for printing

Use **`/`** on your deployed site — both codes with labels. Or export/screenshot that page for stickers.

Standalone QR generators can use **`/card`** (URL) or paste the vCard text from **`vcard-qr.json`** for the save-contact code.

## Wallet / pass apps

Paste your deployed **`/`** or **`/card`** URL into wallet/pass apps. This project does not create signed Apple/Google passes.

## Add to Home Screen (optional)

iOS Safari: Share → **Add to Home Screen**. See [manifest.webmanifest](manifest.webmanifest).

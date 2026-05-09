# ClearStack digital business card

Static HTML/CSS card meant to open from a **QR code** (printed, on screen, or via a wallet/pass app). Deploy to **Vercel** and point your QR at the production URL.

## Customize

Edit **[site-config.json](site-config.json)** at the repo root:

| Field | Purpose |
| --- | --- |
| `baseUrl` | Your live site origin (e.g. `https://your-project.vercel.app`). Used for Open Graph images, canonical URLs, and embedding your photo in the **vCard**. After first deploy, set this to your real domain. |
| `name` | Your name as shown on the card and in the exported contact file. |
| `title` | Role line (e.g. `Founder & CEO`). |
| `organization` | Company name under the role. |
| `photo` | Path to headshot (default `/headshot.png`). |
| `logo` | Path to logo (default `/clearstack-logo.png`). |
| `contact` | Phone, email, primary website, optional note — used for **Add to contacts** (vCard). |
| `links` | Mix of normal links (`url`) and special actions (`action`). |

### Contact object (`contact`)

| Field | Purpose |
| --- | --- |
| `phone` | Mobile number as you want it saved (e.g. `+61 400 000 000`). |
| `email` | Used on the card for **Copy email** and inside the vCard. Remove `email` to hide the copy row. |
| `website` | Primary website URL stored in the contact (often same as the Website link). |
| `note` | Optional note field in the vCard. |

### Special link actions

In `links`, entries can use `"action"` instead of `"url"`:

- **`"action": "vcard"`** — **Add to contacts**: builds a `.vcf` with name, title, org, phone, email, website, LinkedIn (from your `linkedin` link), note, and **photo** (embedded when possible). On many phones the OS **share sheet** opens so they can save straight to Contacts; otherwise the file downloads.
- **`"action": "copy-email"`** — Copies `contact.email` to the clipboard and shows a short confirmation. Omit `contact.email` to hide this row.

Swap **`linkedin`** and your **book-a-call** URL if you change them.

## Assets

- **Logo**: `clearstack-logo.png` is sourced from [ClearStack](https://www.clearstackdigital.com.au/). Replace the file if you prefer another asset.
- **Photo**: `headshot.png` — replace with your own file at the repo root or change `photo` in `site-config.json`.

## Local preview

The site **must** be served over **HTTP** — opening `index.html` as a file, or visiting `http://localhost:3000` **without** a server running, will show a connection error in the browser.

**Option A — fixed port 3000 (matches `localhost:3000` in the address bar):**

```bash
cd /path/to/Business-Card
npm install
npm start
```

Leave that terminal open. Then open **http://localhost:3000/** for the card or **http://localhost:3000/preview.html** for the QR-only page.

**Option B — one-off (any port `serve` chooses):**

```bash
npx serve .
```

Use whatever URL the CLI prints (often **http://localhost:3000** — if that port is busy, try **3001**, **5000**, etc.).

On **Windows PowerShell**, run commands from this folder; avoid **`&&`** unless your shell supports it (use separate lines or **`;`**).

### “Firefox can’t connect to localhost:3000”

Nothing is listening on that port yet — start the server with **`npm start`** (after **`npm install`**) from this project folder, then refresh.

### QR-only preview (desktop testing)

Open **`/preview.html`** (e.g. `http://localhost:3000/preview.html`). You can also open **`/?preview=qr`** — it redirects to that page. You get **only a large QR code** that encodes your **card URL** (from `baseUrl` in `site-config.json`, or the same origin if `baseUrl` is still the placeholder). The QR library is **bundled into [`vendor/qrcode.min.js`](vendor/qrcode.min.js)** so it does **not** rely on a CDN (blocked by some networks/ad blockers).

After you deploy, set **`baseUrl`** in `site-config.json` to your live domain so the QR opens production when you preview from localhost or another machine.

To rebuild that file after upgrading the `qrcode` dependency: **`npm run vendor:qrcode`** (requires `npm install`).

## Deploy on Vercel

1. Push this repo to GitHub and import the project in Vercel, **or** use [Vercel CLI](https://vercel.com/docs/cli): `vercel` from this directory.
2. No build step is required — the site is static files at the repository root (`index.html`, `styles.css`, `main.js`, etc.).
3. After deploy, set `baseUrl` in `site-config.json` to your production URL (or custom domain), redeploy or edit in Git.

## QR code

Use any QR generator with your **production URL** as the payload (same link you put in wallet/pass apps). High contrast and short URLs scan most reliably.

## Wallet / pass apps

Third-party apps that show a **QR on your lock screen or wallet** only need that same URL. This project does not create signed Apple/Google passes — you paste the deployed link into whatever app you use.

## Add to Home Screen (optional)

On iOS Safari: Share → **Add to Home Screen**. A minimal [manifest](manifest.webmanifest) is included for a standalone-style launch.

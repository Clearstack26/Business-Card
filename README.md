# ClearStack digital business card

Static HTML/CSS card meant to open from a **QR code** (printed, on screen, or via a wallet/pass app). Deploy to **Vercel** and point your QR at the production URL.

## Customize

### URLs

| Path | Page |
| --- | --- |
| **`/`** | **QR only** — big centred code visitors scan |
| **`/card`** | Full digital **business card** (photo, links, vCard) |

The QR payload is **`baseUrl` + `cardPath`** (default **`/card`**) so scanners open the profile, not the QR page again.

Edit **[site-config.json](site-config.json)** at the repo root:

| Field | Purpose |
| --- | --- |
| `baseUrl` | Your live site origin (e.g. `https://your-project.vercel.app`). Used for QR link when not using the placeholder; Open Graph **card** URL and vCard photo embedding. After first deploy, set this to your real domain. |
| `cardPath` | Path encoded in the QR (default **`/card`**). Must match how you deploy (see **`vercel.json`** / **`serve.json`** rewrite to `card.html`). |
| `name` | Your name as shown on the card and in the exported contact file. |
| `documentTitle` | Browser tab / Share title (e.g. `Business Card - Mathew`). Optional — defaults to `name — organization`. |
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

Leave that terminal open. Then open **http://localhost:3000/** for the **QR page** or **http://localhost:3000/card** for the **full card** ([`serve.json`](serve.json) rewrites `/card` → `card.html`).

**Option B — one-off (any port `serve` chooses):**

```bash
npx serve .
```

Use whatever URL the CLI prints (often **http://localhost:3000** — if that port is busy, try **3001**, **5000**, etc.).

On **Windows PowerShell**, run commands from this folder; avoid **`&&`** unless your shell supports it (use separate lines or **`;`**).

### “Firefox can’t connect to localhost:3000”

Nothing is listening on that port yet — start the server with **`npm start`** (after **`npm install`**) from this project folder, then refresh.

### QR preview

The **home page `/`** is the QR screen. **`/preview.html`** redirects to **`/`**. The QR encodes **`/card`** on your deployed origin when `baseUrl` is unset or placeholder. The QR library is **bundled** in [`vendor/qrcode.min.js`](vendor/qrcode.min.js).

After deploy, set **`baseUrl`** in `site-config.json` to your live domain so sharable metadata and QR “production” links stay correct.

To rebuild **`vendor/qrcode.min.js`** after upgrading `qrcode`: **`npm run vendor:qrcode`**.

### Vercel shows “403 Forbidden” on the preview

Often **Deployment Protection** (Vercel Authentication) is enabled on the team / project — only logged-in users can open the preview. For a card people scan in the wild: **Project → Settings → Deployment Protection** → allow public access to **Production** (and Preview if needed), or redeploy without protection.

Also confirm **Root Directory** is **`./`** and you did **not** set **Output Directory** to a non-existent folder (`dist`, etc.).

## Deploy on Vercel

1. Push this repo to GitHub and import the project in Vercel, **or** use [Vercel CLI](https://vercel.com/docs/cli): `vercel` from this directory.
2. No build step is required — the site is static files at the repository root (`index.html`, `styles.css`, `main.js`, etc.).
3. After deploy, set `baseUrl` in `site-config.json` to your production URL (or custom domain), redeploy or edit in Git.

## QR code

Use **`https://…your-deployment…`** (the **QR landing page**) in wallet/pass apps or printed stickers — **`/`**. That page shows only the QR pointing to **`https://…/card`**.

Or generate a standalone QR elsewhere with **`/card`** as the payload if you want to skip the “QR on QR” landing.

## Wallet / pass apps

Third-party apps that show a **QR on your lock screen or wallet** only need that same URL. This project does not create signed Apple/Google passes — you paste the deployed link into whatever app you use.

## Add to Home Screen (optional)

On iOS Safari: Share → **Add to Home Screen**. A minimal [manifest](manifest.webmanifest) is included for a standalone-style launch.

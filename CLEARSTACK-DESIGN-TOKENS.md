# ClearStack design tokens (matches clearstackdigital.com.au)

Paste into any Cursor agent building UI for the business card or site.

## Core colours

| Token | HSL | Hex (approx) |
|-------|-----|--------------|
| Background | `hsl(220 22% 7.5%)` | `#0f1218` |
| Card / glass base | `hsl(220 16% 11%)` | `#161b22` |
| Foreground text | `hsl(0 0% 98%)` | `#fafafa` |
| Primary cyan | `hsl(185 100% 55%)` | `#1affff` |
| Text secondary | `hsl(200 8% 88%)` | `#dde3e6` |
| Text muted | `hsl(200 8% 78%)` | `#c2cacd` |
| Border | `hsl(200 18% 22%)` | `#2d3944` |

## Gradient (metric numbers, accents)

```css
--gradient-accent: linear-gradient(
  135deg,
  hsl(185 100% 60%) 0%,
  hsl(200 100% 70%) 50%,
  hsl(185 100% 55%) 100%
);
```

## Ambient background glow

```css
background:
  radial-gradient(ellipse 900px 500px at 50% -5%, hsl(185 100% 55% / 0.28), transparent 70%),
  radial-gradient(ellipse 500px 400px at 0% 20%, hsl(185 100% 55% / 0.19), transparent 70%),
  radial-gradient(ellipse 500px 400px at 100% 25%, hsl(185 100% 55% / 0.19), transparent 70%),
  radial-gradient(ellipse 800px 400px at 50% 50%, hsl(185 100% 55% / 0.13), transparent 70%),
  radial-gradient(ellipse 700px 350px at 50% 90%, hsl(185 100% 55% / 0.17), transparent 70%);
```

## Glass card (`glass-card-clear`)

Matches ClearStack site CSS (translucent over ambient glow — no backdrop-filter):

```css
background: hsl(220 16% 11% / 0.4);
border: 1px solid hsl(0 0% 100% / 0.1);
border-left: 1px solid hsl(185 100% 55% / 0.2);
box-shadow: 0 4px 24px hsl(185 100% 55% / 0.06);
```

## Portfolio metric ring (compact)

- Ring size: **68px**
- Stroke: **4px**
- Track: `hsl(185 100% 55% / 0.12)`
- Progress: `hsl(185 100% 55%)`
- Value font: **Space Grotesk**, `gradient-text`
- Label: `9px`, uppercase, `letter-spacing: 0.16em`, `hsl(200 8% 78%)`

## Fonts

- Body: Inter
- Name / display: Fraunces
- Metrics: Space Grotesk

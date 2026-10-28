# KOLABA — Investor Presentation

A private, 12-slide interactive investor presentation built from the Figma file
`kolaba.` (frames `810:31293` … `810:32535`, handoff board `810:32639`).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # calculator, budget, wheel-gesture and form tests
npm run build      # typecheck + production build into dist/
```

## GitHub Pages

This project is configured for GitHub Pages deployment.

1. Push the repo to GitHub.
2. In the GitHub repository settings, enable GitHub Pages and select "GitHub Actions" as the source.
3. Ensure the branch is `kolaba-invest` (or update the workflow branch filter in `.github/workflows/deploy.yml` if you prefer another one).
4. The workflow in `.github/workflows/deploy.yml` will build and publish the app automatically on each push.
5. The site will be available at:
   `https://<username>.github.io/kolaba-invest/`

If you use a custom domain, update the Pages settings and keep the `base` value in `vite.config.ts` aligned with your hosting target.

## Stack

Vite · React 18 · TypeScript · plain CSS with design tokens · GSAP (timelines, counters,
parallax) · d3-geo + topojson-client + world-atlas (Natural Earth 1:50m, bundled locally
and lazy-loaded) · @fontsource (Plus Jakarta Sans, Montserrat 800, self-hosted).

## Layout system

Stylesheets are written in Figma pixels with three macros (see `vite.config.ts`):

| Macro   | Expands to                      | Use                                   |
| ------- | ------------------------------- | ------------------------------------- |
| `u(48)` | `calc(48 * var(--u))`           | sizes/type scaled to the 1440×870 frame |
| `ux(72)`| `calc(72 * var(--ux))`          | horizontal gutters (width only)       |
| `t(11)` | `max(11·u, 11·floor)`           | small text that must stay readable    |

`--u = min(100vw/1440, 100dvh/870)`, so every desktop slide fits one screen without
`transform: scale()`. Columns are real CSS grids. Below 1024 px wide (or 520 px tall)
the site switches to **flow mode**: natural scrolling, stacked layouts, soft snap points.

## Navigation (deck mode)

`src/engine/wheelIntent.ts` is a small state machine: `idle → locked → idle`.
One deliberate wheel/trackpad gesture moves exactly one slide; trackpad inertia never
triggers a second move, but a new swipe (a pause, a direction change or a fresh spike
after the tail decays) moves again right away, so slides can be flipped quickly.
Header links jump straight to the target: it is placed next to the current slide, so a
long jump looks like a single transition. Keyboard: ↑/↓, PageUp/PageDown, Space, Home/End (ignored inside
inputs, sliders, radio groups and the map). Touch swipe, header links, the progress-row
arrows and `#hash` deep links are supported. Tabbing into another slide brings it into view.

## Where things live

| Concern | File |
| --- | --- |
| Prices (single source) | `src/data/pricing.ts` |
| Calculator presets/limits | `src/data/projections.ts`, formulas in `src/lib/revenue.ts` |
| Roadmap, $95K allocation, GTM budget | `src/data/budget.ts` |
| Market data, map countries, cities | `src/data/market.ts` |
| Research screenshots (slide 07) | `src/data/research.ts` — add `{ src, alt }` items, no JSX edits |
| Founder links, legal routes, form endpoint | `src/data/contacts.ts` |
| All copy | `src/content/en.ts`, `src/content/ru.ts` |

### Languages

EN and RU share the `Content` shape (`ru.ts` is type-checked against `en.ts`). The header
switch stores the choice in `localStorage`; `?lang=ru` opens the Russian version directly.
Slide eyebrows ("05 / …") and "NEXT:" labels come from `slideTitles` and are numbered by
position, so reordering `SLIDES` in `src/data/slides.ts` (and the sections in `App.tsx`)
needs no copy changes.

### Live prototype (slide 04)

`DemoPhoneContainer` accepts an `embed` prop that is placed exactly over the iPhone
screen (`data-slot="PROTOTYPE_EMBED"`). Pass an `<iframe>` there; wheel/keys inside the
embed are not hijacked by the deck.

## Contact form

`api/contact.ts` is a Vercel serverless function that forwards enquiries to Telegram.
Set in the hosting dashboard (never with a `VITE_` prefix):

```
TELEGRAM_BOT_TOKEN=…   TELEGRAM_CHAT_ID=…   CONTACT_ALLOWED_ORIGIN=https://your-domain (optional)
```

Spam protection: honeypot, minimum fill time, size limits, per-IP rate limit.
The UI shows success **only** after the server confirms delivery; without configuration it
tells the visitor to use Telegram instead. For other hosts, point `VITE_CONTACT_ENDPOINT`
at an equivalent function.

## Privacy / access

- `noindex, nofollow` meta + `X-Robots-Tag` header + `robots.txt` (none of these restrict access).
- Real access control: set `SITE_USER` and `SITE_PASSWORD` → `middleware.ts` enables HTTP
  Basic Auth at the edge. No password is ever shipped to the client.
- No third-party analytics; fonts are self-hosted.

## Pricing discrepancy (resolved in config)

The Figma frame shows Business Pro at $5.99/month. Per the agreed financial model the site
uses **$4.99/month** everywhere (slide 08 and the calculator). The Figma annual Business Pro
price ($3.99/month, $47.88/year) is kept in `PRICING.businessPro.annual` with
`status: 'pending-approval'`; it is displayed on slide 08 but not used in projections.

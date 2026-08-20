# Tata Safari — Landing Page

A dark, gold-accented landing page for the (fictional/demo) Tata Safari SUV, built as a portfolio
showcase of scroll-driven storytelling: a GSAP + Lenis powered hero that morphs into a full-bleed
wordmark as you scroll, a bento-grid design gallery that flips into a full-screen detail view, and a
booking modal with real client-side validation.

Built with Next.js App Router, TypeScript and SCSS Modules, following
[Feature-Sliced Design](https://feature-sliced.design).

---

## Features

- **Scroll-choreographed hero** — GSAP `ScrollTrigger`, scrubbed against a shared Lenis smooth-scroll
  instance: the headline morphs into a giant watermark, the background photo fades to a flat dark
  state, and a feature block rises in as the page hands off to the next section.
- **Real page-readiness preloader** — waits on `window.load` + `document.fonts.ready` (not just a
  timer) before it's allowed to dismiss, so the reveal never uncovers an unfinished page.
- **Grand Design gallery** — an asymmetric bento grid; clicking a tile flips it into a full-screen
  detail view using a manual snapshot-based transition (captures the tile's exact rect and image
  transform at click time), with wheel/keyboard step navigation between items.
- **Booking modal** — name/phone/email/city form with pattern validation, errors that only surface
  after a field has content and loses focus (or after a failed submit), and a success state.
- **Careful scroll locking** — every modal/overlay (preloader, gallery detail, booking) shares one
  `useScrollLock` hook that freezes `ScrollTrigger` state and compensates for the scrollbar's width,
  so opening one never shifts the page or snaps a mid-scroll animation to the wrong frame.
- **Liquid-glass nav** — an SVG filter (`feTurbulence` + `feDisplacementMap`) gives the fixed header a
  refraction effect on scroll, with scroll-spy active-section highlighting.
- **Localization** — 5 languages out of the box (`en`, `ru`, `de`, `pl`, `fi`) via `next-intl`.
- **SEO-ready** — per-locale metadata, OpenGraph/Twitter cards, `hreflang` alternates, JSON-LD,
  dynamic `sitemap.xml` and `robots.txt`.
- **Accessible defaults** — semantic landmarks, focus-visible rings, `prefers-reduced-motion` respected
  by every animation (GSAP and Framer Motion alike).
- **Docker-ready** — multi-stage `Dockerfile` + `docker-compose.yml`, `output: standalone`.
- **CI** — GitHub Actions pipeline (`install → lint → type-check → build`).

---

## Tech Stack

**Frontend:** Next.js 16 (App Router) · React 19 · TypeScript · SCSS Modules · Framer Motion ·
GSAP + ScrollTrigger · Lenis (smooth scroll)

**i18n:** next-intl (routing, middleware, message catalogs)

**Tooling:** ESLint · Prettier · Husky · lint-staged · path aliases (`@/`) · TypeScript strict mode ·
`@svgr/webpack` (SVG as React components)

**Infrastructure:** Docker · Docker Compose · GitHub Actions CI

---

## Getting Started

```bash
git clone https://github.com/Filippov-Nikolay/tata-safari.git
cd tata-safari
npm install
cp .env.example .env.local
npm run dev       # http://localhost:3000
```

Requires Node.js 22+ (see `.nvmrc`).

---

## Project Structure

```
src/
├── app/
│   └── [locale]/            # Pages, layout, loading/error states (locale-prefixed routes)
├── i18n/                    # next-intl routing, middleware, request handling
├── widgets/                 # Self-contained UI blocks, no cross-imports between siblings
│   ├── Header/               # Fixed nav, liquid-glass effect, scroll-spy
│   ├── Preloader/              # Boot screen — real page-readiness gating
│   ├── HeroSection/              # Scroll-scrubbed hero (GSAP + Lenis)
│   ├── GrandDesignGallery/         # Bento grid + flip-transition detail view
│   ├── BookingModal/                # "Book Now" form, validation, success state
│   └── Footer/                        # Parallax car reveal, CTA, legal links
└── shared/
    ├── config/               # site.config.ts, navigation.config.ts, env.ts — branding
    ├── ui/                    # Reusable primitives (Section, ArrowIcon, LangSwitcher, ...)
    ├── hooks/                  # useScrollLock, useActiveSection, useScrollTriggerAutoRefresh, ...
    ├── providers/                # Theme, preloader, booking-modal, smooth-scroll contexts
    └── lib/, styles/, types/       # Infrastructure, design tokens, TypeScript contracts
```

`Header`, `Preloader` and `BookingModal` are rendered once as global chrome (see
[`AppProviders`](src/shared/providers/AppProviders.tsx)); the page itself is composed in
[`src/app/[locale]/page.tsx`](<src/app/[locale]/page.tsx>):

```tsx
<HeroSection />
<GrandDesignGallery />
<Footer />
```

---

## Design System

Colors, spacing, radius and shadows are CSS custom properties in
[`src/shared/styles/tokens.scss`](src/shared/styles/tokens.scss) — components read the variables,
never raw hex values. Typography (`--font-display`, `--font-body`, `--font-mono`) lives in
[`src/shared/styles/typography.scss`](src/shared/styles/typography.scss). Animation timing is
tokenized in [`src/shared/constants/motion.ts`](src/shared/constants/motion.ts) for the Framer Motion
presets under `src/shared/lib/motion/`.

---

## Localization

Built on [`next-intl`](https://next-intl.dev), with full routing, middleware and typed locale support.

- **Available locales:** `en`, `ru`, `de`, `pl`, `fi` (English is the fallback).
- **Locale list:** [`src/i18n/routing.ts`](src/i18n/routing.ts) — `routing.locales` / `defaultLocale`.
- **UI copy:** `messages/<locale>.json` (nav, hero, gallery, footer, booking form).
- **Locale detection & routing:** [`src/proxy.ts`](src/proxy.ts) (Next.js middleware).

**To add a language** (example: French, `fr`):

1. Add `"fr"` to `routing.locales` in `src/i18n/routing.ts`.
2. Create `messages/fr.json` (copy `messages/en.json` and translate).
3. Add an `"fr"` entry to `LOCALE_META` in `src/app/[locale]/layout.tsx`.

---

## SEO

- **Per-locale metadata & JSON-LD:** [`src/app/[locale]/layout.tsx`](<src/app/[locale]/layout.tsx>).
- **Branding & site URL:** [`src/shared/config/site.config.ts`](src/shared/config/site.config.ts).
- **Sitemap & robots:** [`src/app/sitemap.ts`](src/app/sitemap.ts) / [`src/app/robots.ts`](src/app/robots.ts)
  — both dynamic, both derive their domain from `siteConfig.url`.
- **OpenGraph / favicon images:** `public/og/cover.jpg` (1731×909) and `public/icon/icon.png` (32×32).

---

## Environment Variables

```bash
cp .env.example .env.local
```

| Variable               | Required      | Description                                                                          |
| ----------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | In production  | Public base URL, used for canonical links, OpenGraph, `sitemap.xml` and `robots.txt`. Defaults to `http://localhost:3000` if unset. |

Analytics (`@vercel/analytics`, `@vercel/speed-insights`) are wired into the layout and are safe no-ops
outside of Vercel.

---

## Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # start production build
npm run lint          # ESLint check
npm run lint:fix      # ESLint autofix
npm run type-check    # TypeScript check (no emit)
npm run format         # Prettier format
npm run format:check  # Prettier check only
```

---

## Docker

```bash
docker compose up --build
# or
docker build -t tata-safari .
docker run -p 3000:3000 tata-safari
```

Multi-stage `Dockerfile`: `builder` installs deps and runs `next build`; `runner` is a minimal
`node:22-alpine` image running as a non-root user, using `output: standalone`.

---

## CI

GitHub Actions runs `install → lint → type-check → build` on every push/PR to `main`. See
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Deployment

Standard Next.js app, deploys anywhere Next.js runs.

**Vercel** — connect the repo, set `NEXT_PUBLIC_SITE_URL`, deploy.

**Docker / any VPS** — `docker compose up -d`, then reverse-proxy to `localhost:3000`.

---

## License

[MIT](LICENSE)

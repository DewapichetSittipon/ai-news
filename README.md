# CLAUDE NEWS — 8-bit edition

A retro (NES-style) **AI News Arcade** — aggregates news from the major AI labs
(Anthropic, OpenAI, Google DeepMind, Google AI, Hugging Face), built with
**React + TypeScript + Tailwind v4**. Bilingual (TH/EN), with 8-bit sound
effects, source filtering, and bookmarks.

Sources are pulled feed-first: Anthropic has no feed so it's scraped; the rest
come from official RSS/Atom (ADR-0004). Some feeds carry only a summary — the
in-app body is then short and the "read original" link backstops it.

The site is a **pure static front-end** — there is no runtime API. News is
scraped and translated _at build time_ into static JSON committed to the repo.
See [`docs/adr/`](./docs/adr) for the architectural decisions and
[`CONTEXT.md`](./CONTEXT.md) for the glossary.

## How it works

```
GitHub Action (daily cron)
  └─ npm run scrape      all sources → public/data/index.json + articles/*.json (English)
  └─ npm run build       Vite bundles the static site
  └─ deploy to GitHub Pages
```

Thai is **not** baked in — it's translated on-device in the visitor's browser at
runtime via the Chrome Translator API (no key, no server; falls back to English
on Safari/Firefox/older Chrome). See ADR-0003.

Adding a source is a one-line entry in `scripts/sources.ts` (+ `src/sources.ts`
for its badge colour). RSS sources share one adapter; bespoke sites get their own.

At runtime the app just fetches the JSON Snapshot — no server, no API key.

## Develop

```bash
npm install
npm run dev            # ships with sample data so it runs offline
```

Refresh real data locally (no API key needed):

```bash
npm run scrape         # pull latest News Items from all sources (English)
```

## Deploy (GitHub Pages)

1. Push to GitHub; in **Settings → Pages**, set source to **GitHub Actions**.
2. The `Refresh & Deploy` workflow runs on push and daily, committing the
   refreshed Snapshot and publishing to Pages. No secrets required.

`vite.config.ts` uses `base: "./"`, so it works from a project subpath without
extra config. Routing uses `HashRouter`, so deep links never 404 on Pages.

## Notes

- **Fonts:** `Press Start 2P` (Latin) has no Thai glyphs; Thai falls back to
  `Noto Sans Thai`. That mismatch is expected.
- **Images & content** come from anthropic.com. This is a fan/educational
  project — each article links back to the original. Don't redeploy it as an
  official-looking source.
- **Selectors are semantic** (`<article>`, `<h1>`, `og:image`). If Anthropic
  restructures the Newsroom and `npm run scrape` finds nothing, that's where to
  look.

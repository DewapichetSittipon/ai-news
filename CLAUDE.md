# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev        # Vite dev server; ships with committed sample data, runs fully offline
npm run scrape     # refresh public/data/ from all live sources (English only, no API key)
npm run build      # tsc -b (typecheck) + vite build → dist/
npm run preview    # serve the production build locally
```

There is no test suite and no separate lint step — `npm run build` runs `tsc -b` first, so a clean build is the typecheck gate. To refresh a subset while developing, the RSS adapter honours `MAX_ITEMS` (default 40), e.g. `MAX_ITEMS=5 npm run scrape`.

## Architecture

A pure static front-end (React 19 + TS + Tailwind v4) "AI News Arcade" with **no runtime backend**. The defining split is build-time vs. runtime:

- **Build time** (`scripts/`, Node + tsx): scrape/aggregate every Source into a static **Snapshot** under `public/data/` — `index.json` (list metadata) plus one `articles/<id>.json` per item. This is committed to the repo.
- **Runtime** (`src/`, browser): the app just `fetch`es that JSON. `useSnapshotIndex` loads the list; `useArticle` lazy-loads one article body by id. No server, no API key, no live scraping.

See `docs/adr/` for the decisions behind this (0001 build-time data, 0002 scraping, 0003 translation, 0004 multi-source) and `CONTEXT.md` for the domain glossary (News Item, Source, Snapshot, Newsroom, Bookmark, Locale, Translation).

### Data pipeline (`scripts/scrape.ts`)

Iterates `SOURCES` (in `scripts/sources.ts`), dispatching each to an **adapter** in `scripts/adapters/`:
- `anthropic.ts` — bespoke HTML scraper; Anthropic has no feed. Selects on **stable semantic anchors** (`<article>`, `<h1>`, `<time datetime>`, `/news/<slug>` hrefs), never on the hashed CSS-module class names (ADR-0002).
- `rss.ts` — generic RSS/Atom adapter for every other lab (feed-first, ADR-0004); `html.ts` holds shared block-extraction helpers.

Results merge, dedupe, and rewrite the `articles/` dir from scratch each run. A scraper break fails loudly in CI; visitors keep seeing the last committed Snapshot.

### Two `sources.ts` files — keep them in sync

Adding a Source touches **both**:
- `scripts/sources.ts` — build-side feed/scrape config (`kind: "anthropic" | "rss"`, feed URL).
- `src/sources.ts` — UI metadata only (label, short tag, pixel badge colour).
- `SourceId` is a closed union in `src/types.ts`, which both halves import.

`src/types.ts` is the shared contract used by app *and* scripts. Every item carries a composite **`id` = `${source}__${slug}`** (slugs collide across labs) — it's both the route param and the article filename.

### Bilingual: Thai is translated on-device, not baked (ADR-0003)

The Snapshot is **English-only**. When a visitor switches to Thai, their browser translates visible text at runtime via the Chrome Translator API (`window.Translator`), cached in `localStorage`. `useTranslator`/`useT` wrap this; Safari/Firefox/older Chrome fall back to English (surfaced in the UI). Do not add a build-time translation step or expect `th` text in the JSON.

### Routing & deploy

- `HashRouter` (`src/App.tsx`) + Vite `base: "./"` so deep links never 404 and the app works from a GitHub Pages project subpath without config.
- `.github/workflows/refresh.yml` runs on push to `main`, on a **30-min cron**, and on manual dispatch: scrape → commit refreshed Snapshot back to `main` → build → deploy to Pages. Because the workflow commits the Snapshot, **`git pull --rebase` before starting local work** or you'll be behind origin.

### Theming

Tailwind v4 with CSS-first `@theme` tokens in `src/index.css` (NES palette as `bg-*`/`text-*` utilities). Two font tokens by intent: `--font-pixel` (Press Start 2P) for chrome/headings, `--font-body` (VT323) for long-form reading text. Both fall back to `Noto Sans Thai` for Thai glyphs. Pixel aesthetic relies on `.pixel-box`/`.pixel-btn` and `image-rendering: pixelated`.

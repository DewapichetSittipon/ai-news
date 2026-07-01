# Claude News (Retro Reader)

A retro game-themed web reader that aggregates news/announcements from the major AI labs (an "AI News Arcade"). Front-end only (React + TS + Tailwind); data is baked in at build time, so there is no runtime backend.

## Language

**News Item**:
A single piece of news published by a Source — has a title, publish date, category, Source, origin URL, a summary, and body content (read inside the app).
_Avoid_: Post, article, story, entry

**Source**:
The AI lab a News Item was published by (Anthropic, OpenAI, Google DeepMind, Google AI, Hugging Face). Each News Item belongs to exactly one Source; the app can filter by it.
_Avoid_: Provider, publisher, vendor, origin

**Category**:
The classification the Source assigns a News Item — e.g. Product, Announcements, Policy. Used for filtering, orthogonal to Source.
_Avoid_: Tag, topic, label

**Newsroom**:
A Source's public stream of News Items (e.g. anthropic.com/news, an RSS feed). The upstream of truth.
_Avoid_: Blog, feed, API

**Snapshot**:
The static JSON file of News Items produced by the build-time fetch and committed to the repo. What the app actually reads from.
_Avoid_: Cache, dump, data file

**Bookmark**:
A News Item the visitor marks to keep, stored only in their browser (localStorage). Personal and device-local — never synced.
_Avoid_: Favorite, save, star, pin

**Locale**:
The language a visitor reads in — Thai (`th`) or English (`en`). Every News Item carries both; the chrome carries both. The visitor's chosen Locale is remembered in localStorage.
_Avoid_: Language, lang, i18n

**Translation**:
The Thai rendering of a News Item's text, produced at build time during scrape (`scripts/translate.ts`) and baked into the Snapshot alongside the English. Every Localized field carries both `en` and `th`; the app just reads the current Locale with `pick()`.
_Avoid_: Localization, machine translation


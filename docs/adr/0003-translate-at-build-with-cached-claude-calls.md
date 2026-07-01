# Thai is translated at build time and baked into the Snapshot

**Status:** accepted — supersedes an interim on-device-translation decision.

We translate every News Item EN→TH during `npm run scrape` and commit the Thai
text into the Snapshot JSON. At runtime the app just reads the `th` field; the
browser never translates.

## History

1. Originally we translated at build time with an LLM (Gemini, then OpenRouter).
   The free tiers were rate-limited too hard to finish a run.
2. We then moved to **on-device** translation via the browser's built-in
   Translator API (`window.Translator`) — zero keys, zero cost. But that API is
   **Chromium-desktop-only**: Safari, Firefox, and — critically — **all mobile
   browsers** have no `window.Translator`, so those visitors only ever saw
   English. For a news reader that is mostly opened on phones, that failed the
   core use case.
3. So we returned to **build time**, but avoided the original rate-limit pain
   with two changes: the free, keyless Google Translate endpoint
   (`translate.googleapis.com`), and a **persisted disk cache**
   (`scripts/translation-cache.json`, committed) so a refresh only translates
   genuinely new strings.

## Why this shape

- **Works everywhere**, including mobile and Safari/Firefox — the whole reason
  for the change.
- **Still no API key and no runtime backend**: the Snapshot stays a pile of
  static JSON; translation is a build step, not a per-view request.
- **Cheap refreshes**: with the cache, the 30-min cron only pays for new items.

Trade-offs: quality is Google's, not an LLM's; the free endpoint is unofficial
and could rate-limit or change shape (`translate.ts` fails soft — it keeps the
English text and never breaks a run). Rejected again: a runtime serverless proxy
(adds a backend + per-view cost + abuse surface), and a keyed cloud translator
(reintroduces a secret + billing).

See `scripts/translate.ts` for the implementation.

# Thai is translated on-device in the browser at runtime

**Status:** accepted — supersedes the original build-time decision recorded here.

Originally we translated at build time with an LLM (Gemini, then OpenRouter) and shipped pre-translated JSON. In practice the free LLM tiers were rate-limited too hard to finish a run, and any keyed approach reintroduces a secret + recurring cost. So we switched to **on-device, real-time translation** using the browser's built-in Translator API (`window.Translator`): when a visitor switches to Thai, their browser translates the visible text locally, cached in `localStorage`.

Why: zero keys, zero server, zero recurring cost, and the Snapshot stays English-only (simpler build, no translation step in CI). Trade-offs: the Translator API is Chromium-only (recent Chrome/Edge) and needs a one-time on-device model download, so Safari/Firefox/older browsers fall back to English (surfaced in the UI). Quality is the browser's, not an LLM's. Rejected alternatives: build-time LLM (key + cost + rate-limits), a runtime serverless proxy (adds a backend, per-view cost, abuse surface), and relying on the browser's full-page translate menu (not themable, not programmatic).

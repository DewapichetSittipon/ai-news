# Data is fetched at build time into a static Snapshot; no runtime API

Anthropic's Newsroom has no official RSS/JSON feed, so we must derive News Items ourselves. We considered a runtime serverless proxy (fresh on every visit) and a fully manual JSON, but chose to fetch/scrape the Newsroom **at build time** into a static `snapshot.json` committed to the repo, refreshed on a schedule (e.g. GitHub Action cron ~daily).

Why: keeps the project a pure static front-end (free hosting, no server to operate, no CORS/runtime scraping fragility), while staying reasonably fresh. Trade-off: news is at most ~1 build stale, and a Newsroom HTML change breaks the scheduled fetch (caught in CI, not by users at runtime).

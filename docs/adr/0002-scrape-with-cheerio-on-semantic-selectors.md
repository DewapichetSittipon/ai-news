# Scrape the Newsroom with cheerio, targeting semantic HTML not CSS-module classes

The Newsroom listing and individual article pages are server-rendered — News Item titles, links, dates and full body are present in the raw HTML response (verified with `curl`). So the build-time fetch uses `cheerio` (plain HTML parsing); no headless browser (Playwright) is needed.

However, Anthropic's markup uses hashed CSS-module class names (e.g. `PostDetail-module-scss-module__UQuRMa__title`) that change on every deploy. The scraper therefore selects on **stable semantic anchors** — `<article>`, `<h1>`, `<time datetime>`, `/news/<slug>` hrefs — rather than class names. If selectors break, the scheduled GitHub Action fails loudly in CI; users never see a broken fetch at runtime (data is the last committed Snapshot).

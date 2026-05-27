# enshittifier-extension

## Source of truth
- GitHub: github.com/wr/enshittifier-extension
- Linear project: Enshittifier Extension (id: 2ab6f8ee-f35b-457d-ba11-c59e6262489f, team: Personal)
- Branch prefix: wells/
- PR mode: ready

## Project
Standalone Chrome extension that replaces "AI" in page text with a
configurable string (default 💩). Sibling to wr/enshittifier (the font
patcher) — same goal, different layer.

Single content script + options page + manifest. No build step, no runtime
dependencies. The repo root is what gets loaded into `chrome://extensions`.
`build-zip.sh` packages the runtime files into a Chrome Web Store upload
bundle under `dist/`.

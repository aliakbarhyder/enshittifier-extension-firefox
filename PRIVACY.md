# Privacy policy — Enshittifier

Short version: Enshittifier doesn't collect, transmit, or share any data
about you. It runs entirely in your browser.

## What's stored

The extension uses `chrome.storage.sync` to remember four settings between
browser sessions, and to sync them across the Chrome installs you're signed
into:

| Key                | What it holds                                   |
| ------------------ | ----------------------------------------------- |
| `enabled`          | on/off toggle                                   |
| `replacement`      | the text/emoji you picked to replace "AI" with  |
| `excludedDomains`  | the list of sites you told the extension to skip |
| `effect`           | the visual effect you picked (Plain / Glow / Twirl / Rainbow) |

That's the entire data footprint. Sync is handled by Google as part of
Chrome — see [Google's Chrome Sync privacy notice](https://www.google.com/chrome/privacy/whitepaper.html#sync)
for what they do with it.

## What's NOT collected

- No analytics, telemetry, or usage tracking.
- No remote servers contacted by the extension itself.
- No reading or transmitting of the page content the extension processes.
  Text-replacement happens entirely in the page's DOM and never leaves the
  browser.
- No advertising IDs, fingerprinting, or unique identifiers of any kind.

## Permissions

- **`storage`** — required to remember the four settings above.
- **content script on `<all_urls>`** — required to do the actual text
  replacement. The extension's only purpose is to rewrite text on the web
  pages you visit, so it has to run on each page. It does not read or send
  page content anywhere; it just edits the DOM in place.

## Third parties

The options page links out to two third-party sites:

- [enshittifier.wells.ee](https://enshittifier.wells.ee) — project homepage
- [buymeacoffee.com/wellsriley](https://buymeacoffee.com/wellsriley) — optional tip jar

The extension itself doesn't load or contact either site. Clicking the
links opens a new tab the normal way; at that point their own privacy
policies apply.

## Contact

Open an issue at
[github.com/wr/enshittifier-extension](https://github.com/wr/enshittifier-extension/issues)
or use the [contact form](https://wells.ee/contact).

## Changes

This policy will be updated alongside the extension if the data footprint
ever changes. The history is in git.

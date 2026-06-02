# Enshittifier

Replaces **AI** in page text with 💩 — or whatever you'd rather see.

Dead Internet companion. Sibling to [wr/enshittifier](https://github.com/wr/enshittifier),
which does the same thing one layer lower as a font patch. This is the
browser-native version: works everywhere your browser does, no font install
required.

🌐 [enshittifier.wells.ee](https://enshittifier.wells.ee)
· ☕ [Donate](https://buymeacoffee.com/wellsriley)

## Install

**Firefox:**
1. Clone or download this repo.
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** and select `manifest.json`

**Chrome (and Chromium-based browsers):**
See the [Chrome version of this extension](https://github.com/wr/enshittifier-extension).

## Configure

Click the 💩 in your toolbar for a quick **on/off** toggle. Open the
extension's options page (right-click the icon → **Options**, or via
the Add-ons page) to change the replacement text or exclude sites.

- **Replace AI with** — any text or emoji.
- **Skip these sites** — one host per line. Subdomains included
  automatically. `*` is a wildcard, e.g. `*.openai.com`, `news.*`,
  `*reddit*`.

## What it actually does

A single regex — `/AI(?![A-Za-z0-9])/g` — runs over the page's text nodes
and replaces any uppercase `AI` that isn't followed by another letter or
digit. So:

| You see              | It becomes        |
| -------------------- | ----------------- |
| `Tell me about AI`   | `Tell me about 💩` |
| `OpenAI`             | `Open💩`           |
| `AI-powered`         | `💩-powered`       |
| `(AI)`, `AI.`, `AI/ML` | replaced         |
| `MAIL`, `AID`, `AIDS`, `AIs` | unchanged |
| `ai`, `maintain`, `said` | unchanged       |

Form fields, code blocks, and editable regions are skipped so it never gets
in the way of what you're typing.

Open [`test.html`](test.html) with the extension loaded to see every case.

## Files

| File              | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `manifest.json`   | MV3 manifest                                         |
| `content.js`      | The text-replacement engine                          |
| `background.js`   | Service worker — swaps toolbar icon by on/off state  |
| `popup.html/js/css` | Toolbar popup with the on/off toggle               |
| `options.html/js/css` | Full settings page                               |
| `icons/`          | PNG icons (color + disabled variants at 16/48/128 px) |
| `test.html`       | Manual test page                                     |

## License

[AGPL-3.0](LICENSE).

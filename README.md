# Enshittifier

Replaces AI in page text with 💩 — or whatever you'd rather see.

Dead Internet companion. Sibling to wr/enshittifier, which does the same thing one layer lower as a font patch. This is the browser-native version: works everywhere your browser does, no font install required.

🌐 [enshittifier.wells.ee](https://wells.ee) · ☕ [Donate](https://wells.ee)

This was created for Chrome, I have, under terms of the licence, forked and rewritten it using AI to be compatible with Firefox and Firefox-based browsers, such as Zen, Oasis, and more.
Hope you enjoy!

## Install

### Firefox

**Official Release:**
* Download it directly from the Mozilla Add-ons store *(Link coming soon once approved)*.

**For Local Development:**
1. Clone or download this repo.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on** and select `manifest.json`.

### Chrome (and Chromium-based browsers)
See the Chrome version of this extension.

## Configure

Click the 💩 in your toolbar for a quick on/off toggle. Open the extension's options page (right-click the icon → Options, or via the Add-ons page) to change the replacement text or exclude sites.

* **Replace AI with** — any text or emoji.
* **Skip these sites** — one host per line. Subdomains included automatically. `*` is a wildcard, e.g. `*.openai.com`, `news.*`, `*reddit*`.

## What it actually does

A single regex — `/AI(?![A-Za-z0-9])/g` — runs over the page's text nodes and replaces any uppercase AI that isn't followed by another letter or digit. So:


| You see | It becomes |
| :--- | :--- |
| Tell me about AI | Tell me about 💩 |
| OpenAI | Open💩 |
| AI-powered | 💩-powered |
| (AI), AI., AI/ML | *replaced* |
| MAIL, AID, AIDS, AIs | *unchanged* |
| ai, maintain, said | *unchanged* |

Form fields, code blocks, and editable regions are skipped so it never gets in the way of what you're typing.

Open `test.html` with the extension loaded to see every case.

## Files


| File | Purpose |
| :--- | :--- |
| `manifest.json` | MV3 manifest (configured for Firefox Gecko engine compatibility) |
| `content.js` | The text-replacement engine |
| `background.js` | Non-persistent background script — swaps toolbar icon by on/off state |
| `popup.html/js/css` | Toolbar popup with the on/off toggle |
| `options.html/js/css` | Full settings page |
| `icons/` | PNG icons (color + disabled variants at 16/48/128 px) |
| `test.html` | Manual test page |

## Recent Changes

* **Firefox MV3 Compatibility:** Fixed background process execution layout. Replaced Chromium's non-standard `"service_worker"` context with Firefox-compatible `"scripts"` execution block under the `background` keys.
* **Privacy Controls:** Added standard `"data_collection_permissions"` declarations (`none required`) to align with modern Mozilla Add-on Developer Hub security and verification protocols.

## License

AGPL-3.0.

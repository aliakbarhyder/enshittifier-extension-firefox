/*
 * Replaces uppercase "AI" with a configurable string, with the regex
 *
 *   /AI(?![A-Za-z0-9])/g
 *
 * which catches " AI ", "OpenAI", "AI-powered" while skipping MAIL/AID/AIs.
 *
 * Each replacement is wrapped in <span class="ensh-tag"> so the visual
 * effect (glow / twirl / rainbow) can be styled with CSS that gets
 * injected into the page when the script starts.
 *
 * `excludedDomains` entries match the page host. Plain entries (`openai.com`)
 * match the domain and any subdomain. Entries with `*` are treated as globs
 * (e.g. `*.openai.com`, `news.*`, `*reddit*`).
 */

const PATTERN = /AI(?![A-Za-z0-9])/g;
const TAG_CLASS = "ensh-tag";
const STYLE_ID = "__ensh-style";

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
  "CODE", "PRE", "KBD", "SAMP", "TT",
]);

const DEFAULTS = {
  enabled: true,
  replacement: "💩",
  excludedDomains: [],
  effect: "none",
};

const EFFECT_CSS = {
  none: `.${TAG_CLASS} { display: inline; }`,
  glow: `
    .${TAG_CLASS} {
      display: inline-block;
      animation: ensh-glow 9s linear infinite;
    }
    @keyframes ensh-glow {
      0%   { text-shadow: 0 0 0.13em hsl(  0, 65%, 72%), 0 0 0.3em hsl(  0, 65%, 68%); }
      17%  { text-shadow: 0 0 0.13em hsl( 60, 65%, 72%), 0 0 0.3em hsl( 60, 65%, 68%); }
      33%  { text-shadow: 0 0 0.13em hsl(120, 65%, 72%), 0 0 0.3em hsl(120, 65%, 68%); }
      50%  { text-shadow: 0 0 0.13em hsl(180, 65%, 72%), 0 0 0.3em hsl(180, 65%, 68%); }
      67%  { text-shadow: 0 0 0.13em hsl(240, 65%, 72%), 0 0 0.3em hsl(240, 65%, 68%); }
      83%  { text-shadow: 0 0 0.13em hsl(300, 65%, 72%), 0 0 0.3em hsl(300, 65%, 68%); }
      100% { text-shadow: 0 0 0.13em hsl(360, 65%, 72%), 0 0 0.3em hsl(360, 65%, 68%); }
    }
  `,
  twirl: `
    .${TAG_CLASS} {
      display: inline-block;
      animation: ensh-twirl 1.8s linear infinite;
      transform-origin: center;
    }
    @keyframes ensh-twirl {
      from { transform: rotate(0); }
      to   { transform: rotate(360deg); }
    }
  `,
  rainbow: `
    .${TAG_CLASS} {
      display: inline-block;
      animation: ensh-rainbow 2.5s linear infinite;
    }
    @keyframes ensh-rainbow {
      from { filter: hue-rotate(0deg); }
      to   { filter: hue-rotate(360deg); }
    }
  `,
};

let state = { ...DEFAULTS };
let started = false;
let observer = null;
let titleObserver = null;

function globToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("^" + escaped.replace(/\*/g, ".*") + "$", "i");
}

function hostMatches(host, pattern) {
  if (!pattern) return false;
  pattern = pattern.toLowerCase().trim();
  host = host.toLowerCase();
  if (pattern.includes("*")) return globToRegex(pattern).test(host);
  return host === pattern || host.endsWith("." + pattern);
}

function isExcluded(host, list) {
  return list.some((d) => hostMatches(host, d));
}

// For iframes (e.g. the Intercom chat widget renders inside an
// about:blank iframe), `location.hostname` is empty. Walk to the top so
// the exclusion list applies to the whole page, not just the outer frame.
function pageHost() {
  try {
    return window.top.location.hostname || location.hostname;
  } catch {
    return location.hostname;
  }
}

function shouldSkipNode(node) {
  let p = node.parentNode;
  while (p && p.nodeType === Node.ELEMENT_NODE) {
    if (SKIP_TAGS.has(p.tagName)) return true;
    if (p.classList && p.classList.contains(TAG_CLASS)) return true;
    if (p.isContentEditable) return true;
    p = p.parentNode;
  }
  return false;
}

function rewriteTextNode(node) {
  const text = node.nodeValue;
  if (!text || text.indexOf("AI") === -1) return;
  if (shouldSkipNode(node)) return;

  PATTERN.lastIndex = 0;
  let match;
  let lastIndex = 0;
  const frag = document.createDocumentFragment();
  let hit = false;

  while ((match = PATTERN.exec(text)) !== null) {
    hit = true;
    if (match.index > lastIndex) {
      frag.appendChild(
        document.createTextNode(text.slice(lastIndex, match.index)),
      );
    }
    const tag = document.createElement("span");
    tag.className = TAG_CLASS;
    tag.textContent = state.replacement;
    frag.appendChild(tag);
    lastIndex = match.index + match[0].length;
  }

  if (!hit) return;
  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
  node.parentNode?.replaceChild(frag, node);
}

function walk(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) rewriteTextNode(node);
}

// Update every already-wrapped span to the current replacement string.
// Used when `replacement` changes live — without this, existing spans keep
// the previous emoji until page reload.
function refreshTagsText() {
  document.querySelectorAll("." + TAG_CLASS).forEach((tag) => {
    if (tag.textContent !== state.replacement) {
      tag.textContent = state.replacement;
    }
  });
}

// Replace every <span class="ensh-tag"> with its original "AI" text node,
// so disabling the extension actually restores the page.
function unwrapAllTags() {
  const tags = document.querySelectorAll("." + TAG_CLASS);
  const parents = new Set();
  tags.forEach((tag) => {
    const parent = tag.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode("AI"), tag);
    parents.add(parent);
  });
  // Merge adjacent text nodes so a future re-walk sees coherent strings.
  parents.forEach((p) => p.normalize());
}

function handleMutation(mutations) {
  for (const m of mutations) {
    if (m.type === "characterData") {
      if (m.target.nodeType === Node.TEXT_NODE) rewriteTextNode(m.target);
    } else if (m.type === "childList") {
      for (const node of m.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          rewriteTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList && node.classList.contains(TAG_CLASS)) continue;
          walk(node);
        }
      }
    }
  }
}

function injectStyle() {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(el);
  }
  el.textContent = EFFECT_CSS[state.effect] || EFFECT_CSS.none;
}

function removeStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

// Use a replacer function so `$&`, `$1`, etc. in the user's replacement
// string are NOT interpreted as regex backreference patterns.
function patchTitle() {
  if (!document.title || document.title.indexOf("AI") === -1) return;
  const next = document.title.replace(PATTERN, () => state.replacement);
  if (next !== document.title) document.title = next;
}

function start() {
  if (started) return;
  started = true;

  const initial = () => {
    injectStyle();
    if (document.body) walk(document.body);
    observer = new MutationObserver(handleMutation);
    observer.observe(document.documentElement || document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // <title> is only safe to query once the parser has reached it.
    patchTitle();
    const titleEl = document.querySelector("title");
    if (titleEl) {
      titleObserver = new MutationObserver(patchTitle);
      titleObserver.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initial, { once: true });
  } else {
    initial();
  }
}

function stop() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }
  unwrapAllTags();
  removeStyle();
  started = false;
}

function shouldRun() {
  return state.enabled && !isExcluded(pageHost(), state.excludedDomains);
}

function applyState() {
  if (shouldRun()) {
    if (!started) start();
  } else if (started) {
    stop();
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  let touched = false;
  let replacementChanged = false;
  if (changes.enabled) {
    state.enabled = changes.enabled.newValue ?? DEFAULTS.enabled;
    touched = true;
  }
  if (changes.replacement) {
    state.replacement = changes.replacement.newValue ?? DEFAULTS.replacement;
    touched = true;
    replacementChanged = true;
  }
  if (changes.excludedDomains) {
    state.excludedDomains =
      changes.excludedDomains.newValue ?? DEFAULTS.excludedDomains;
    touched = true;
  }
  if (changes.effect) {
    state.effect = changes.effect.newValue ?? DEFAULTS.effect;
    if (started) injectStyle();
  }
  if (replacementChanged && started) refreshTagsText();
  if (touched) applyState();
});

chrome.storage.sync.get(DEFAULTS, (loaded) => {
  state = { ...DEFAULTS, ...loaded };
  if (shouldRun()) start();
});

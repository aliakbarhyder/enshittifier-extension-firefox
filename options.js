const DEFAULTS = {
  replacement: "💩",
  excludedDomains: [],
  effect: "none",
};

const PRESETS = ["💩", "🤖", "✨️", "🚽", "🔥", "🤡"];
const EFFECTS = new Set(["none", "glow", "twirl", "rainbow"]);

const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function currentReplacement() {
  const sel = document.querySelector(".preset.selected");
  if (!sel) return "";
  if (sel.id === "custom") return $("custom").value;
  return sel.dataset.value;
}

function currentEffect() {
  const sel = document.querySelector(".style-btn.selected");
  return sel ? sel.dataset.effect : "none";
}

function renderExamples() {
  const rep = currentReplacement() || DEFAULTS.replacement;
  $$(".ex").forEach((el) => (el.textContent = rep));
}

function clearError() {
  $("custom").removeAttribute("aria-invalid");
  $("custom").classList.remove("invalid");
  $("replacement-error").hidden = true;
}

function showError() {
  $("replacement-error").hidden = false;
  if ($("custom").classList.contains("selected")) {
    $("custom").setAttribute("aria-invalid", "true");
    $("custom").classList.add("invalid");
    $("custom").focus();
  }
}

function markSelected(group, predicate) {
  $$(group).forEach((el) => {
    const match = predicate(el);
    el.classList.toggle("selected", match);
    el.setAttribute("aria-checked", match ? "true" : "false");
  });
}

function selectPreset(value) {
  markSelected(".preset", (el) => el.id !== "custom" && el.dataset.value === value);
  clearError();
  renderExamples();
}

function selectCustom(opts = {}) {
  markSelected(".preset", (el) => el.id === "custom");
  if (opts.focus) $("custom").focus();
  renderExamples();
}

function selectEffect(value) {
  markSelected(".style-btn", (el) => el.dataset.effect === value);
  if (value && value !== "none") {
    document.body.setAttribute("data-effect", value);
  } else {
    document.body.removeAttribute("data-effect");
  }
}

function applyForm(cur) {
  const val = cur.replacement || DEFAULTS.replacement;
  $("excluded").value = (cur.excludedDomains || []).join("\n");
  if (PRESETS.includes(val)) {
    $("custom").value = "";
    selectPreset(val);
  } else {
    $("custom").value = val;
    selectCustom();
  }
  selectEffect(EFFECTS.has(cur.effect) ? cur.effect : "none");
}

function setStatus(text, isError = false) {
  const status = $("status");
  status.textContent = text;
  status.classList.toggle("error", isError);
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), isError ? 4000 : 1800);
}

function load() {
  chrome.storage.sync.get(DEFAULTS, (cur) => {
    applyForm(cur);
    // Silent migration: an unknown stored effect (e.g. legacy "sparkle")
    // would otherwise be silently clobbered to "none" the next time the
    // user saves. Write the migrated value back now so it's explicit.
    if (cur.effect && !EFFECTS.has(cur.effect)) {
      chrome.storage.sync.set({ effect: "none" }, () => {
        void chrome.runtime.lastError; // best-effort migration
      });
    }
  });
}

function save() {
  const rep = currentReplacement().trim();
  if (!rep) {
    showError();
    return;
  }
  clearError();

  const excludedDomains = $("excluded").value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  chrome.storage.sync.set(
    { replacement: rep, excludedDomains, effect: currentEffect() },
    () => {
      if (chrome.runtime.lastError) {
        setStatus("Couldn't save: " + chrome.runtime.lastError.message, true);
        return;
      }
      setStatus("Saved.");
      renderExamples();
    },
  );
}

$$(".preset").forEach((btn) => {
  if (btn.id === "custom") return;
  btn.addEventListener("click", () => selectPreset(btn.dataset.value));
});

const customInput = $("custom");
customInput.addEventListener("focus", () => selectCustom());
customInput.addEventListener("input", () => {
  selectCustom();
  if (customInput.value.trim()) clearError();
  renderExamples();
});

$$(".style-btn").forEach((btn) => {
  btn.addEventListener("click", () => selectEffect(btn.dataset.effect));
});

$("save").addEventListener("click", save);

// Keep the form in sync if another context (popup, another tab, sync from
// another device) updates storage while the page is open. Don't clobber
// the user mid-edit — only refresh when no input/textarea has focus.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if (!(changes.replacement || changes.excludedDomains || changes.effect)) return;
  if (document.activeElement?.matches("input, textarea")) return;
  chrome.storage.sync.get(DEFAULTS, applyForm);
});

document.addEventListener("DOMContentLoaded", load);

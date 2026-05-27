// Swaps the toolbar icon between the color (enabled) and grayscale (disabled)
// variants whenever the `enabled` flag changes.

const ICONS_ON = {
  16: "icons/icon16.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};

const ICONS_OFF = {
  16: "icons/icon16-disabled.png",
  48: "icons/icon48-disabled.png",
  128: "icons/icon128-disabled.png",
};

function applyIcon(enabled) {
  chrome.action.setIcon({ path: enabled ? ICONS_ON : ICONS_OFF });
}

function syncFromStorage() {
  chrome.storage.sync.get({ enabled: true }, ({ enabled }) => applyIcon(enabled));
}

chrome.runtime.onInstalled.addListener(syncFromStorage);
chrome.runtime.onStartup.addListener(syncFromStorage);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.enabled) {
    applyIcon(changes.enabled.newValue);
  }
});

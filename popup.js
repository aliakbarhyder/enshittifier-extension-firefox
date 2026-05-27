const $ = (id) => document.getElementById(id);

function setState(enabled, message) {
  $("enabled").checked = enabled;
  $("state").classList.toggle("error", !!message);
  $("state").textContent =
    message ??
    (enabled
      ? "Replacing AI with whatever you picked."
      : "Off. Pages render as their authors intended.");
}

chrome.storage.sync.get({ enabled: true }, ({ enabled }) => setState(enabled));

$("enabled").addEventListener("change", (e) => {
  const requested = e.target.checked;
  chrome.storage.sync.set({ enabled: requested }, () => {
    if (chrome.runtime.lastError) {
      // Revert the visible toggle so it matches the actual stored value.
      setState(!requested, "Couldn't save: " + chrome.runtime.lastError.message);
      return;
    }
    setState(requested);
  });
});

$("settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
  window.close();
});

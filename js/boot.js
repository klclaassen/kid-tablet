function safeCall(fnName, ...args) {
  const fn = window[fnName];
  if (typeof fn === "function") {
    return fn(...args);
  }
}

function bootApp() {
  safeCall("bootUI");
  safeCall("wireRewardOverlayClose");
  safeCall("renderProgress");
  safeCall("wireSettingsUI");
  safeCall("renderAvatarBadge");
  safeCall("logSessionStart", {
    page: location.pathname.split("/").pop() || "index.html"
  });
}

window.addEventListener("DOMContentLoaded", bootApp);
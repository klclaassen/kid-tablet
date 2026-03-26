const DEFAULT_SETTINGS = {
  lenient: false
};

function getSettings() {
  return loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

function setSettings(settings) {
  saveJSON(STORAGE_KEYS.settings, settings);

  if (typeof logEvent === "function") {
    logEvent("settings_updated", settings);
  }
}

function updateSetting(key, value) {
  const settings = getSettings();
  settings[key] = value;
  setSettings(settings);
  return settings;
}

function toggleLenient() {
  const settings = getSettings();
  settings.lenient = !settings.lenient;
  setSettings(settings);
  return settings;
}

function renderSettingsButtons() {
  const lenientBtn = document.getElementById("settingsLenient");
  if (!lenientBtn) return;

  const settings = getSettings();
  lenientBtn.textContent = `Lenient: ${settings.lenient ? "ON" : "OFF"}`;
}

function openSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (!overlay) return;

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  renderSettingsButtons();

  if (typeof logEvent === "function") {
    logEvent("settings_open");
  }
}

function closeSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (!overlay) return;

  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");

  if (typeof logEvent === "function") {
    logEvent("settings_close");
  }
}

function wireSettingsUI() {
  const overlay = document.getElementById("settingsOverlay");
  const openBtn = document.getElementById("openSettings");
  const closeBtn = document.getElementById("settingsClose");
  const analyticsBtn = document.getElementById("settingsAnalytics");
  const resetBtn = document.getElementById("settingsReset");
  const lenientBtn = document.getElementById("settingsLenient");

  if (openBtn) {
    openBtn.onclick = openSettings;
  }

  if (closeBtn) {
    closeBtn.onclick = closeSettings;
  }

  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target.id === "settingsOverlay") {
        closeSettings();
      }
    };
  }

  if (analyticsBtn) {
    analyticsBtn.onclick = () => {
      window.open("analytics.html", "_blank");

      if (typeof logEvent === "function") {
        logEvent("open_analytics");
      }

      closeSettings();
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (!confirm("Reset stars, streak, and progress?")) return;

      if (typeof resetProgress === "function") {
        resetProgress();
      } else {
        removeJSON(STORAGE_KEYS.progress);
      }

      if (typeof renderProgress === "function") {
        renderProgress();
      }

      if (typeof logEvent === "function") {
        logEvent("settings_reset_progress");
      }
    };
  }

  if (lenientBtn) {
    lenientBtn.onclick = () => {
      toggleLenient();
      renderSettingsButtons();
    };
  }

  renderSettingsButtons();
}
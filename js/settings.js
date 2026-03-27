const DEFAULT_SETTINGS = {
  lenient: false,
  parentPin: "0000",
  parentLockEnabled: true
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

function isParentPinCorrect(pin) {
  const settings = getSettings();
  return String(pin || "") === String(settings.parentPin || "0000");
}

function isParentLockEnabled() {
  const settings = getSettings();
  return settings.parentLockEnabled !== false;
}

function openUnlockedSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (!overlay) return;

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  renderSettingsButtons();

  if (typeof logEvent === "function") {
    logEvent("settings_open");
  }
}

function openSettings() {
  const lockOverlay = document.getElementById("parentPinOverlay");
  const pinInput = document.getElementById("parentPinInput");
  const pinError = document.getElementById("parentPinError");

  if (!isParentLockEnabled()) {
    openUnlockedSettings();
    return;
  }

  if (!lockOverlay) return;

  lockOverlay.classList.add("active");
  lockOverlay.setAttribute("aria-hidden", "false");

  if (pinInput) {
    pinInput.value = "";
    pinInput.focus();
  }

  if (pinError) {
    pinError.textContent = "";
  }

  if (typeof logEvent === "function") {
    logEvent("parent_pin_prompt_open");
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

function closeParentPin() {
  const lockOverlay = document.getElementById("parentPinOverlay");
  if (!lockOverlay) return;

  lockOverlay.classList.remove("active");
  lockOverlay.setAttribute("aria-hidden", "true");
}

function submitParentPin() {
  const pinInput = document.getElementById("parentPinInput");
  const pinError = document.getElementById("parentPinError");
  const entered = pinInput ? pinInput.value.trim() : "";

  if (isParentPinCorrect(entered)) {
    closeParentPin();
    openUnlockedSettings();

    if (typeof logEvent === "function") {
      logEvent("parent_pin_success");
    }
    return;
  }

  if (pinError) {
    pinError.textContent = "Wrong PIN";
  }

  if (pinInput) {
    pinInput.value = "";
    pinInput.focus();
  }

  if (typeof logEvent === "function") {
    logEvent("parent_pin_failed");
  }
}

function wireSettingsUI() {
  const overlay = document.getElementById("settingsOverlay");
  const openBtn = document.getElementById("openSettings");
  const closeBtn = document.getElementById("settingsClose");
  const analyticsBtn = document.getElementById("settingsAnalytics");
  const resetBtn = document.getElementById("settingsReset");
  const lenientBtn = document.getElementById("settingsLenient");

  const childNameBtn = document.getElementById("settingsChildName");
  const childNameEditor = document.getElementById("childNameEditor");
  const childNameInput = document.getElementById("childNameInput");
  const childNameSave = document.getElementById("childNameSave");
  const childNameCancel = document.getElementById("childNameCancel");

  const pinOverlay = document.getElementById("parentPinOverlay");
  const pinInput = document.getElementById("parentPinInput");
  const pinSubmit = document.getElementById("parentPinSubmit");
  const pinCancel = document.getElementById("parentPinCancel");

  function getProfileForSettings() {
    return loadJSON(STORAGE_KEYS.profile, {
      displayName: "Name",
      childName: ""
    });
  }

  function setProfileForSettings(profile) {
    saveJSON(STORAGE_KEYS.profile, profile);

    if (typeof renderAvatarBadge === "function") {
      renderAvatarBadge();
    }
  }

  function openChildNameEditor() {
    const profile = getProfileForSettings();
    if (childNameInput) {
      childNameInput.value = profile.childName || profile.displayName || "";
      childNameInput.focus();
      childNameInput.select();
    }
    if (childNameEditor) childNameEditor.classList.remove("hidden");
  }

  function closeChildNameEditor() {
    if (childNameEditor) childNameEditor.classList.add("hidden");
  }

  function saveChildName() {
    const raw = childNameInput ? childNameInput.value : "";
    const clean = raw.trim();

    const profile = getProfileForSettings();
    profile.childName = clean || "Addy";
    setProfileForSettings(profile);

    if (typeof logEvent === "function") {
      logEvent("child_name_updated", { childName: profile.childName });
    }

    closeChildNameEditor();
  }

  if (openBtn) openBtn.onclick = openSettings;
  if (closeBtn) closeBtn.onclick = closeSettings;

  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target.id === "settingsOverlay") {
        closeSettings();
        closeChildNameEditor();
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

  if (childNameBtn) childNameBtn.onclick = openChildNameEditor;
  if (childNameSave) childNameSave.onclick = saveChildName;
  if (childNameCancel) childNameCancel.onclick = closeChildNameEditor;

  if (childNameInput) {
    childNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveChildName();
    });
  }

  if (pinSubmit) pinSubmit.onclick = submitParentPin;
  if (pinCancel) pinCancel.onclick = closeParentPin;

  if (pinOverlay) {
    pinOverlay.onclick = (e) => {
      if (e.target.id === "parentPinOverlay") {
        closeParentPin();
      }
    };
  }

  if (pinInput) {
    pinInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitParentPin();
    });
  }

  renderSettingsButtons();
}
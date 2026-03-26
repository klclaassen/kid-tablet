const STORAGE_KEYS = {
  progress: "addy_ws_progress_v1",
  events: "addy_ws_events_v1",
  settings: "addy_ws_settings_v1",
  avatar: "addy_avatar_shop_v1",
  shop: "addy_ws_shop_v1",
  profile: "addy_profile_v1"
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : deepClone(fallback);
  } catch {
    return deepClone(fallback);
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeJSON(key) {
  localStorage.removeItem(key);
}

function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(removeJSON);
}
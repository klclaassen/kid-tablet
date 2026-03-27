function analyticsNowISO() {
  return new Date().toISOString();
}

function getEvents() {
  return loadJSON(STORAGE_KEYS.events, []);
}

function setEvents(events) {
  saveJSON(STORAGE_KEYS.events, events);
}

function logEvent(type, data = {}) {
  const events = getEvents();

  events.push({
    t: analyticsNowISO(),
    type,
    ...data
  });

  if (events.length > 3000) {
    events.splice(0, events.length - 3000);
  }

  setEvents(events);
}

function clearEvents() {
  removeJSON(STORAGE_KEYS.events);
}

function logScreenView(screen) {
  logEvent("screen_view", { screen });
}

function logSessionStart(extra = {}) {
  logEvent("session_start", {
    ua: navigator.userAgent,
    ...extra
  });
}
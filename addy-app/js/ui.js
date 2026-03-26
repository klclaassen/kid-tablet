function injectTopBar() {
  if (document.getElementById("starsCount") || document.getElementById("clockTime")) {
    return;
  }

  const top = document.createElement("div");

  top.innerHTML = `
    <div class="badge progress-badge">
      <div class="badge-big" id="starsCount">⭐ 0</div>
      <div class="badge-sub" id="streakLabel">streak: 0 days</div>
    </div>

    <div class="badge clock-badge">
      <div class="badge-big" id="clockTime">--:--</div>
    </div>

    <div class="badge avatar-badge" id="avatarBadge">
      <div class="avatar-mini" id="avatarBadgeMini">😊</div>
      <div class="avatar-label" id="avatarBadgeLabel">Name</div>
    </div>
  `;

  document.body.prepend(top);

  const avatarBadge = document.getElementById("avatarBadge");
  if (avatarBadge) {
    avatarBadge.onclick = () => {
      window.location.href = "avatar.html";
    };
  }
}

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();

  let dh = h % 12;
  if (dh === 0) dh = 12;

  const el = document.getElementById("clockTime");
  if (el) {
    el.textContent = dh + ":" + String(m).padStart(2, "0");
  }
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function renderAvatarBadge() {
  const avatar = loadJSON(STORAGE_KEYS.avatar, {
    equipped: { hat: null },
    appearance: { expression: "happy" }
  });

  const profile = loadJSON(STORAGE_KEYS.profile, {
    displayName: "Name"
  });

  const expressionIcons = {
    happy: "😊",
    silly: "😜",
    wow: "😮",
    mad: "😠",
    sad: "😢",
    excited: "🤩"
  };

  const hatIcons = {
    hat_frog: "🐸",
    hat_crown: "👑",
    hat_space: "🚀",
    hat_top: "🎩",
    hat_squid: "🦑"
  };

  const expression = avatar?.appearance?.expression || "happy";
  const hat = avatar?.equipped?.hat || null;
  const icon = expressionIcons[expression] || hatIcons[hat] || "🧒";
  const name = profile?.displayName?.trim() || "Name";

  const miniEl = document.getElementById("avatarBadgeMini");
  const labelEl = document.getElementById("avatarBadgeLabel");

  if (miniEl) {
    miniEl.textContent = icon;
  }

  if (labelEl) {
    labelEl.textContent = name;
  }
}

function bootUI() {
  injectTopBar();
  renderAvatarBadge();
  startClock();
}

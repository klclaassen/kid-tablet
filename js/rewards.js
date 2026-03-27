const DEFAULT_PROGRESS = {
  stars: 0,
byModeStars: {
  letters: 0,
  numbers: 0,
  name: 0,
  reading: 0,
  shapes: 0,
  patterns: 0,
  challenges: 0
},
byModeSuccess: {
  letters: 0,
  numbers: 0,
  name: 0,
  reading: 0,
  shapes: 0,
  patterns: 0,
  challenges: 0
},
byModeRewards: {
  letters: 0,
  numbers: 0,
  name: 0,
  reading: 0,
  shapes: 0,
  patterns: 0,
  challenges: 0
},
  lastStarDay: null,
  streakDays: 0
};

function rewardTodayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getProgress() {
  return loadJSON(STORAGE_KEYS.progress, DEFAULT_PROGRESS);
}

function setProgress(progress) {
  saveJSON(STORAGE_KEYS.progress, progress);
  renderProgress();
}

function renderProgress() {
  const p = getProgress();

  const starsEl = document.getElementById("starsCount");
  const streakEl = document.getElementById("streakLabel");

  if (starsEl) {
    starsEl.textContent = `⭐ ${p.stars}`;
  }

  if (streakEl) {
    streakEl.textContent = `streak: ${p.streakDays} days`;
  }
}

function addStar(mode) {
  const p = getProgress();

  p.stars += 1;

  if (p.byModeStars[mode] !== undefined) {
    p.byModeStars[mode] += 1;
  }

  const today = rewardTodayKey();

  if (p.lastStarDay !== today) {
    if (p.lastStarDay) {
      const last = new Date(p.lastStarDay + "T00:00:00");
      const now = new Date(today + "T00:00:00");
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
      p.streakDays = diffDays === 1 ? p.streakDays + 1 : 1;
    } else {
      p.streakDays = 1;
    }

    p.lastStarDay = today;
  }

  setProgress(p);

  if (typeof logEvent === "function") {
    logEvent("star_awarded", { mode });
  }
}

function showRewardOverlay({ emoji, title, sub }) {
  const overlay = document.getElementById("rewardOverlay");
  const emojiEl = document.getElementById("rewardEmoji");
  const titleEl = document.getElementById("rewardTitle");
  const subEl = document.getElementById("rewardSub");

  if (!overlay || !emojiEl || !titleEl || !subEl) return;

  emojiEl.textContent = emoji;
  titleEl.textContent = title;
  subEl.textContent = sub;

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function hideRewardOverlay() {
  const overlay = document.getElementById("rewardOverlay");
  if (!overlay) return;

  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
}

function awardSuccess(mode) {
  const p = getProgress();

  p.byModeSuccess[mode] = (p.byModeSuccess[mode] || 0) + 1;
  const successCount = p.byModeSuccess[mode];

  setProgress(p);

  if (typeof logEvent === "function") {
    logEvent("success_recorded", { mode, successCount });
  }

  if (successCount % 5 === 0) {
    addStar(mode);

    const refreshed = getProgress();
    if (refreshed.byModeRewards[mode] !== undefined) {
      refreshed.byModeRewards[mode] = (refreshed.byModeRewards[mode] || 0) + 1;
      setProgress(refreshed);
    }

    showRewardOverlay({
      emoji: "⭐",
      title: "You got a star!",
      sub: `That’s ${successCount} in ${mode}!`
    });

    if (typeof logEvent === "function") {
      logEvent("milestone_star_awarded", { mode, successCount });
    }
  }
}

function resetProgress() {
  removeJSON(STORAGE_KEYS.progress);
  renderProgress();

  if (typeof logEvent === "function") {
    logEvent("progress_reset");
  }
}

function wireRewardOverlayClose() {
  const closeBtn = document.getElementById("rewardClose");
  const overlay = document.getElementById("rewardOverlay");

  if (closeBtn) {
    closeBtn.onclick = hideRewardOverlay;
  }

  if (overlay) {
    overlay.onclick = (e) => {
      if (e.target.id === "rewardOverlay") {
        hideRewardOverlay();
      }
    };
  }
}
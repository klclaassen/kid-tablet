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

/***************
 * TIME TRACKING
 ***************/
let currentScreen = null;
let screenStartTime = null;

function logScreenView(screen) {
  const now = Date.now();

  if (currentScreen && screenStartTime) {
    const duration = now - screenStartTime;

    logEvent("time_spent", {
      screen: currentScreen,
      ms: duration
    });
  }

  currentScreen = screen;
  screenStartTime = now;

  logEvent("screen_view", { screen });
}

/***************
 * ANALYTICS ENGINE
 ***************/
function computeAnalytics() {
  const events = getEvents();

  const timeByMode = {};
  const attemptsByMode = {};
  const successByMode = {};

  events.forEach(e => {
    // TIME
    if (e.type === "time_spent" && e.screen) {
      timeByMode[e.screen] = (timeByMode[e.screen] || 0) + (e.ms || 0);
    }

    // PERFORMANCE
    if (e.type === "done_pressed" || e.type === "challenge_checked" || e.type === "reading_checked") {
      const mode = e.mode || e.challengeType || e.type;

      attemptsByMode[mode] = (attemptsByMode[mode] || 0) + 1;

      if (e.passed === true) {
        successByMode[mode] = (successByMode[mode] || 0) + 1;
      }
    }
  });

  const accuracyByMode = {};
  Object.keys(attemptsByMode).forEach(mode => {
    const attempts = attemptsByMode[mode] || 1;
    const success = successByMode[mode] || 0;
    accuracyByMode[mode] = Math.round((success / attempts) * 100);
  });

  return {
    timeByMode,
    attemptsByMode,
    successByMode,
    accuracyByMode
  };
}

/***************
 * TROPHY LOGIC
 ***************/

function getSafeSkills() {
  return getSkills ? getSkills() : {
    reading: { level: 1, correct: 0, wrong: 0 },
    challenges: { level: 1, correct: 0, wrong: 0 },
    shapes: { level: 1, correct: 0, wrong: 0 },
    patterns: { level: 1, correct: 0, wrong: 0 }
  };
}

function computeTrophyStats() {
  const progress = getProgress();
  const events = getEvents();
  const skills = getSafeSkills();
  const analytics = computeAnalytics();

  const totalTimeMs = Object.values(analytics.timeByMode || {})
    .reduce((a, b) => a + b, 0);

  const modeTime = analytics.timeByMode || {};
  const accuracy = analytics.accuracyByMode || {};

  const favoriteActivity = Object.entries(modeTime)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "letters";

  const milestones = [
    {
      id: "first_star",
      title: "First Star",
      earned: (progress.stars || 0) >= 1
    },
    {
      id: "ten_stars",
      title: "10 Stars Earned",
      earned: (progress.stars || 0) >= 10
    },
    {
      id: "twentyfive_stars",
      title: "25 Stars Earned",
      earned: (progress.stars || 0) >= 25
    },
    {
      id: "reading_l2",
      title: "Reading Level 2",
      earned: (skills.reading?.level || 1) >= 2
    },
    {
      id: "reading_l3",
      title: "Reading Level 3",
      earned: (skills.reading?.level || 1) >= 3
    },
    {
      id: "shapes_l2",
      title: "Shapes Level 2",
      earned: (skills.shapes?.level || 1) >= 2
    },
    {
      id: "patterns_l2",
      title: "Patterns Level 2",
      earned: (skills.patterns?.level || 1) >= 2
    },
    {
      id: "challenges_l2",
      title: "Challenges Level 2",
      earned: (skills.challenges?.level || 1) >= 2
    },
    {
      id: "ten_minutes",
      title: "10 Minutes of Learning",
      earned: totalTimeMs >= 10 * 60 * 1000
    },
    {
      id: "one_hour",
      title: "1 Hour of Learning",
      earned: totalTimeMs >= 60 * 60 * 1000
    },
    {
      id: "all_modes",
      title: "Tried Every Main Activity",
      earned: ["letters", "numbers", "name", "reading", "shapes", "patterns", "challenges"]
        .every(mode => (modeTime[mode] || 0) > 0)
    },
    {
      id: "three_day_streak",
      title: "3 Day Streak",
      earned: (progress.streakDays || 0) >= 3
    },
    {
      id: "seven_day_streak",
      title: "7 Day Streak",
      earned: (progress.streakDays || 0) >= 7
    }
  ];

  return {
    progress,
    events,
    skills,
    analytics,
    totalTimeMs,
    favoriteActivity,
    milestones,
    accuracy,
    modeTime
  };
}

function recommendNextActivity() {
  const stats = computeTrophyStats();
  const { skills, accuracy, modeTime } = stats;

  const candidates = [
    {
      mode: "reading",
      score: (100 - (accuracy.reading || 0)) + ((skills.reading?.level || 1) * 8) - ((modeTime.reading || 0) / 60000),
      reason: "Reading has room to grow and helps build decoding."
    },
    {
      mode: "shapes",
      score: (100 - (accuracy.shapes || 0)) + ((3 - (skills.shapes?.level || 1)) * 15) - ((modeTime.shapes || 0) / 60000),
      reason: "Shapes can build confidence and tracing control."
    },
    {
      mode: "patterns",
      score: (100 - (accuracy.patterns || 0)) + ((3 - (skills.patterns?.level || 1)) * 15) - ((modeTime.patterns || 0) / 60000),
      reason: "Patterns help sequencing and early math thinking."
    },
    {
      mode: "challenges",
      score: (100 - (accuracy.challenges || 0)) + ((4 - (skills.challenges?.level || 1)) * 12) - ((modeTime.challenges || 0) / 60000),
      reason: "Challenge Cards mix skills and level up flexibility."
    }
  ];

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function formatTimePretty(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

function renderTrophyRoom() {
  const stats = computeTrophyStats();
  const rec = recommendNextActivity();

  const recommendationEl = document.getElementById("trophyRecommendation");
  const milestonesEl = document.getElementById("trophyMilestones");
  const snapshotEl = document.getElementById("trophySnapshot");

  if (recommendationEl) {
    recommendationEl.innerHTML = `
      <div style="font-size:24px; font-weight:900; margin-bottom:6px;">
        Next up: ${rec.mode}
      </div>
      <div class="muted">${rec.reason}</div>
    `;
  }

  if (milestonesEl) {
    milestonesEl.innerHTML = stats.milestones.map(m => `
      <div style="
        padding:10px 12px;
        margin-bottom:8px;
        border-radius:14px;
        background:${m.earned ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)"};
        font-weight:800;
      ">
        ${m.earned ? "🏆" : "🔒"} ${m.title}
      </div>
    `).join("");
  }

  if (snapshotEl) {
    snapshotEl.innerHTML = `
      <div class="muted">Favorite activity: <strong>${stats.favoriteActivity}</strong></div>
      <div class="muted">Total learning time: <strong>${formatTimePretty(stats.totalTimeMs)}</strong></div>
      <div class="muted">Reading level: <strong>${stats.skills.reading?.level ?? 1}</strong></div>
      <div class="muted">Challenges level: <strong>${stats.skills.challenges?.level ?? 1}</strong></div>
      <div class="muted">Shapes level: <strong>${stats.skills.shapes?.level ?? 1}</strong></div>
      <div class="muted">Patterns level: <strong>${stats.skills.patterns?.level ?? 1}</strong></div>
    `;
  }
}


/***************
 * HELPERS
 ***************/
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
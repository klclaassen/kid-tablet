const STORAGE_KEYS = {
  progress: "addy_ws_progress_v1",
  events: "addy_ws_events_v1",
  settings: "addy_ws_settings_v1",
  avatar: "addy_avatar_shop_v1",
  shop: "addy_ws_shop_v1",
  profile: "addy_profile_v1",
  skills: "addy_skills_v1"
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

function getSkills() {
  return loadJSON(STORAGE_KEYS.skills, {
    reading: { level: 1, streak: 0, wrongStreak: 0, correct: 0, wrong: 0 },
    challenges: { level: 1, streak: 0, wrongStreak: 0, correct: 0, wrong: 0 },
    letters: { level: 1, streak: 0, wrongStreak: 0, correct: 0, wrong: 0 },
    numbers: { level: 1, streak: 0, wrongStreak: 0, correct: 0, wrong: 0 }
  });
}

function setSkills(skills) {
  saveJSON(STORAGE_KEYS.skills, skills);
}

function getSkill(mode) {
  const skills = getSkills();
  if (!skills[mode]) {
    skills[mode] = { level: 1, streak: 0, wrongStreak: 0, correct: 0, wrong: 0 };
    setSkills(skills);
  }
  return skills[mode];
}

function recordSkillResult(mode, passed, maxLevel = 4) {
  const skills = getSkills();
  const skill = skills[mode] || {
    level: 1,
    streak: 0,
    wrongStreak: 0,
    correct: 0,
    wrong: 0
  };

  if (passed) {
    skill.correct += 1;
    skill.streak += 1;
    skill.wrongStreak = 0;

    if (skill.streak >= 3 && skill.level < maxLevel) {
      skill.level += 1;
      skill.streak = 0;
    }
  } else {
    skill.wrong += 1;
    skill.wrongStreak += 1;
    skill.streak = 0;

    if (skill.wrongStreak >= 2 && skill.level > 1) {
      skill.level -= 1;
      skill.wrongStreak = 0;
    }
  }

  skills[mode] = skill;
  setSkills(skills);
  return skill;
}


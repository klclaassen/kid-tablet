const AVATAR_ITEMS = [
  { id: "shirt_rainbow", type: "shirt", name: "Rainbow Shirt", cost: 5, icon: "🌈" },
  { id: "shirt_dino", type: "shirt", name: "Dino Shirt", cost: 5, icon: "🦖" },
  { id: "shirt_octo", type: "shirt", name: "Octopus Shirt", cost: 5, icon: "🐙" },
  { id: "shirt_heart", type: "shirt", name: "Heart Shirt", cost: 5, icon: "❤️" },
  { id: "shirt_web", type: "shirt", name: "Web Shirt", cost: 5, icon: "🕸️" },

  { id: "hat_frog", type: "hat", name: "Frog Hat", cost: 4, icon: "🐸" },
  { id: "hat_crown", type: "hat", name: "Crown", cost: 4, icon: "👑" },
  { id: "hat_top", type: "hat", name: "Top Hat", cost: 4, icon: "🎩" },
  { id: "hat_squid", type: "hat", name: "Squid Hat", cost: 4, icon: "🦑" },

  { id: "acc_glasses", type: "accessory", name: "Star Glasses", cost: 4, icon: "🕶️", placement: "face", equipSlot: "faceAccessory" },
  { id: "acc_wings", type: "accessory", name: "Angel Wings", cost: 6, icon: "🪽", placement: "back", equipSlot: "backAccessory", variant: "double-wing" },
  { id: "acc_wand", type: "accessory", name: "Magic Wand", cost: 4, icon: "🪄", placement: "hand", equipSlot: "handAccessory" },
  { id: "acc_pizza", type: "accessory", name: "Pizza Slice", cost: 4, icon: "🍕", placement: "hand", equipSlot: "handAccessory" },
  { id: "acc_controller", type: "accessory", name: "Game Controller", cost: 4, icon: "🎮", placement: "hand", equipSlot: "handAccessory" },

  { id: "buddy_cat", type: "buddy", name: "Kitty Buddy", cost: 6, icon: "🐈" },
  { id: "buddy_dog", type: "buddy", name: "Dog Buddy", cost: 6, icon: "🐕" },
  { id: "buddy_turtle", type: "buddy", name: "Turtle Buddy", cost: 6, icon: "🐢" },
  { id: "buddy_snake", type: "buddy", name: "Snake Buddy", cost: 6, icon: "🐍" },
  { id: "buddy_alien", type: "buddy", name: "Alien Buddy", cost: 6, icon: "👾" },
  { id: "buddy_snowman", type: "buddy", name: "Snowman Buddy", cost: 6, icon: "⛄" }
];

const AVATAR_TYPES = [
  { key: "shirt", label: "👕 Shirt Designs" },
  { key: "hat", label: "🎩 Hats" },
  { key: "accessory", label: "🕶️ Accessories" },
  { key: "buddy", label: "🐢 Buddies" }
];

const STYLE_MODES = [
  { key: "body", label: "Body" },
  { key: "clothes", label: "Clothes" }
];

const APPEARANCE_OPTIONS = {
  outfitType: [
    { id: "tshirt", label: "T-Shirt", emoji: "👕" },
    { id: "hoodie", label: "Hoodie", emoji: "🧥" }
  ],
  hairStyle: [
    { id: "round", label: "Short" },
    { id: "long", label: "Long" }
  ],
  hairColor: [
    { id: "brown", label: "Brown", value: "#6b442a" },
    { id: "black", label: "Black", value: "#2b2530" },
    { id: "blonde", label: "Blonde", value: "#d8b35a" },
    { id: "red", label: "Red", value: "#b85a3c" },
    { id: "purple", label: "Purple", value: "#8d67d7" },
    { id: "teal", label: "Teal", value: "#2b9aa0" }
  ],
  skinTone: [
    { id: "fair", label: "Fair", value: "#ffd9b8" },
    { id: "peach", label: "Peach", value: "#f3c6a0" },
    { id: "tan", label: "Tan", value: "#d79c6b" },
    { id: "brown", label: "Brown", value: "#a86d44" },
    { id: "deep", label: "Deep", value: "#6f4326" }
  ],
  pantsColor: [
    { id: "charcoal", label: "Black", value: "#2c2a34" },
    { id: "brown", label: "Gray", value: "#838282" },
    { id: "blue", label: "Blue", value: "#3974d9" },
    { id: "green", label: "Green", value: "#31915a" },
    { id: "purple", label: "Purple", value: "#7e57c2" }
  ],
  expression: [
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "silly", label: "Silly", emoji: "😜" },
    { id: "wow", label: "Wow", emoji: "😮" },
    { id: "mad", label: "Mad", emoji: "😠" },
    { id: "sad", label: "Sad", emoji: "😢" },
    { id: "excited", label: "Excited", emoji: "🤩" }
  ],
  topColor: [
    { id: "blue", label: "Blue", value: "#81d4fa", pocket: "#5fb7df" },
    { id: "black", label: "Black", value: "#2b2530", pocket: "#5a5560" },
    { id: "red", label: "Red", value: "#d95c5c", pocket: "#b84a4a" },
    { id: "green", label: "Green", value: "#66bb6a", pocket: "#4f9f54" },
    { id: "purple", label: "Purple", value: "#8d67d7", pocket: "#7150b4" },
    { id: "yellow", label: "Yellow", value: "#ffd54f", pocket: "#d9b63f" }
  ]
};

const DEFAULT_AVATAR_STATE = {
  owned: {
    shirt_rainbow: true,
    hat_frog: true,
    acc_glasses: true
  },
  equipped: {
    shirt: "shirt_rainbow",
    hat: "hat_frog",
    faceAccessory: "acc_glasses",
    backAccessory: null,
    handAccessory: null,
    buddy: null
  },
  appearance: {
    outfitType: "tshirt",
    topColor: "blue",
    hairStyle: "round",
    hairColor: "brown",
    skinTone: "fair",
    pantsColor: "charcoal",
    expression: "happy"
  }
};

const DEFAULT_PROFILE = {
  displayName: "Name"
};

function getOptionValue(group, id) {
  return APPEARANCE_OPTIONS[group].find(option => option.id === id) || APPEARANCE_OPTIONS[group][0];
}

function getAvatarState() {
  const parsed = loadJSON(STORAGE_KEYS.avatar, DEFAULT_AVATAR_STATE);

  return {
    owned: { ...DEFAULT_AVATAR_STATE.owned, ...(parsed.owned || {}) },
    equipped: { ...DEFAULT_AVATAR_STATE.equipped, ...(parsed.equipped || {}) },
    appearance: { ...DEFAULT_AVATAR_STATE.appearance, ...(parsed.appearance || {}) }
  };
}

function updateEyesTowardPoint(clientX, clientY) {
  const eyes = document.querySelectorAll(".avatarPreview .eye, #avatarPreviewHome .eye, #avatarPreviewStyle .eye, #avatarPreviewCloset .eye");

  eyes.forEach(eye => {
    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const dx = clientX - eyeCenterX;
    const dy = clientY - eyeCenterY;

    const distance = Math.hypot(dx, dy) || 1;
    const maxMove = 3;

    const moveX = (dx / distance) * maxMove;
    const moveY = (dy / distance) * maxMove;

    eye.style.setProperty("--pupil-x", `${moveX}px`);
    eye.style.setProperty("--pupil-y", `${moveY}px`);
  });
}

function resetEyes() {
  document.querySelectorAll(".eye").forEach(eye => {
    eye.style.setProperty("--pupil-x", "0px");
    eye.style.setProperty("--pupil-y", "0px");
  });
}

function setAvatarState(nextState) {
  saveJSON(STORAGE_KEYS.avatar, nextState);

  if (typeof renderAvatarBadge === "function") {
    renderAvatarBadge();
  }
}

function getProfile() {
  return loadJSON(STORAGE_KEYS.profile, DEFAULT_PROFILE);
}

function setProfile(profile) {
  saveJSON(STORAGE_KEYS.profile, profile);

  if (typeof renderAvatarBadge === "function") {
    renderAvatarBadge();
  }
}

function getAvatarItem(id) {
  return AVATAR_ITEMS.find(item => item.id === id) || null;
}

function getStarCount() {
  if (typeof getProgress === "function") {
    return getProgress().stars || 0;
  }
  return 0;
}

function setStarCount(newCount) {
  if (typeof getProgress !== "function" || typeof setProgress !== "function") return;

  const progress = getProgress();
  progress.stars = Math.max(0, Number(newCount || 0));
  setProgress(progress);
}

let state = getAvatarState();
let closetFilter = "shirt";
let styleMode = "body";

function ownedItems() {
  return AVATAR_ITEMS.filter(item => state.owned[item.id]);
}

function itemForSlot(slot) {
  return getAvatarItem(state.equipped[slot]);
}

function getEquipSlot(item) {
  return item?.equipSlot || item?.type || null;
}

function isItemEquipped(item) {
  const slot = getEquipSlot(item);
  return !!slot && state.equipped[slot] === item.id;
}

function displayLookText() {
  const parts = [];
  const slots = ["shirt", "hat", "faceAccessory", "backAccessory", "handAccessory", "buddy"];

  slots.forEach(slot => {
    const item = itemForSlot(slot);
    if (item) parts.push(item.name);
  });

  return parts.length ? parts.join(" • ") : "Nothing equipped yet";
}

function createFaceHTML(expressionId) {
  switch (expressionId) {
    case "silly":
      return `
        <div class="eye left wink"></div>
        <div class="eye right"></div>
        <div class="mouth silly"></div>
      `;
    case "wow":
      return `
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="mouth wow"></div>
      `;
    case "mad":
      return `
        <div class="eye left mad"></div>
        <div class="eye right mad"></div>
        <div class="mouth mad"></div>
      `;
    case "sad":
      return `
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="mouth sad"></div>
      `;
    case "excited":
      return `
        <div class="eye left excited"></div>
        <div class="eye right excited"></div>
        <div class="mouth excited"></div>
      `;
    case "happy":
    default:
      return `
        <div class="eye left happy"></div>
        <div class="eye right happy"></div>
        <div class="mouth happy"></div>
      `;
  }
}

function renderAccessoryHTML(accessory) {
  if (!accessory) {
    return "";
  }

  if (accessory.variant === "double-wing") {
    return `
      <div class="avatarAccessory avatarAccessory-${accessory.placement} avatarAccessory-${accessory.id}">
        <span class="wing left">${accessory.icon}</span>
        <span class="wing right">${accessory.icon}</span>
      </div>
    `;
  }

  return `
    <div class="avatarAccessory avatarAccessory-${accessory.placement} avatarAccessory-${accessory.id}">
      ${accessory.icon}
    </div>
  `;
}

function createAvatarHTML() {
  const shirt = itemForSlot("shirt");
  const hat = itemForSlot("hat");
  const faceAccessory = itemForSlot("faceAccessory");
  const backAccessory = itemForSlot("backAccessory");
  const handAccessory = itemForSlot("handAccessory");
  const buddy = itemForSlot("buddy");

  const hairColor = getOptionValue("hairColor", state.appearance.hairColor).value;
  const skinTone = getOptionValue("skinTone", state.appearance.skinTone).value;
  const pantsColor = getOptionValue("pantsColor", state.appearance.pantsColor).value;
  const expression = state.appearance.expression;
  const hairStyle = state.appearance.hairStyle;
  const outfitType = state.appearance.outfitType || "tshirt";

  const topColorOption = getOptionValue("topColor", state.appearance.topColor);
  const topColor = topColorOption.value;
  const pocketColor = topColorOption.pocket;

  return `
    ${renderAccessoryHTML(backAccessory)}
    <div class="avatarBase avatarHair-${hairStyle}" style="--hair-color:${hairColor}; --skin-tone:${skinTone}; --pants-color:${pantsColor}; --eye-color:#2c2a34;">
      <div class="hair"></div>
      <div class="head">
        ${createFaceHTML(expression)}
      </div>

      <div class="arm left"></div>
      <div class="arm right"></div>

      <div class="body"></div>
      <div class="avatarOutfit avatarOutfit-${outfitType}" style="--top-color:${topColor}; --pocket-color:${pocketColor};">
        <div class="outfitTorso"></div>
        <div class="outfitSleeve left"></div>
        <div class="outfitSleeve right"></div>
        ${outfitType === "hoodie" ? `<div class="hoodiePocket"></div>` : ""}
      </div>

      <div class="leg left"></div>
      <div class="leg right"></div>
      <div class="shoe left"></div>
      <div class="shoe right"></div>
    </div>
    <div class="avatarShirt">${shirt ? shirt.icon : ""}</div>
    <div class="avatarHat">${hat ? hat.icon : ""}</div>
    ${renderAccessoryHTML(faceAccessory)}
    ${renderAccessoryHTML(handAccessory)}
    <div class="avatarBuddy">${buddy ? buddy.icon : ""}</div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const views = {
    home: document.getElementById("homeView"),
    style: document.getElementById("styleView"),
    closet: document.getElementById("closetView")
  };

  const starPill = document.getElementById("starPill");
  const starsBig = document.getElementById("starsBig");
  const ownedBig = document.getElementById("ownedBig");
  const lookBig = document.getElementById("lookBig");
  const currentLookText = document.getElementById("currentLookText");
  const avatarMini = document.getElementById("avatarMini");

  const closetTabs = document.getElementById("closetTabs");
  const closetGrid = document.getElementById("closetGrid");
  const avatarPreviewHome = document.getElementById("avatarPreviewHome");
  const avatarPreviewStyle = document.getElementById("avatarPreviewStyle");
  const avatarPreviewCloset = document.getElementById("avatarPreviewCloset");

  const styleModeTabs = document.getElementById("styleModeTabs");
  const styleBodyPanel = document.getElementById("styleBodyPanel");
  const styleClothesPanel = document.getElementById("styleClothesPanel");

  const outfitTypeChoices = document.getElementById("outfitTypeChoices");
  const topColorChoices = document.getElementById("topColorChoices");
  const hairStyleChoices = document.getElementById("hairStyleChoices");
  const hairColorChoices = document.getElementById("hairColorChoices");
  const skinColorChoices = document.getElementById("skinColorChoices");
  const pantsColorChoices = document.getElementById("pantsColorChoices");
  const expressionChoices = document.getElementById("expressionChoices");

  const avatarDisplayName = document.getElementById("avatarDisplayName");
  const editNameBtn = document.getElementById("editNameBtn");
  const nameEditor = document.getElementById("nameEditor");
  const avatarNameInput = document.getElementById("avatarNameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const cancelNameBtn = document.getElementById("cancelNameBtn");

  function renderProfile() {
    const profile = getProfile();
    const name = profile.displayName || "Name";

    if (avatarDisplayName) avatarDisplayName.textContent = name;
    if (avatarNameInput) avatarNameInput.value = name === "Name" ? "" : name;
  }

  function openNameEditor() {
    renderProfile();
    if (nameEditor) nameEditor.classList.remove("hidden");
    if (avatarNameInput) {
      avatarNameInput.focus();
      avatarNameInput.select();
    }
  }

  function closeNameEditor() {
    if (nameEditor) nameEditor.classList.add("hidden");
  }

  function saveProfileName() {
    const raw = avatarNameInput ? avatarNameInput.value : "";
    const clean = raw.trim();

    const profile = getProfile();
    profile.displayName = clean || "Name";
    setProfile(profile);

    if (typeof logEvent === "function") {
      logEvent("avatar_name_updated", { displayName: profile.displayName });
    }

    renderProfile();
    closeNameEditor();
  }

  function saveAndRender() {
    setAvatarState(state);
    render();
  }

function go(viewName) {
  Object.values(views).forEach(v => v && v.classList.remove("active"));
  if (views[viewName]) views[viewName].classList.add("active");

  const appEl = document.querySelector(".app");
  if (appEl) {
    appEl.classList.toggle("hideTopBar", viewName === "closet" || viewName === "style");
  }

  render();
}

  function spend(cost) {
    const stars = getStarCount();
    if (stars < cost) return false;
    setStarCount(stars - cost);
    return true;
  }

  function buyItem(id) {
    const item = getAvatarItem(id);
    if (!item || state.owned[id]) return;

    if (!spend(item.cost)) {
      alert("Not enough stars yet ⭐");
      return;
    }

    state.owned[id] = true;
    const slot = getEquipSlot(item);
    state.equipped[slot] = id;

    if (typeof logEvent === "function") {
      logEvent("avatar_purchase", {
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        equipSlot: slot,
        cost: item.cost
      });
    }

    saveAndRender();
  }

  function equipItem(id) {
    const item = getAvatarItem(id);
    if (!item || !state.owned[id]) return;

    const slot = getEquipSlot(item);
    state.equipped[slot] = id;

    if (typeof logEvent === "function") {
      logEvent("avatar_equip", {
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        equipSlot: slot
      });
    }

    saveAndRender();
  }

  function unequip(slot) {
    state.equipped[slot] = null;

    if (typeof logEvent === "function") {
      logEvent("avatar_unequip", { slot });
    }

    saveAndRender();
  }

  function clearAccessorySlots() {
    state.equipped.faceAccessory = null;
    state.equipped.backAccessory = null;
    state.equipped.handAccessory = null;
    saveAndRender();
  }

  function setAppearance(key, value) {
    state.appearance[key] = value;

    if (typeof logEvent === "function") {
      logEvent("avatar_appearance_updated", { key, value });
    }

    saveAndRender();
  }

  document.addEventListener("click", e => {
    updateEyesTowardPoint(e.clientX, e.clientY);

    clearTimeout(window.__avatarEyeResetTimer);
    window.__avatarEyeResetTimer = setTimeout(() => {
      resetEyes();
    }, 900);
  });

  document.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    if (!touch) return;

    updateEyesTowardPoint(touch.clientX, touch.clientY);

    clearTimeout(window.__avatarEyeResetTimer);
    window.__avatarEyeResetTimer = setTimeout(() => {
      resetEyes();
    }, 900);
  }, { passive: true });

  function renderAvatarPreviews() {
    const html = createAvatarHTML();
    if (avatarPreviewHome) avatarPreviewHome.innerHTML = html;
    if (avatarPreviewStyle) avatarPreviewStyle.innerHTML = html;
    if (avatarPreviewCloset) avatarPreviewCloset.innerHTML = html;

    if (avatarMini) {
      const face = getOptionValue("expression", state.appearance.expression).emoji;
      avatarMini.textContent = face || itemForSlot("hat")?.icon || "🧒";
    }
  }

  function renderStats() {
    const stars = getStarCount();
    const equippedCount = ["shirt", "hat", "faceAccessory", "backAccessory", "handAccessory", "buddy"]
      .filter(slot => !!state.equipped[slot]).length;

    if (starPill) starPill.textContent = `⭐ ${stars} Stars`;
    if (starsBig) starsBig.textContent = stars;
    if (ownedBig) ownedBig.textContent = ownedItems().length;
    if (lookBig) lookBig.textContent = equippedCount;
    if (currentLookText) currentLookText.textContent = displayLookText();
  }

  function makeTabButton(label, selected, onClick) {
    const btn = document.createElement("button");
    btn.className = `btn${selected ? " selected" : ""}`;
    btn.textContent = label;
    btn.type = "button";
    btn.onclick = onClick;
    return btn;
  }

  function renderChoiceButtons(container, group, currentValue, onChoose) {
    if (!container) return;
    container.innerHTML = "";

    APPEARANCE_OPTIONS[group].forEach(option => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `choiceBtn${currentValue === option.id ? " selected" : ""}`;
      btn.innerHTML = option.emoji
        ? `<span class="choiceEmoji">${option.emoji}</span><span>${option.label}</span>`
        : option.label;
      btn.onclick = () => onChoose(option.id);
      container.appendChild(btn);
    });
  }

  function renderSwatches(container, group, currentValue, onChoose) {
    if (!container) return;
    container.innerHTML = "";

    APPEARANCE_OPTIONS[group].forEach(option => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `swatchBtn${currentValue === option.id ? " selected" : ""}`;
      btn.setAttribute("aria-label", option.label);
      btn.title = option.label;
      btn.innerHTML = `
        <span class="swatchColor" style="background:${option.value};"></span>
        <span class="swatchLabel">${option.label}</span>
      `;
      btn.onclick = () => onChoose(option.id);
      container.appendChild(btn);
    });
  }

  function renderStyleModeTabs() {
    if (!styleModeTabs) return;
    styleModeTabs.innerHTML = "";

    STYLE_MODES.forEach(mode => {
      styleModeTabs.appendChild(
        makeTabButton(mode.label, styleMode === mode.key, () => {
          styleMode = mode.key;
          renderStyleModePanels();
          renderStyleModeTabs();
        })
      );
    });
  }

  function renderStyleModePanels() {
    if (styleBodyPanel) styleBodyPanel.classList.toggle("hidden", styleMode !== "body");
    if (styleClothesPanel) styleClothesPanel.classList.toggle("hidden", styleMode !== "clothes");
  }

  function renderStyleControls() {
    renderChoiceButtons(outfitTypeChoices, "outfitType", state.appearance.outfitType, value => setAppearance("outfitType", value));
    renderSwatches(topColorChoices, "topColor", state.appearance.topColor, value => setAppearance("topColor", value));
    renderChoiceButtons(hairStyleChoices, "hairStyle", state.appearance.hairStyle, value => setAppearance("hairStyle", value));
    renderSwatches(hairColorChoices, "hairColor", state.appearance.hairColor, value => setAppearance("hairColor", value));
    renderSwatches(skinColorChoices, "skinTone", state.appearance.skinTone, value => setAppearance("skinTone", value));
    renderSwatches(pantsColorChoices, "pantsColor", state.appearance.pantsColor, value => setAppearance("pantsColor", value));
    renderChoiceButtons(expressionChoices, "expression", state.appearance.expression, value => setAppearance("expression", value));
  }

  function renderClosetTabs() {
    if (!closetTabs) return;

    closetTabs.innerHTML = "";
    AVATAR_TYPES.forEach(type => {
      closetTabs.appendChild(
        makeTabButton(type.label, closetFilter === type.key, () => {
          closetFilter = type.key;
          renderClosetGrid();
          renderClosetTabs();
        })
      );
    });
  }

  function itemMetaText(item, owned) {
    if (!owned) return `Locked • ⭐ ${item.cost}`;
    if (item.type === "accessory") return `Owned • ${item.placement}`;
    return "Owned";
  }

  function makeEquipButton(item) {
    const slot = getEquipSlot(item);
    const equipped = state.equipped[slot] === item.id;
    const btn = document.createElement("button");
    btn.className = "miniBtn" + (equipped ? " primary" : "");
    btn.textContent = equipped ? "Equipped" : "Equip";
    btn.disabled = equipped;
    btn.onclick = () => equipItem(item.id);
    return btn;
  }

  function makeBuyButton(item) {
    const btn = document.createElement("button");
    btn.className = "miniBtn primary";
    btn.textContent = `Unlock ⭐ ${item.cost}`;
    btn.onclick = () => buyItem(item.id);
    return btn;
  }

  function renderClosetGrid() {
    if (!closetGrid) return;

    closetGrid.innerHTML = "";
    const visible = AVATAR_ITEMS.filter(item => item.type === closetFilter);

    const noneCard = document.createElement("div");
    noneCard.className = "itemCard clearCard";
    noneCard.innerHTML = `
      <div class="itemPreview">❌</div>
      <div class="itemTitle">Nothing</div>
      <div class="itemMeta">Take this category off</div>
      <div class="itemActions">
        <button class="miniBtn">Clear</button>
      </div>
    `;
    noneCard.querySelector("button").onclick = () => {
      if (closetFilter === "accessory") {
        clearAccessorySlots();
      } else {
        unequip(closetFilter);
      }
    };
    closetGrid.appendChild(noneCard);

    visible.forEach(item => {
      const owned = !!state.owned[item.id];
      const card = document.createElement("div");
      card.className = `itemCard${owned ? "" : " locked"}`;
      card.innerHTML = `
        <div class="itemPreview">${item.icon}</div>
        <div class="itemTitle">${item.name}</div>
        <div class="itemMeta">${itemMetaText(item, owned)}</div>
        <div class="itemActions"></div>
      `;

      const actions = card.querySelector(".itemActions");
      if (owned) {
        actions.appendChild(makeEquipButton(item));
      } else {
        const lock = document.createElement("span");
        lock.className = "lockTag";
        lock.textContent = "🔒 Locked";
        actions.appendChild(lock);
        actions.appendChild(makeBuyButton(item));
      }

      closetGrid.appendChild(card);
    });
  }

  function render() {
    renderProfile();
    renderAvatarPreviews();
    renderStats();
    renderStyleModeTabs();
    renderStyleModePanels();
    renderStyleControls();
    renderClosetTabs();
    renderClosetGrid();
  }

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => {
      go(btn.dataset.go);
    });
  });

  const backHomeBtn = document.getElementById("backHomeBtn");
  if (backHomeBtn) {
    backHomeBtn.onclick = () => {
      window.location.href = "index.html";
    };
  }

  const avatarBtn = document.getElementById("avatarBtn");
  if (avatarBtn) {
    avatarBtn.onclick = () => go("style");
  }

  const earnStarsBtn = document.getElementById("earnStarsBtn");
  if (earnStarsBtn) {
    earnStarsBtn.onclick = () => {
      setStarCount(getStarCount() + 2);

      if (typeof logEvent === "function") {
        logEvent("avatar_bonus_stars", { amount: 2 });
      }

      render();
    };
  }

  if (editNameBtn) editNameBtn.onclick = openNameEditor;
  if (saveNameBtn) saveNameBtn.onclick = saveProfileName;
  if (cancelNameBtn) cancelNameBtn.onclick = closeNameEditor;

  if (avatarNameInput) {
    avatarNameInput.addEventListener("keydown", e => {
      if (e.key === "Enter") saveProfileName();
    });
  }

  render();
});
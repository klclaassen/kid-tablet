const btnColoring = document.getElementById("btnColoring");
if (btnColoring) {
  btnColoring.onclick = () => {
    window.location.href = "coloring_pages.html";
  };
}

const screens = {
  home: document.getElementById("homeScreen"),
  menu: document.getElementById("menuScreen"),
  letters: document.getElementById("lettersScreen"),
  numbers: document.getElementById("numbersScreen"),
  name: document.getElementById("nameScreen"),
  shapes: document.getElementById("shapesScreen"),
  patterns: document.getElementById("patternsScreen"),
  challenges: document.getElementById("challengesScreen")
};

function showScreen(key) {
  Object.values(screens).forEach(el => el.classList.remove("active"));
  screens[key].classList.add("active");

  if (typeof logScreenView === "function") {
    logScreenView(key);
  }
}

document.getElementById("goMenu").onclick = () => showScreen("menu");
document.getElementById("menuBackBtn").onclick = () => showScreen("home");
document.querySelectorAll(".backToMenu").forEach(btn => {
  btn.onclick = () => showScreen("menu");
});

function drawGuideText(canvas, text, font, color) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function flashFeedback(el, text, ms = 900) {
  el.textContent = text;
  setTimeout(() => {
    el.textContent = "";
  }, ms);
}

function wireDrawing(drawCanvas, colorGetter) {
  const ctx = drawCanvas.getContext("2d");
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function getXY(e) {
    const rect = drawCanvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    }
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function start(e) {
    drawing = true;
    [lastX, lastY] = getXY(e);
    if (typeof logEvent === "function") {
      logEvent("draw_start", { canvas: drawCanvas.id });
    }
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const [x, y] = getXY(e);

    ctx.save();
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.strokeStyle = colorGetter();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    [lastX, lastY] = [x, y];
  }

  function end() {
    drawing = false;
  }

  drawCanvas.addEventListener("mousedown", start);
  drawCanvas.addEventListener("mousemove", move);
  drawCanvas.addEventListener("mouseup", end);
  drawCanvas.addEventListener("mouseout", end);

  drawCanvas.addEventListener("touchstart", start, { passive: false });
  drawCanvas.addEventListener("touchmove", move, { passive: false });
  drawCanvas.addEventListener("touchend", end);
  drawCanvas.addEventListener("touchcancel", end);

  return {
    clear: () => ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
  };
}

function isUserStrokePixel(imageData, idx) {
  return imageData.data[idx + 3] > 20;
}

function buildTextMask(text, font) {
  const temp = document.createElement("canvas");
  temp.width = 340;
  temp.height = 340;

  const tctx = temp.getContext("2d");
  tctx.clearRect(0, 0, temp.width, temp.height);
  tctx.fillStyle = "#000";
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.font = font;
  tctx.fillText(text, temp.width / 2, temp.height / 2);

  return tctx.getImageData(0, 0, temp.width, temp.height);
}

function checkMatchAgainstMask(drawCanvas, maskImageData, kind) {
  const ctx = drawCanvas.getContext("2d");
  const userImage = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);

  let targetPixels = 0;
  let coveredTargetPixels = 0;
  let totalUserStrokePixels = 0;
  let offTargetStrokePixels = 0;

  for (let y = 0; y < drawCanvas.height; y++) {
    for (let x = 0; x < drawCanvas.width; x++) {
      const idx = (y * drawCanvas.width + x) * 4;

      const isTarget =
        maskImageData.data[idx] < 128 &&
        maskImageData.data[idx + 3] > 128;

      const isUserStroke = isUserStrokePixel(userImage, idx);

      if (isTarget) {
        targetPixels++;
        if (isUserStroke) coveredTargetPixels++;
      }

      if (isUserStroke) {
        totalUserStrokePixels++;
        if (!isTarget) offTargetStrokePixels++;
      }
    }
  }

  const coverage = targetPixels > 0 ? coveredTargetPixels / targetPixels : 0;
  const onTargetRatio = totalUserStrokePixels > 0
    ? coveredTargetPixels / totalUserStrokePixels
    : 0;

  const { lenient } = getSettings();

  const T = {
    shapes: lenient
      ? { minStroke: 650, minCoverage: 0.16, minOnTarget: 0.12 }
      : { minStroke: 900, minCoverage: 0.22, minOnTarget: 0.18 },
    text: lenient
      ? { minStroke: 850, minCoverage: 0.26, minOnTarget: 0.62, maxOffFrac: 0.40 }
      : { minStroke: 1200, minCoverage: 0.35, minOnTarget: 0.72, maxOffFrac: 0.28 }
  };

  if (kind === "shapes") {
    return (
      totalUserStrokePixels > T.shapes.minStroke &&
      coverage > T.shapes.minCoverage &&
      onTargetRatio > T.shapes.minOnTarget
    );
  }

  return (
    totalUserStrokePixels > T.text.minStroke &&
    coverage > T.text.minCoverage &&
    onTargetRatio > T.text.minOnTarget &&
    offTargetStrokePixels < totalUserStrokePixels * T.text.maxOffFrac
  );
}

/***************
 * Letters
 ***************/
const LETTER_EMOJIS = {
  A: "🍎", B: "🚌", C: "🐱", D: "🐶", E: "🐘", F: "🐟",
  G: "🦒", H: "🏠", I: "🍦", J: "🪼", K: "🔑", L: "🦁",
  M: "🌙", N: "🪺", O: "🐙", P: "🐷", Q: "👑", R: "🌈",
  S: "⭐", T: "🐯", U: "☂️", V: "🎻", W: "🍉", X: "❌",
  Y: "🪀", Z: "🦓"
};

let currentLetter = "A";
let currentLetterVariant = "upper";
const lettersFeedback = document.getElementById("lettersFeedback");
const lettersDraw = wireDrawing(document.getElementById("lettersDraw"), () => "#5e35b1");

function newLetters() {
  currentLetter = randomItem("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
  currentLetterVariant = Math.random() < 0.5 ? "upper" : "lower";

  const upper = document.getElementById("lettersUpper");
  const lower = document.getElementById("lettersLower");

  upper.textContent = currentLetter.toUpperCase();
  lower.textContent = currentLetter.toLowerCase();
  upper.classList.remove("active-choice");
  lower.classList.remove("active-choice");
  (currentLetterVariant === "upper" ? upper : lower).classList.add("active-choice");

  document.getElementById("lettersEmoji").textContent = LETTER_EMOJIS[currentLetter] || "✨";

  drawGuideText(
    document.getElementById("lettersGuide"),
    currentLetterVariant === "upper" ? currentLetter.toUpperCase() : currentLetter.toLowerCase(),
    currentLetterVariant === "upper" ? "bold 190px Andika" : "bold 170px Andika",
    "#5e35b1"
  );

  lettersDraw.clear();

  if (typeof logEvent === "function") {
    logEvent("new_item", { mode: "letters", value: currentLetter, variant: currentLetterVariant });
  }
}

document.getElementById("btnLetters").onclick = () => {
  newLetters();
  showScreen("letters");
};

document.getElementById("lettersClear").onclick = () => {
  lettersDraw.clear();
  if (typeof logEvent === "function") {
    logEvent("clear_canvas", { mode: "letters" });
  }
};

document.getElementById("lettersDone").onclick = () => {
  const targetText = currentLetterVariant === "upper" ? currentLetter.toUpperCase() : currentLetter.toLowerCase();
  const font = currentLetterVariant === "upper" ? "bold 190px Andika" : "bold 170px Andika";

  const mask = buildTextMask(targetText, font);
  const passed = checkMatchAgainstMask(document.getElementById("lettersDraw"), mask, "text");

  if (typeof logEvent === "function") {
    logEvent("done_pressed", { mode: "letters", passed, letter: currentLetter, variant: currentLetterVariant });
  }

  if (passed) {
    flashFeedback(lettersFeedback, "Great job! ⭐");
    awardSuccess("letters");
    setTimeout(newLetters, 650);
  } else {
    flashFeedback(lettersFeedback, "Try again!");
    lettersDraw.clear();
  }
};

/***************
 * Numbers
 ***************/
const NUMBER_EMOJIS = ["⭐", "🍓", "🐸", "🦄", "🍪", "🚗", "🌈", "🫐", "🐤", "⚽"];
let currentNumber = "4";
let currentNumberEmoji = "⭐";
const numbersFeedback = document.getElementById("numbersFeedback");
const numbersDraw = wireDrawing(document.getElementById("numbersDraw"), () => "#fb8c00");

function renderNumberGrid(count, emoji) {
  const grid = document.getElementById("numbersGrid");
  grid.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.className = "number-emoji-cell";
    d.textContent = emoji;
    grid.appendChild(d);
  }
}

function newNumbers() {
  currentNumber = randomItem("0123456789".split(""));
  currentNumberEmoji = randomItem(NUMBER_EMOJIS);

  document.getElementById("numbersValue").textContent = currentNumber;
  renderNumberGrid(parseInt(currentNumber, 10), currentNumberEmoji);

  drawGuideText(document.getElementById("numbersGuide"), currentNumber, "bold 200px Andika", "#fb8c00");
  numbersDraw.clear();

  if (typeof logEvent === "function") {
    logEvent("new_item", { mode: "numbers", value: currentNumber });
  }
}

document.getElementById("btnNumbers").onclick = () => {
  newNumbers();
  showScreen("numbers");
};

document.getElementById("numbersClear").onclick = () => {
  numbersDraw.clear();
  if (typeof logEvent === "function") {
    logEvent("clear_canvas", { mode: "numbers" });
  }
};

document.getElementById("numbersDone").onclick = () => {
  const mask = buildTextMask(currentNumber, "bold 200px Andika");
  const passed = checkMatchAgainstMask(document.getElementById("numbersDraw"), mask, "text");

  if (typeof logEvent === "function") {
    logEvent("done_pressed", { mode: "numbers", passed, value: currentNumber });
  }

  if (passed) {
    flashFeedback(numbersFeedback, "Nice! ⭐");
    awardSuccess("numbers");
    setTimeout(newNumbers, 650);
  } else {
    flashFeedback(numbersFeedback, "Try again!");
    numbersDraw.clear();
  }
};

/***************
 * Name
 ***************/
function getNameWords() {
  const profile = loadJSON(STORAGE_KEYS.profile, {
    displayName: "Name",
    childName: "Addy"
  });

  const raw = (profile.childName || profile.displayName || "Addy").trim();

  return raw
    .split(/\s+/)
    .map(word => word.replace(/[^a-zA-Z'-]/g, ""))
    .filter(Boolean);
}

function buildNameHTML(word, currentIndex) {
  return word.split("").map((char, idx) => {
    let cls = "name-char";
    if (idx < currentIndex) cls += " done";
    else if (idx === currentIndex) cls += " current";
    return `<span class="${cls}">${char}</span>`;
  }).join("");
}

let nameWords = getNameWords();
let nameWordIndex = 0;
let nameCharIndex = 0;
const nameFeedback = document.getElementById("nameFeedback");
const nameDraw = wireDrawing(document.getElementById("nameDraw"), () => "#607d8b");

function renderName() {
  nameWords = getNameWords();
  if (!nameWords.length) nameWords = ["Addy"];

  if (nameWordIndex >= nameWords.length) nameWordIndex = 0;

  const word = nameWords[nameWordIndex];
  if (nameCharIndex >= word.length) nameCharIndex = 0;

  const char = word[nameCharIndex];

  document.getElementById("nameWord").innerHTML = buildNameHTML(word, nameCharIndex);
  drawGuideText(document.getElementById("nameGuide"), char, "bold 190px Andika", "#607d8b");
  nameDraw.clear();

  if (typeof logEvent === "function") {
    logEvent("new_item", { mode: "name", word, char, index: nameCharIndex });
  }
}

function advanceNameLetter() {
  const word = nameWords[nameWordIndex];
  nameCharIndex++;

  if (nameCharIndex >= word.length) {
    nameCharIndex = 0;
    nameWordIndex++;
    if (nameWordIndex >= nameWords.length) nameWordIndex = 0;
  }

  renderName();
}

document.getElementById("btnName").onclick = () => {
  nameWords = getNameWords();
  nameWordIndex = 0;
  nameCharIndex = 0;
  renderName();
  showScreen("name");
};

document.getElementById("nameClear").onclick = () => {
  nameDraw.clear();
  if (typeof logEvent === "function") {
    logEvent("clear_canvas", { mode: "name" });
  }
};

document.getElementById("nameDone").onclick = () => {
  const word = nameWords[nameWordIndex];
  const char = word[nameCharIndex];
  const mask = buildTextMask(char, "bold 190px Andika");
  const passed = checkMatchAgainstMask(document.getElementById("nameDraw"), mask, "text");

  if (typeof logEvent === "function") {
    logEvent("done_pressed", { mode: "name", passed, char, word, index: nameCharIndex });
  }

  if (passed) {
    flashFeedback(nameFeedback, "Awesome! ⭐");
    awardSuccess("name");
    setTimeout(advanceNameLetter, 650);
  } else {
    flashFeedback(nameFeedback, "Try again!");
    nameDraw.clear();
  }
};

/***************
 * Shapes
 ***************/
const SHAPES = ["circle", "square", "triangle", "heart", "star"];
let currentShape = "circle";
const shapesFeedback = document.getElementById("shapesFeedback");
const shapesDraw = wireDrawing(document.getElementById("shapesDraw"), () => "#26a69a");

function drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

function drawShape(canvas, shape, color, alpha = 0.18, lineWidth = 18) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, 95, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape === "square") {
    ctx.strokeRect(cx - 95, cy - 95, 190, 190);
  } else if (shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 110);
    ctx.lineTo(cx - 110, cy + 95);
    ctx.lineTo(cx + 110, cy + 95);
    ctx.closePath();
    ctx.stroke();
  } else if (shape === "heart") {
    drawHeart(ctx, cx, cy - 70, 180);
    ctx.stroke();
  } else if (shape === "star") {
    drawStar(ctx, cx, cy, 5, 110, 48);
    ctx.stroke();
  }

  ctx.restore();
}

function buildShapeMask(shape) {
  const temp = document.createElement("canvas");
  temp.width = 340;
  temp.height = 340;
  drawShape(temp, shape, "#000", 1.0, 18);
  return temp.getContext("2d").getImageData(0, 0, 340, 340);
}

function newShape() {
  let next = randomItem(SHAPES);
  while (next === currentShape && SHAPES.length > 1) next = randomItem(SHAPES);
  currentShape = next;

  document.getElementById("shapeLabel").textContent =
    currentShape.charAt(0).toUpperCase() + currentShape.slice(1);

  drawShape(document.getElementById("shapesGuide"), currentShape, "#26a69a", 0.18, 18);
  drawShape(document.getElementById("shapesPreview"), currentShape, "#26a69a", 1, 14);

  shapesDraw.clear();

  if (typeof logEvent === "function") {
    logEvent("new_item", { mode: "shapes", shape: currentShape });
  }
}

document.getElementById("btnShapes").onclick = () => {
  newShape();
  showScreen("shapes");
};

document.getElementById("shapesClear").onclick = () => {
  shapesDraw.clear();
  if (typeof logEvent === "function") {
    logEvent("clear_canvas", { mode: "shapes" });
  }
};

document.getElementById("shapesDone").onclick = () => {
  const mask = buildShapeMask(currentShape);
  const passed = checkMatchAgainstMask(document.getElementById("shapesDraw"), mask, "shapes");

  if (typeof logEvent === "function") {
    logEvent("done_pressed", { mode: "shapes", passed, shape: currentShape });
  }

  if (passed) {
    flashFeedback(shapesFeedback, "Great! ⭐");
    awardSuccess("shapes");
    setTimeout(newShape, 650);
  } else {
    flashFeedback(shapesFeedback, "Try again!");
    shapesDraw.clear();
  }
};

/***************
 * Patterns
 ***************/
const PATTERN_SETS = [
  { seq: ["⬛", "⬜", "⬛", "⬜"], answer: "⬛", wrong: ["⬜", "🟦", "⭐"] },
  { seq: ["🔵", "🔴", "🔵", "🔴"], answer: "🔵", wrong: ["🔴", "🟢", "🟡"] },
  { seq: ["⭐", "🌙", "⭐", "🌙"], answer: "⭐", wrong: ["🌙", "☀️", "☁️"] },
  { seq: ["🟩", "🟨", "🟩", "🟨"], answer: "🟩", wrong: ["🟨", "🟦", "🟥"] },
  { seq: ["2", "4", "6", "?"], answer: "8", wrong: ["7", "9", "10"] },
  { seq: ["3", "6", "9", "?"], answer: "12", wrong: ["10", "11", "15"] },
  { seq: ["10", "9", "8", "?"], answer: "7", wrong: ["6", "9", "5"] },
  { seq: ["🟩", "🟨", "🟨", "🟩", "🟨", "🟨", "?"], answer: "🟩", wrong: ["🟨", "🟦", "🟥"] }
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function newPattern() {
  const p = randomItem(PATTERN_SETS);
  const strip = document.getElementById("patternStrip");
  const options = document.getElementById("patternOptions");
  const feedback = document.getElementById("patternFeedback");

  feedback.textContent = "";
  strip.innerHTML = p.seq.map(x => `<span>${x}</span>`).join("") + (p.seq[p.seq.length - 1] === "?" ? "" : `<span> ?</span>`);

  const choices = shuffle([p.answer, ...p.wrong.slice(0, 3)]);
  options.innerHTML = "";

  if (typeof logEvent === "function") {
    logEvent("new_item", { mode: "patterns", seq: p.seq });
  }

  choices.forEach(choice => {
    const d = document.createElement("div");
    d.className = "pattern-option";
    d.textContent = choice;
    d.onclick = () => {
      if (typeof logEvent === "function") {
        logEvent("pattern_choice", { choice, correct: choice === p.answer });
      }

      if (choice === p.answer) {
        feedback.textContent = "Nice pattern! ⭐";
        awardSuccess("patterns");
        setTimeout(newPattern, 650);
      } else {
        feedback.textContent = "Try another one.";
      }
    };
    options.appendChild(d);
  });
}

document.getElementById("btnPatterns").onclick = () => {
  newPattern();
  showScreen("patterns");
};

document.getElementById("newPattern").onclick = newPattern;

/***************
 * Challenges
 ***************/
const challengeFeedback = document.getElementById("challengeFeedback");

const COUNTING_CHALLENGES = [
  { emoji: "🍎", label: "apples" },
  { emoji: "⭐", label: "stars" },
  { emoji: "⚽", label: "balls" },
  { emoji: "🐶", label: "dogs" },
  { emoji: "🐱", label: "cats" },
  { emoji: "🚗", label: "cars" },
  { emoji: "🦋", label: "butterflies" },
  { emoji: "🌳", label: "trees" }
];

const WORD_CHALLENGES = [
  { word: "car", emoji: "🚗" },
  { word: "truck", emoji: "🚚" },
  { word: "tree", emoji: "🌳" },
  { word: "apple", emoji: "🍎" },
  { word: "dog", emoji: "🐶" },
  { word: "cat", emoji: "🐱" },
  { word: "fish", emoji: "🐟" },
  { word: "bird", emoji: "🐦" },
  { word: "sun", emoji: "☀️" },
  { word: "moon", emoji: "🌙" },
  { word: "star", emoji: "⭐" },
  { word: "ball", emoji: "⚽" },
  { word: "ice cream", emoji: "🍦" },
  { word: "cake", emoji: "🎂" }
];

const NUMBER_NEXT_CHALLENGES = [
  { seq: ["1", "2", "3", "?"], answer: "4", wrong: ["5", "2", "6"] },
  { seq: ["4", "5", "6", "?"], answer: "7", wrong: ["8", "5", "9"] },
  { seq: ["7", "8", "9", "?"], answer: "10", wrong: ["11", "8", "6"] },
  { seq: ["2", "4", "6", "?"], answer: "8", wrong: ["7", "10", "5"] },
  { seq: ["3", "6", "9", "?"], answer: "12", wrong: ["10", "13", "15"] },
  { seq: ["10", "9", "8", "?"], answer: "7", wrong: ["6", "9", "5"] }
];

const HARDER_PATTERN_CHALLENGES = [
  { seq: ["🔴", "🔵", "🔴", "🔵", "?"], answer: "🔴", wrong: ["🔵", "🟢", "🟡"] },
  { seq: ["⭐", "⭐", "🌙", "⭐", "⭐", "🌙", "?"], answer: "⭐", wrong: ["🌙", "☀️", "☁️"] },
  { seq: ["🟩", "🟨", "🟨", "🟩", "🟨", "🟨", "?"], answer: "🟩", wrong: ["🟨", "🟦", "🟥"] },
  { seq: ["🟪", "🟧", "🟪", "🟧", "🟪", "?"], answer: "🟧", wrong: ["🟪", "⬜", "🟩"] }
];

const WORD_PICK_CHALLENGES = [
  { prompt: "Which word says CAR?", answer: "CAR", wrong: ["CAT", "CAN", "CUP"] },
  { prompt: "Which word says TRUCK?", answer: "TRUCK", wrong: ["TRAIN", "TREE", "TRACK"] },
  { prompt: "Which word says TREE?", answer: "TREE", wrong: ["TRUCK", "FREE", "FROG"] },
  { prompt: "Which word says DINO?", answer: "DINO", wrong: ["DOG", "DOLL", "DUCK"] }
];

let currentChallenge = null;
let challengeDraw = null;
let challengeSelected = null;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeCountingCard() {
  const item = randomItem(COUNTING_CHALLENGES);
  const count = randInt(3, 10);

  const wrongSet = new Set();
  while (wrongSet.size < 3) {
    const offset = randomItem([-3, -2, -1, 1, 2, 3]);
    const wrong = count + offset;
    if (wrong >= 1 && wrong <= 12 && wrong !== count) {
      wrongSet.add(String(wrong));
    }
  }

  return {
    type: "count_pick",
    text: `How many ${item.label} are there?`,
    countingEmoji: item.emoji,
    count,
    answer: String(count),
    choices: shuffle([String(count), ...Array.from(wrongSet)])
  };
}

function makeChallengeDeck() {
  const wordCard = randomItem(WORD_CHALLENGES);
  const nextCard = randomItem(NUMBER_NEXT_CHALLENGES);
  const patternCard = randomItem(HARDER_PATTERN_CHALLENGES);
  const wordPick = randomItem(WORD_PICK_CHALLENGES);
  const countCard = makeCountingCard();

  return [
    {
      type: "trace_word",
      word: wordCard.word,
      emoji: wordCard.emoji,
      text: "Trace the word"
    },
    {
      type: "sequence_pick",
      text: "What number comes next?",
      seq: nextCard.seq,
      answer: nextCard.answer,
      choices: shuffle([nextCard.answer, ...nextCard.wrong])
    },
    {
      type: "pattern_pick",
      text: "What comes next?",
      seq: patternCard.seq,
      answer: patternCard.answer,
      choices: shuffle([patternCard.answer, ...patternCard.wrong])
    },
    {
      type: "word_pick",
      text: wordPick.prompt,
      answer: wordPick.answer,
      choices: shuffle([wordPick.answer, ...wordPick.wrong])
    },
    countCard
  ];
}

function getChallengeGuideFont(word) {
  if (word.length <= 4) return "bold 120px Andika";
  if (word.length <= 6) return "bold 88px Andika";
  if (word.length <= 8) return "bold 68px Andika";
  return "bold 54px Andika";
}

function renderChoiceGrid(choices) {
  return `
    <div class="challenge-choice-grid">
      ${choices.map(choice => `
        <div class="challenge-choice" data-choice="${choice}">${choice}</div>
      `).join("")}
    </div>
  `;
}

function wireChallengeChoices() {
  document.querySelectorAll(".challenge-choice").forEach(el => {
    el.onclick = () => {
      challengeSelected = el.dataset.choice;
      document.querySelectorAll(".challenge-choice").forEach(x => x.classList.remove("selected"));
      el.classList.add("selected");
    };
  });
}

function renderTraceWordCard(card) {
  const challengeCard = document.getElementById("challengeCard");
  const font = getChallengeGuideFont(card.word);

  challengeCard.innerHTML = `
    <div class="challenge-inner">
      <div class="challenge-title">Trace the word</div>

      <div class="challenge-row">
        <div class="challenge-emoji">${card.emoji}</div>

        <div class="challenge-canvas-wrap">
          <canvas id="challengeGuide" class="challenge-guide" width="340" height="340"></canvas>
          <canvas id="challengeDraw" class="draw-layer" width="340" height="340"></canvas>
        </div>
      </div>

      <div class="challenge-row challenge-word-label">
        ${card.word}
      </div>
    </div>
  `;

  drawGuideText(
    document.getElementById("challengeGuide"),
    card.word,
    font,
    "#42a5f5"
  );

  challengeDraw = wireDrawing(
    document.getElementById("challengeDraw"),
    () => "#42a5f5",
    12
  );
}

function renderChoiceCard(card) {
  const challengeCard = document.getElementById("challengeCard");

  challengeCard.innerHTML = `
    <div class="challenge-inner">
      <div class="challenge-title">${card.text}</div>
      ${card.seq ? `<div class="challenge-seq">${card.seq.map(x => `<span>${x}</span>`).join("")}</div>` : ""}
      ${renderChoiceGrid(card.choices)}
    </div>
  `;

  wireChallengeChoices();
}

function makeChallengeDeck() {
  const wordCard = randomItem(WORD_CHALLENGES);
  const nextCard = randomItem(NUMBER_NEXT_CHALLENGES);
  const patternCard = randomItem(HARDER_PATTERN_CHALLENGES);
  const wordPick = randomItem(WORD_PICK_CHALLENGES);
  const countCard = makeCountingCard();

  return [
    {
      type: "trace_word",
      word: wordCard.word,
      emoji: wordCard.emoji,
      text: "Trace the word"
    },
    {
      type: "sequence_pick",
      text: "What number comes next?",
      seq: nextCard.seq,
      answer: nextCard.answer,
      choices: shuffle([nextCard.answer, ...nextCard.wrong])
    },
    {
      type: "pattern_pick",
      text: "What comes next?",
      seq: patternCard.seq,
      answer: patternCard.answer,
      choices: shuffle([patternCard.answer, ...patternCard.wrong])
    },
    {
      type: "word_pick",
      text: wordPick.prompt,
      answer: wordPick.answer,
      choices: shuffle([wordPick.answer, ...wordPick.wrong])
    },
    countCard
  ];
}

function renderChallengeCard(card) {
  challengeSelected = null;
  challengeDraw = null;

  if (card.type === "trace_word") {
    renderTraceWordCard(card);
    return;
  }

  if (card.type === "count_pick") {
    renderCountCard(card);
    return;
  }

  renderChoiceCard(card);
}

function newChallenge() {
  currentChallenge = randomItem(makeChallengeDeck());
  renderChallengeCard(currentChallenge);
  challengeFeedback.textContent = "";

  if (typeof logEvent === "function") {
    logEvent("new_item", {
      mode: "challenges",
      challengeType: currentChallenge.type,
      challengeText: currentChallenge.text,
      answer: currentChallenge.answer || currentChallenge.word || null
    });
  }
}

function completeChallenge() {
  flashFeedback(challengeFeedback, "Nice! ⭐");
  awardSuccess("challenges");

  if (typeof logEvent === "function") {
    logEvent("challenge_completed", {
      challengeType: currentChallenge ? currentChallenge.type : null,
      answer: currentChallenge ? (currentChallenge.answer || currentChallenge.word || null) : null
    });
  }

  setTimeout(newChallenge, 650);
}

function checkTraceWordChallenge() {
  const font = getChallengeGuideFont(currentChallenge.word);
  const mask = buildTextMask(currentChallenge.word, font);
  const passed = checkMatchAgainstMask(document.getElementById("challengeDraw"), mask, "text");

  recordSkillResult("challenges", passed, 4);

  if (typeof logEvent === "function") {
    logEvent("challenge_checked", {
      challengeType: "trace_word",
      word: currentChallenge.word,
      passed
    });
  }

  if (passed) {
    completeChallenge();
  } else {
    flashFeedback(challengeFeedback, "Try again!");
    if (challengeDraw) challengeDraw.clear();
  }
}

function checkChoiceChallenge() {
  const passed = challengeSelected === currentChallenge.answer;

  if (typeof logEvent === "function") {
    logEvent("challenge_checked", {
      challengeType: currentChallenge.type,
      selected: challengeSelected,
      answer: currentChallenge.answer,
      passed
    });
  }

  recordSkillResult("challenges", passed, 4);

  if (passed) {
    completeChallenge();
  } else {
    flashFeedback(challengeFeedback, "Try again!");
  }
}

window.addEventListener("load", async () => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
});

document.getElementById("btnChallenges").onclick = () => {
  newChallenge();
  showScreen("challenges");
};

document.getElementById("newChallenge").onclick = () => newChallenge();

document.getElementById("challengeDone").onclick = () => {
  if (!currentChallenge) {
    newChallenge();
    return;
  }

  if (currentChallenge.type === "trace_word") {
    checkTraceWordChallenge();
    return;
  }

  checkChoiceChallenge();
};

/***************
 * READING
 ***************/
const readingFeedback = document.getElementById("readingFeedback");

const READING_WORDS = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "sun", emoji: "☀️" },
  { word: "car", emoji: "🚗" },
  { word: "hat", emoji: "🎩" },
  { word: "fish", emoji: "🐟" },
  { word: "tree", emoji: "🌳" },
  { word: "star", emoji: "⭐" }
];

let currentReading = null;
let readingSelected = null;

/***************
 * BUILD CARDS
 ***************/
function makeReadingCard() {
  const skill = getSkill("reading");
  const level = skill.level;

  let pool = READING_WORDS;

  if (level === 1) {
    pool = READING_WORDS.filter(x => x.word.length <= 3 || x.word === "car");
  } else if (level === 2) {
    pool = READING_WORDS.filter(x => x.word.length <= 4);
  }

  const item = randomItem(pool);

  let availableTypes = ["start_sound"];
  if (level >= 2) availableTypes.push("finish_word");
  if (level >= 3) availableTypes.push("match_word");

  const type = randomItem(availableTypes);

  if (type === "start_sound") {
    const correct = item.word[0];
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    const wrongCount = level >= 2 ? 3 : 2;
    const wrong = shuffle(letters.filter(l => l !== correct)).slice(0, wrongCount);

    return {
      type,
      text: "What sound comes first?",
      emoji: item.emoji,
      answer: correct,
      choices: shuffle([correct, ...wrong])
    };
  }

  if (type === "finish_word") {
    const index = Math.min(
      Math.max(1, randInt(1, item.word.length - 1)),
      item.word.length - 1
    );
    const missing = item.word[index];
    const display = item.word.slice(0, index) + "_" + item.word.slice(index + 1);
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    const wrong = shuffle(letters.filter(l => l !== missing)).slice(0, 3);

    return {
      type,
      text: "Finish the word",
      emoji: item.emoji,
      display,
      answer: missing,
      choices: shuffle([missing, ...wrong])
    };
  }

  const wrongWords = shuffle(
    READING_WORDS.map(w => w.word).filter(w => w !== item.word)
  ).slice(0, level >= 4 ? 3 : 2);

  return {
    type: "match_word",
    text: "Which word matches?",
    emoji: item.emoji,
    answer: item.word,
    choices: shuffle([item.word, ...wrongWords])
  };
}

  // FINISH WORD
  if (type === "finish_word") {
    const index = randInt(1, item.word.length - 1);
    const missing = item.word[index];

    const display =
      item.word.slice(0, index) + "_" + item.word.slice(index + 1);

    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    const wrong = shuffle(
      letters.filter(l => l !== missing)
    ).slice(0, 3);

    return {
      type,
      text: "Finish the word",
      emoji: item.emoji,
      display,
      answer: missing,
      choices: shuffle([missing, ...wrong])
    };
  }

  // MATCH WORD
  const wrongWords = shuffle(
    READING_WORDS.map(w => w.word).filter(w => w !== item.word)
  ).slice(0, 3);

  return {
    type: "match_word",
    text: "Which word matches?",
    emoji: item.emoji,
    answer: item.word,
    choices: shuffle([item.word, ...wrongWords])
  };
}

/***************
 * RENDER
 ***************/
function renderReadingCard(card) {
  const el = document.getElementById("readingCard");
  readingSelected = null;

  if (card.type === "finish_word") {
    el.innerHTML = `
      <div class="challenge-inner">
        <div class="challenge-title">${card.text}</div>

        <div class="challenge-row">
          <div class="challenge-emoji">${card.emoji}</div>
        </div>

        <div class="challenge-row" style="font-size:48px; font-weight:900;">
          ${card.display}
        </div>

        ${renderChoiceGrid(card.choices)}
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="challenge-inner">
        <div class="challenge-title">${card.text}</div>

        <div class="challenge-row">
          <div class="challenge-emoji">${card.emoji}</div>
        </div>

        ${renderChoiceGrid(card.choices)}
      </div>
    `;
  }

  wireReadingChoices();
}

function wireReadingChoices() {
  document.querySelectorAll(".challenge-choice").forEach(btn => {
    btn.onclick = () => {
      readingSelected = btn.textContent;

      document.querySelectorAll(".challenge-choice")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");
    };
  });
}

/***************
 * FLOW
 ***************/
function newReading() {
  currentReading = makeReadingCard();
  renderReadingCard(currentReading);
  readingFeedback.textContent = "";
}

function checkReading() {
  if (!currentReading || !readingSelected) return;

  const correct = String(currentReading.answer);
  const picked = String(readingSelected);
  const passed = picked === correct;

  recordSkillResult("reading", passed, 4);

  if (passed) {
    flashFeedback(readingFeedback, "Nice reading! ⭐");
    awardSuccess("reading");
    setTimeout(newReading, 650);
  } else {
    flashFeedback(readingFeedback, "Try again!");
  }
}

/***************
 * BUTTONS
 ***************/
document.getElementById("btnReading").onclick = () => {
  newReading();
  showScreen("reading");
};

document.getElementById("newReading").onclick = newReading;
document.getElementById("readingDone").onclick = checkReading;
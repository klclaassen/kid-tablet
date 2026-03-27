const COLORING_SAVE_PREFIX = "addy_coloring_save_";

const PAGES = [
  { id: "page_boy1", name: "Boy", img: "pages/boy1.png", cost: 3 },
  { id: "page_dino1", name: "Dinosaur", img: "pages/dino1.png", cost: 3 },
  { id: "page_icecreamtruck", name: "Ice Cream Truck", img: "pages/icecreamtruck.png", cost: 3 },
  { id: "page_octopus", name: "Octopus", img: "pages/octopus.png", cost: 3 },
  { id: "page_truck1", name: "Truck", img: "pages/truck1.png", cost: 3 },
  { id: "page_turtle", name: "Turtle", img: "pages/turtle.png", cost: 3 }
];

const COLORS = [
  "#ff1744",
  "#ff9100",
  "#ffea00",
  "#00e676",
  "#2979ff",
  "#b388ff",
  "#8d6e63",
  "#f0c08a",
  "#212121"
];

function getColoringShopState() {
  return loadJSON(STORAGE_KEYS.shop, { purchased: {} });
}

function isPurchased(id) {
  const s = getColoringShopState();
  return !!(s.purchased && s.purchased[id]);
}

function saveDrawing(pageId, canvas) {
  try {
    localStorage.setItem(COLORING_SAVE_PREFIX + pageId, canvas.toDataURL("image/png"));
  } catch (err) {
    console.warn("Could not save drawing", err);
  }
}

function loadDrawing(pageId, ctx, canvas, callback) {
  const data = localStorage.getItem(COLORING_SAVE_PREFIX + pageId);
  if (!data) {
    if (callback) callback(false);
    return;
  }

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (callback) callback(true);
  };
  img.onerror = () => {
    if (callback) callback(false);
  };
  img.src = data;
}

document.addEventListener("DOMContentLoaded", () => {
  const libraryView = document.getElementById("libraryView");
  const colorView = document.getElementById("colorView");
  const grid = document.getElementById("pageGrid");
  const emptyState = document.getElementById("emptyState");
  const starsEl = document.getElementById("shopStars");

  const draw = document.getElementById("colorLayer");
  const dctx = draw.getContext("2d");
  const previewLayer = document.getElementById("previewLayer");
  const pctx = previewLayer.getContext("2d");
  const lineArtImg = document.getElementById("lineArtImg");

  const eraserBtn = document.getElementById("eraser");
  const clearBtn = document.getElementById("clear");
  const undoBtn = document.getElementById("undo");
  const pal = document.getElementById("palette");

  let currentColor = COLORS[0];
  let currentLineWidth = 22;
  let erasing = false;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let firstSwatchBtn = null;
  let currentPage = null;
  let history = [];

  function saveHistory() {
    history.push(draw.toDataURL("image/png"));
    if (history.length > 20) history.shift();
  }

  function restoreHistory() {
    const last = history.pop();
    if (!last) return;

    const img = new Image();
    img.onload = () => {
      dctx.clearRect(0, 0, draw.width, draw.height);
      dctx.drawImage(img, 0, 0, draw.width, draw.height);
      if (currentPage) saveDrawing(currentPage.id, draw);
    };
    img.src = last;
  }

  if (undoBtn) {
    undoBtn.onclick = restoreHistory;
  }

document.addEventListener("DOMContentLoaded", () => {
  const libraryView = document.getElementById("libraryView");
  const colorView = document.getElementById("colorView");
  const grid = document.getElementById("pageGrid");
  const emptyState = document.getElementById("emptyState");
  const starsEl = document.getElementById("shopStars");

  const draw = document.getElementById("colorLayer");
  const dctx = draw.getContext("2d");
  const lineArtImg = document.getElementById("lineArtImg");

  const eraserBtn = document.getElementById("eraser");
  const clearBtn = document.getElementById("clear");
  const pal = document.getElementById("palette");

  let currentColor = COLORS[0];
  let currentLineWidth = 22;
  let erasing = false;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let firstSwatchBtn = null;
  let currentPage = null;

  document.getElementById("backToLibrary").onclick = showLibrary;

  function updateStars() {
    if (!starsEl) return;
    const progress = getProgress();
    starsEl.textContent = progress.stars || 0;
  }

  function openRequestedPageIfUnlocked() {
    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");
    if (!openId) return;

    const page = PAGES.find(p => p.id === openId);
    if (!page) return;
    if (!isPurchased(page.id)) return;

    openPage(page);
  }

  function buildGrid() {
    const progress = getProgress();
    grid.innerHTML = "";

    const ownedCount = PAGES.filter(page => isPurchased(page.id)).length;
    if (emptyState) {
      emptyState.style.display = ownedCount ? "none" : "block";
    }

    PAGES.forEach(page => {
      const purchased = isPurchased(page.id);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${page.img}" alt="${page.name}">
        <div>${page.name}</div>
      `;

      const badge = document.createElement("div");
      badge.className = "card-badge";

      if (purchased) {
        badge.textContent = "⭐ Owned";
        card.appendChild(badge);

        card.onclick = () => openPage(page);
      } else {
        badge.textContent = `⭐ ${page.cost}`;
        card.appendChild(badge);

        const unlockBtn = document.createElement("button");
        unlockBtn.className = "btn-soft";
        unlockBtn.style.marginTop = "8px";

        if (progress.stars >= page.cost) {
          unlockBtn.textContent = `Unlock ⭐ ${page.cost}`;
          unlockBtn.onclick = (e) => {
            e.stopPropagation();

            const ok = buyShopItem(page.id);
            if (!ok) {
              alert("Not enough stars yet ⭐");
              return;
            }

            updateStars();
            buildGrid();
          };
        } else {
          const need = page.cost - progress.stars;
          unlockBtn.textContent = `Need ${need} ⭐`;
          unlockBtn.disabled = true;
          unlockBtn.style.opacity = "0.65";
          unlockBtn.style.cursor = "not-allowed";
        }

        card.appendChild(unlockBtn);
      }

      grid.appendChild(card);
    });
  }

  function setEraser(on) {
    erasing = on;
    eraserBtn.classList.toggle("selected", erasing);
  }

  function selectSwatch(buttonEl) {
    document.querySelectorAll(".swatch").forEach(b => b.classList.remove("selected"));
    if (buttonEl) buttonEl.classList.add("selected");
  }

  function selectSizeButton(buttonEl) {
    document.querySelectorAll(".sizeBtn").forEach(b => b.classList.remove("selected"));
    if (buttonEl) buttonEl.classList.add("selected");
  }

  function openPage(page) {
    currentPage = page;
    libraryView.classList.add("hidden");
    colorView.classList.remove("hidden");
    document.getElementById("pageTitle").textContent = page.name;

    lineArtImg.src = page.img;
    dctx.clearRect(0, 0, draw.width, draw.height);
    dctx.globalCompositeOperation = "source-over";

    setEraser(false);
    currentColor = COLORS[0];
    currentLineWidth = 22;
    selectSwatch(firstSwatchBtn);
    selectSizeButton(document.querySelector('.sizeBtn[data-size="22"]'));

    loadDrawing(page.id, dctx, draw);
  }

  function showLibrary() {
    if (currentPage) saveDrawing(currentPage.id, draw);

    colorView.classList.add("hidden");
    libraryView.classList.remove("hidden");

    dctx.clearRect(0, 0, draw.width, draw.height);
    lineArtImg.removeAttribute("src");
    setEraser(false);
    currentPage = null;

    updateStars();
    buildGrid();
  }

  COLORS.forEach((hex, idx) => {
    const b = document.createElement("button");
    b.className = "swatch";
    b.style.background = hex;
    b.style.boxShadow = "0 6px 14px rgba(0,0,0,0.18), inset 0 0 0 3px rgba(255,255,255,0.22)";
    b.onclick = () => {
      currentColor = hex;
      setEraser(false);
      selectSwatch(b);
    };
    pal.appendChild(b);

    if (idx === 0) firstSwatchBtn = b;
  });

  selectSwatch(firstSwatchBtn);

  document.querySelectorAll(".sizeBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLineWidth = Number(btn.dataset.size);
      selectSizeButton(btn);
    });
  });

  function xy(e) {
    const r = draw.getBoundingClientRect();
    const scaleX = draw.width / r.width;
    const scaleY = draw.height / r.height;

    if (e.touches && e.touches.length) {
      return [
        (e.touches[0].clientX - r.left) * scaleX,
        (e.touches[0].clientY - r.top) * scaleY
      ];
    }

    return [
      (e.clientX - r.left) * scaleX,
      (e.clientY - r.top) * scaleY
    ];
  }

  function start(e) {
    e.preventDefault();
    saveHistory();
    drawing = true;
    [lastX, lastY] = xy(e);
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();

    const [x, y] = xy(e);

    dctx.save();
    dctx.lineWidth = currentLineWidth;
    dctx.lineCap = "round";
    dctx.lineJoin = "round";
    dctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    dctx.strokeStyle = erasing ? "rgba(0,0,0,1)" : currentColor;

    dctx.beginPath();
    dctx.moveTo(lastX, lastY);
    dctx.lineTo(x, y);
    dctx.stroke();
    dctx.restore();

    [lastX, lastY] = [x, y];
  }

  function end() {
    if (drawing && currentPage) saveDrawing(currentPage.id, draw);
    drawing = false;
  }

  draw.addEventListener("mousedown", start);
  draw.addEventListener("mousemove", move);
  draw.addEventListener("mouseup", end);
  draw.addEventListener("mouseleave", end);

  draw.addEventListener("touchstart", start, { passive: false });
  draw.addEventListener("touchmove", move, { passive: false });
  draw.addEventListener("touchend", end);
  draw.addEventListener("touchcancel", end);

  eraserBtn.onclick = () => {
    setEraser(true);
    selectSwatch(null);
  };

  clearBtn.onclick = () => {
    dctx.clearRect(0, 0, draw.width, draw.height);
    dctx.globalCompositeOperation = "source-over";
    setEraser(false);
    currentColor = COLORS[0];
    currentLineWidth = 22;
    selectSwatch(firstSwatchBtn);
    selectSizeButton(document.querySelector('.sizeBtn[data-size="22"]'));

    if (currentPage) saveDrawing(currentPage.id, draw);
  };

  lineArtImg.onerror = () => {
    console.error("Failed to load full-size coloring image:", lineArtImg.src);
  };

  updateStars();
  buildGrid();
  openRequestedPageIfUnlocked();
});
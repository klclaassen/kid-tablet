const SHOP_ITEMS = [
  { id: "page_boy1", type: "page", name: "Coloring: Boy", img: "pages/boy1.png", cost: 3 },
  { id: "page_dino1", type: "page", name: "Coloring: Dinosaur", img: "pages/dino1.png", cost: 3 },
  { id: "page_icecreamtruck", type: "page", name: "Coloring: Ice Cream Truck", img: "pages/icecreamtruck.png", cost: 3 },
  { id: "page_octopus", type: "page", name: "Coloring: Octopus", img: "pages/octopus.png", cost: 3 },
  { id: "page_truck1", type: "page", name: "Coloring: Truck", img: "pages/truck1.png", cost: 3 },
  { id: "page_turtle", type: "page", name: "Coloring: Turtle", img: "pages/turtle.png", cost: 3 }
];

function getShopState() {
  return loadJSON(STORAGE_KEYS.shop, { purchased: {} });
}

function setShopState(state) {
  saveJSON(STORAGE_KEYS.shop, state);
}

function isPurchased(id) {
  const shop = getShopState();
  return !!shop.purchased[id];
}

function gotoMyPages(openId = null) {
  const url = openId
    ? `coloring_pages.html?open=${encodeURIComponent(openId)}`
    : "coloring_pages.html";

  location.href = url;
}

function buyShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return false;
  if (isPurchased(itemId)) return true;

  const progress = getProgress();
  if (progress.stars < item.cost) return false;

  progress.stars -= item.cost;
  setProgress(progress);

  const shop = getShopState();
  shop.purchased[itemId] = {
    at: new Date().toISOString()
  };
  setShopState(shop);

  if (typeof logEvent === "function") {
    logEvent("shop_purchase", {
      itemId: item.id,
      itemName: item.name,
      cost: item.cost,
      type: item.type
    });
  }

  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  const shopStars = document.getElementById("shopStars");
  const shopItems = document.getElementById("shopItems");
  const backBtn = document.getElementById("backBtn");
  const myPagesBtn = document.getElementById("myPagesBtn");

  if (backBtn) {
    backBtn.onclick = () => {
      location.href = "index.html";
    };
  }

  if (myPagesBtn) {
    myPagesBtn.onclick = () => {
      gotoMyPages();
    };
  }

  function renderShop() {
    const progress = getProgress();

    if (shopStars) {
      shopStars.textContent = progress.stars;
    }

    if (!shopItems) return;
    shopItems.innerHTML = "";

    SHOP_ITEMS.forEach(item => {
      const purchased = isPurchased(item.id);

      const row = document.createElement("div");
      row.style.display = "grid";
      row.style.gridTemplateColumns = "90px 1fr auto";
      row.style.gap = "12px";
      row.style.alignItems = "center";
      row.style.padding = "14px";
      row.style.borderRadius = "20px";
      row.style.background = "rgba(255,255,255,0.12)";
      row.style.boxShadow = "inset 0 0 0 1px rgba(255,255,255,0.10)";

      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" style="width:90px;height:90px;object-fit:cover;border-radius:14px;background:#fff;">
        <div>
          <div style="font-size:22px;font-weight:900;">${item.name}</div>
          <div style="opacity:0.85;font-weight:700;">⭐ ${item.cost}</div>
        </div>
        <div></div>
      `;

      const actions = row.lastElementChild;
      const btn = document.createElement("button");
      btn.className = "btn-soft";

      if (purchased) {
        btn.textContent = "Open";
        btn.onclick = () => {
          gotoMyPages(item.id);
        };
      } else if (progress.stars >= item.cost) {
        btn.textContent = `Buy ⭐ ${item.cost}`;
        btn.onclick = () => {
          const ok = buyShopItem(item.id);
          if (!ok) {
            alert("Not enough stars yet ⭐");
            return;
          }
          renderShop();
        };
      } else {
        const need = item.cost - progress.stars;
        btn.textContent = `Need ${need} ⭐`;
        btn.disabled = true;
        btn.style.opacity = "0.65";
        btn.style.cursor = "not-allowed";
      }

      actions.appendChild(btn);
      shopItems.appendChild(row);
    });
  }

  renderShop();
});
// ======= search.js =======

let searchItems = [];

// Normalize strings for search
const norm = s =>
  (s || "").toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

// Redirect function
function goTo(item) {
  if (!item) return;

  // Festivals go directly to detail page
  if (item.type === "festival") {
    window.location.href = `festival-detail.html?festival=${encodeURIComponent(item.name)}`;
    return;
  }

  // Foods go to food detail page
  if (item.type === "food") {
    window.location.href = `food-detail.html?food=${encodeURIComponent(item.name)}`;
    return;
  }

  // Places go to place detail page
  if (item.type === "place") {
    window.location.href = `detail.html?region=${encodeURIComponent(item.region)}&place=${encodeURIComponent(item.name)}`;
    return;
  }

  // Regions go to destination page
  if (item.type === "region") {
    window.location.href = `des.html?region=${encodeURIComponent(item.name)}`;
    return;
  }
}

// Item creators
function makeRegionItem(region) {
  return { type: "region", name: region.name, link: "", region: null };
}
function makePlaceItem(regionName, place) {
  return { type: "place", name: place.name, link: "", region: regionName };
}
function makeFoodItem(food) {
  return { type: "food", name: food.name, link: "", region: "Food" };
}
function makeFestivalItem(festival) {
  return { type: "festival", name: festival.name, link: "", region: "Festival" };
}

// Load all data
Promise.all([
  fetch("des.json").then(r => r.json()).catch(() => []),
  fetch("foods.json").then(r => r.json()).catch(() => []),
  fetch("festivals.json").then(r => r.json()).catch(() => [])
]).then(([desData, foodsData, festivalsData]) => {

  searchItems = [];

  // Destinations
  desData.forEach(r => {
    if (r?.name) {
      searchItems.push(makeRegionItem(r));
      (r.places || []).forEach(p => {
        if (p?.name) searchItems.push(makePlaceItem(r.name, p));
      });
    }
  });

  // Foods
  foodsData.forEach(f => {
    if (f?.name) searchItems.push(makeFoodItem(f));
  });

  // Festivals
  festivalsData.forEach(f => {
    if (f?.name) searchItems.push(makeFestivalItem(f));
  });

});

// DOM elements
const searchInput = document.getElementById("searchInput");
const searchDropdown = document.getElementById("searchDropdown");

// Render dropdown
function renderDropdown(list) {
  searchDropdown.innerHTML = "";
  if (!list.length) {
    searchDropdown.innerHTML = `<li class="list-group-item text-center text-muted">No results found</li>`;
    searchDropdown.style.display = "block";
    return;
  }

  list.forEach(item => {
    const badgeClass =
      item.type === "region"
        ? "bg-primary"
        : item.type === "place"
        ? "bg-success"
        : item.type === "food"
        ? "bg-warning text-dark"
        : "bg-info text-dark";

    const label =
      item.type === "region"
        ? "State"
        : item.type === "place"
        ? "Place"
        : item.type === "food"
        ? "Food"
        : "Festival";

    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center justify-content-between";
    li.innerHTML = `
      <div class="d-flex align-items-center">
        <div>
          <span class="badge ${badgeClass} me-2">${label}</span>
          ${item.name}
          ${item.region ? `<br><small class="text-muted">${item.region}</small>` : ""}
        </div>
      </div>
      <i class="bi bi-arrow-right-short fs-4"></i>
    `;
    li.addEventListener("click", () => goTo(item));
    searchDropdown.appendChild(li);
  });

  searchDropdown.style.display = "block";
}

// Input event
searchInput.addEventListener("input", function () {
  const q = norm(this.value);
  if (!q) {
    searchDropdown.style.display = "none";
    return;
  }
  const results = searchItems.filter(it => norm(it.name).includes(q)).slice(0, 12);
  renderDropdown(results);
});

// Enter key
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const q = norm(searchInput.value);
    const match = searchItems.find(it => norm(it.name).includes(q));
    if (match) goTo(match);
    searchDropdown.style.display = "none";
  }
});

// Hide dropdown when clicking outside
document.addEventListener("click", e => {
  if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
    searchDropdown.style.display = "none";
  }
});

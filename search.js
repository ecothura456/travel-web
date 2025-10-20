/*// search.js
let searchItems = [];
let currentFiltered = [];

const norm = (s='') => s.toString().toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');

function makeItem(type, name, image, link, extra = '') {
  return { type, name, image: image || '', link, region: extra || null };
}

function goTo(item) {
  if (item?.link) window.location.href = item.link;
}

Promise.all([
  fetch('home.json').then(r => r.json()).catch(() => []),
  fetch('des.json').then(r => r.json()).catch(() => []),
  fetch('foods.json').then(r => r.json()).catch(() => []),
  fetch('festivals.json').then(r => r.json()).catch(() => [])
]).then(([home, des, foods, festivals]) => {
  home.forEach(p => searchItems.push(makeItem('Home', p.name, p.image, p.link)));
  des.forEach(r => {
    if (r?.name) searchItems.push(makeItem('Region', r.name, r.image, `des.html?region=${encodeURIComponent(r.name)}`));
    (r.places || []).forEach(p => {
      if (p?.name) searchItems.push(makeItem('Place', p.name, p.image, `detail.html?region=${encodeURIComponent(r.name)}&place=${encodeURIComponent(p.name)}`, r.name));
    });
  });
  foods.forEach(f => searchItems.push(makeItem('Food', f.name, f.image, f.link)));
  festivals.forEach(f => searchItems.push(makeItem('Festival', f.name, f.image, f.link)));
});

const searchInput = document.getElementById("searchInput");
const searchDropdown = document.getElementById("searchDropdown");

function renderDropdown(list) {
  searchDropdown.innerHTML = "";
  if (!list.length) {
    searchDropdown.innerHTML = `<li class="list-group-item text-center text-muted">No results found</li>`;
    searchDropdown.style.display = "block";
    return;
  }
  list.forEach(item => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center justify-content-between";
    li.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.image}" class="rounded-circle me-2" width="40" height="40" alt="${item.name}">
        <div>
          <span class="badge bg-${
            item.type === 'Food' ? 'warning' :
            item.type === 'Festival' ? 'info' :
            item.type === 'Home' ? 'secondary' :
            item.type === 'Region' ? 'primary' :
            'success'
          } me-2">${item.type}</span>
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

searchInput.addEventListener("input", function () {
  const q = norm(this.value);
  if (!q) return (searchDropdown.style.display = "none");
  const results = searchItems.filter(it => norm(it.name).includes(q)).slice(0, 12);
  renderDropdown(results);
  currentFiltered = results;
});

searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && currentFiltered.length) {
    e.preventDefault();
    goTo(currentFiltered[0]);
    searchDropdown.style.display = "none";
  }
});

document.addEventListener("click", e => {
  if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target))
    searchDropdown.style.display = "none";
});*/

  let regionsRaw = [];          // raw regions array from des.json
  let searchItems = [];         // flattened list of regions + places for search
  let currentFiltered = [];     // current suggestions for dropdown

  // Normalize helper (case/spacing tolerant)
  const norm = (s='') =>
    s.toString()
     .toLowerCase()
     .normalize('NFKD')
     .replace(/[\u0300-\u036f]/g, '')
     .replace(/[^a-z0-9]+/g, '');

  // Build a search item object
  // type: 'region' or 'place'
  // For region → link to des.html?region=<name>
  // For place  → link to detail.html?region=<region>&place=<name>
  function makeRegionItem(region) {
    return {
      type: 'region',
      name: region.name,
      image: region.image || '',
      region: null,
      link: `des.html?region=${encodeURIComponent(region.name)}`
    };
  }
  function makePlaceItem(regionName, place) {
    return {
      type: 'place',
      name: place.name,
      image: place.image || '',
      region: regionName,
      link: `detail.html?region=${encodeURIComponent(regionName)}&place=${encodeURIComponent(place.name)}`
    };
  }

  // Safe redirect (uses precomputed link)
  function goTo(item) {
    if (!item) return;
    window.location.href = item.link;
  }

  // Load JSON file (des.json), and flatten to regions + places
  fetch("des.json")
    .then(response => response.json())
    .then(data => {
      regionsRaw = data || [];
      // Flatten
      searchItems = [];
      regionsRaw.forEach(r => {
        if (!r || !r.name) return;
        searchItems.push(makeRegionItem(r));
        (r.places || []).forEach(p => {
          if (!p || !p.name) return;
          searchItems.push(makePlaceItem(r.name, p));
        });
      });
      // console.log("Indexed items:", searchItems.map(i => `${i.type}:${i.name}`));
    })
    .catch(error => console.error("Error loading JSON:", error));

  const searchInput = document.getElementById("searchInput");
  const searchDropdown = document.getElementById("searchDropdown");

  // Render dropdown list
  function renderDropdown(list) {
    searchDropdown.innerHTML = "";
    if (!list.length) {
      searchDropdown.innerHTML = `<li class="list-group-item text-center text-muted">No results found</li>`;
      searchDropdown.style.display = "block";
      return;
    }
    list.forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex align-items-center justify-content-between";
      li.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${item.image}" class="rounded-circle me-2" width="40" height="40" alt="${item.name}">
          <div>
            <span class="badge ${item.type === 'region' ? 'bg-primary' : 'bg-success'} me-2">
              ${item.type === 'region' ? 'State' : 'Place'}
            </span>
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

  // Typing search
  searchInput.addEventListener("input", function () {
    const q = this.value.toLowerCase().trim();
    currentFiltered = [];
    if (!q) {
      searchDropdown.style.display = "none";
      searchDropdown.innerHTML = "";
      return;
    }

    // Rank: exact → startsWith → includes; places & regions mixed
    const nQ = norm(q);
    const exact = [];
    const starts = [];
    const incl = [];
    for (const it of searchItems) {
      const key = norm(it.name);
      if (key === nQ) exact.push(it);
      else if (key.startsWith(nQ)) starts.push(it);
      else if (key.includes(nQ)) incl.push(it);
    }
    currentFiltered = [...exact, ...starts, ...incl].slice(0, 12);
    renderDropdown(currentFiltered);
  });

  // Enter behavior: first suggestion OR best match by normalized name
  searchInput.addEventListener("keydown", function (event) {
    
    if (event.key !== "Enter") return;
    event.preventDefault();

    const raw = this.value.trim();
    if (!raw) return;

    // 1) If dropdown open and items present → open first
    if (searchDropdown.style.display === "block" && currentFiltered.length) {
      goTo(currentFiltered[0]);
      searchDropdown.style.display = "none";
      this.blur();
      return;
    }

    // 2) Best match from all items
    const nQ = norm(raw);
    const proj = searchItems.map(it => ({ it, key: norm(it.name) }));
    let hit = proj.find(x => x.key === nQ)
           || proj.find(x => x.key.startsWith(nQ))
           || proj.find(x => x.key.includes(nQ));
    if (hit) {
      goTo(hit.it);
      searchDropdown.style.display = "none";
      this.blur();
      return;
    }

    alert("Destination or place not found!");
    searchDropdown.style.display = "none";
    this.blur();
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.style.display = "none";
    }
  });

/**
 * Pigma World — Complete Explore Module Controller
 * Framework: Learn → Explore → Book
 * Modular, expandable architecture supporting global destinations
 */

import { destinations } from '../data/destinations.js';
import { products } from '../data/products.js';

// The 10 Official Categories with Icons, Descriptions & Global Preview Imagery
export const EXPLORE_CATEGORIES = [
  {
    id: "Tours & Activities",
    title: "Tours & Activities",
    icon: "🗺️",
    desc: "Guided expeditions, desert safaris, aerial flights & cultural immersion",
    heroImage: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Luxor, Egypt — Aerial Nile Sunrise",
    heroDesc: "Breathtaking 360-degree hot air balloon ascents over ancient tombs and the sacred Nile."
  },
  {
    id: "Hotels & Stays",
    title: "Hotels & Stays",
    icon: "🏨",
    desc: "Luxury overwater villas, historic palaces & boutique retreats",
    heroImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Maldives — Azure Lagoon Sunset Villas",
    heroDesc: "Perched above crystal turquoise waters with private infinity plunge pools and dedicated butlers."
  },
  {
    id: "Restaurants & Dining",
    title: "Restaurants & Dining",
    icon: "🍽️",
    desc: "Michelin-starred tasting counters, skyline gastronomy & local dining",
    heroImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Tokyo, Japan — 3-Star Michelin Omakase",
    heroDesc: "Master artisanal sushi tasting crafted with daily Toyosu Market seafood in Ginza."
  },
  {
    id: "Cruises & Boats",
    title: "Cruises & Boats",
    icon: "⛵",
    desc: "Nile feluccas, Seine glass dinner cruises & coastal catamarans",
    heroImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Luxor & Nile Valley — Timeless Felucca Sails",
    heroDesc: "Silent, wind-powered navigation along ancient riverbanks as sunset warms Theban ridges."
  },
  {
    id: "Yachts & Charters",
    title: "Yachts & Charters",
    icon: "🛥️",
    desc: "Private mega-catamarans, Riva speedboats & VIP coastal voyages",
    heroImage: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Indian Ocean & Capri — VIP Ocean Charters",
    heroDesc: "Cruise secluded atoll lagoons, observe wild dolphins, and enjoy champagne sundecks."
  },
  {
    id: "Tour Guides",
    title: "Tour Guides",
    icon: "🎓",
    desc: "Academic Egyptologists, certified art historians & local masters",
    heroImage: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Valley of the Kings — Licensed Egyptologists",
    heroDesc: "Unlock 3,000-year-old hieroglyphic secrets with certified academic historians."
  },
  {
    id: "Transportation",
    title: "Transportation",
    icon: "🚅",
    desc: "VIP airport chauffeurs, Shinkansen bullet trains & private transfers",
    heroImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Japan Bullet Trains & VIP Mercedes Fleets",
    heroDesc: "Punctual, first-class high-speed rail and executive chauffeur transfers worldwide."
  },
  {
    id: "Tickets & Attractions",
    title: "Tickets & Attractions",
    icon: "🎟️",
    desc: "Skip-the-line museum tickets, Colosseum arena passes & landmark fast-tracks",
    heroImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Rome & GEM Cairo — VIP Priority Access",
    heroDesc: "Bypass public queues to witness gladiatorial arenas and pharaonic treasures."
  },
  {
    id: "Travel Services",
    title: "Travel Services",
    icon: "📶",
    desc: "Global 5G eSIM connectivity, comprehensive travel insurance & concierge",
    heroImage: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Worldwide Connected — 150+ Countries 5G",
    heroDesc: "Seamless digital eSIM activation and comprehensive global medical coverage."
  },
  {
    id: "Events & Experiences",
    title: "Events & Experiences",
    icon: "🎋",
    desc: "Sacred water purifications, Gion tea ceremonies & cultural celebrations",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
    heroTitle: "Kyoto & Ubud — Living Sacred Traditions",
    heroDesc: "Immerse in historic teahouse recitals, spiritual sound baths, and ancestral rituals."
  }
];

// Explore Module State
export const ExploreState = {
  allProducts: products,
  destinations: destinations,
  selectedCategory: "all",
  selectedCountry: "all",
  selectedDestination: "all",
  searchKeyword: "",
  filterDate: "",
  filterGuests: "any",
  filterMaxPrice: "all",
  filterMinRating: "0",
  filterLanguage: "all",
  sortOrder: "featured"
};

// DOM Elements
let categoryContainer = null;
let heroPreviewImg = null;
let heroCategoryLabel = null;
let heroDestinationTitle = null;
let heroDestinationDesc = null;
let countrySelect = null;
let destinationSelect = null;
let exploreSearchInput = null;
let resetFiltersBtn = null;
let filterDateInput = null;
let filterGuestsSelect = null;
let filterMaxPriceSelect = null;
let filterMinRatingSelect = null;
let filterLanguageSelect = null;
let sortOrderSelect = null;
let exploreListingsGrid = null;
let resultsCountBadge = null;
let resultsCountTitle = null;
let activeFiltersSummary = null;
let productDetailModal = null;
let modalContentBody = null;
let modalCloseBtn = null;

// Initialize on DOM Ready
export function initExploreModule() {
  cacheDOMElements();
  renderCategories();
  populateCountrySelect();
  populateCitySelect();
  bindExploreEvents();
  applyExploreFilters();
}

function cacheDOMElements() {
  categoryContainer = document.getElementById("categoryContainer");
  heroPreviewImg = document.getElementById("heroPreviewImg");
  heroCategoryLabel = document.getElementById("heroCategoryLabel");
  heroDestinationTitle = document.getElementById("heroDestinationTitle");
  heroDestinationDesc = document.getElementById("heroDestinationDesc");
  countrySelect = document.getElementById("countrySelect");
  destinationSelect = document.getElementById("destinationSelect");
  exploreSearchInput = document.getElementById("exploreSearchInput");
  resetFiltersBtn = document.getElementById("resetFiltersBtn");
  filterDateInput = document.getElementById("filterDate");
  filterGuestsSelect = document.getElementById("filterGuests");
  filterMaxPriceSelect = document.getElementById("filterMaxPrice");
  filterMinRatingSelect = document.getElementById("filterMinRating");
  filterLanguageSelect = document.getElementById("filterLanguage");
  sortOrderSelect = document.getElementById("sortOrder");
  exploreListingsGrid = document.getElementById("exploreListingsGrid");
  resultsCountBadge = document.getElementById("resultsCountBadge");
  resultsCountTitle = document.getElementById("resultsCountTitle");
  activeFiltersSummary = document.getElementById("activeFiltersSummary");
  productDetailModal = document.getElementById("productDetailModal");
  modalContentBody = document.getElementById("modalContentBody");
  modalCloseBtn = document.getElementById("modalCloseBtn");
}

// 1. Render Categories & Vertical Sidebar
export function renderCategories() {
  if (!categoryContainer) return;

  const allItem = `
    <div class="explore-cat ${ExploreState.selectedCategory === 'all' ? 'active' : ''}" data-category-id="all">
      <div class="cat-icon">🌐</div>
      <div class="cat-text">
        <div class="cat-title">All Categories</div>
        <div class="cat-desc">Browse entire global catalog across 10 sectors</div>
      </div>
    </div>
  `;

  const items = EXPLORE_CATEGORIES.map(cat => {
    const isActive = ExploreState.selectedCategory === cat.id;
    return `
      <div class="explore-cat ${isActive ? 'active' : ''}" data-category-id="${cat.id}">
        <div class="cat-icon">${cat.icon}</div>
        <div class="cat-text">
          <div class="cat-title">${cat.title}</div>
          <div class="cat-desc">${cat.desc}</div>
        </div>
      </div>
    `;
  }).join('');

  categoryContainer.innerHTML = allItem + items;

  // Bind click & hover events on category cards
  const catCards = categoryContainer.querySelectorAll('.explore-cat');
  catCards.forEach(card => {
    const catId = card.getAttribute('data-category-id');

    // Click: Select category
    card.addEventListener('click', () => {
      handleCategorySelect(catId);
    });

    // Hover Effect: Cinematic fade/zoom preview without click
    card.addEventListener('mouseenter', () => {
      handleCategoryHover(catId);
    });
  });
}

// Hover Effect: Transition Hero Image & Story
export function handleCategoryHover(categoryId) {
  if (!heroPreviewImg) return;

  let previewData = null;
  if (categoryId === 'all') {
    previewData = {
      heroImage: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1600&q=80",
      heroTitle: "Pigma World — Global Tourism Marketplace",
      heroDesc: "Discover verified 7-star standard experiences across Japan, Maldives, Egypt, Europe, and beyond.",
      title: "Global Marketplace"
    };
  } else {
    previewData = EXPLORE_CATEGORIES.find(c => c.id === categoryId);
  }

  if (!previewData) return;

  // Cinematic fade effect
  heroPreviewImg.style.opacity = '0.35';
  heroPreviewImg.style.transform = 'scale(1.05)';

  setTimeout(() => {
    heroPreviewImg.src = previewData.heroImage;
    if (heroCategoryLabel) heroCategoryLabel.innerText = previewData.title || categoryId;
    if (heroDestinationTitle) heroDestinationTitle.innerText = previewData.heroTitle;
    if (heroDestinationDesc) heroDestinationDesc.innerText = previewData.heroDesc;
    heroPreviewImg.style.opacity = '1';
    heroPreviewImg.style.transform = 'scale(1.0)';
  }, 180);
}

// Category Selection Handler
export function handleCategorySelect(categoryId) {
  ExploreState.selectedCategory = categoryId;
  const cards = categoryContainer.querySelectorAll('.explore-cat');
  cards.forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-category-id') === categoryId);
  });
  handleCategoryHover(categoryId);
  applyExploreFilters();
}

// 2. Cascade Journey: Country → City / Destination
export function populateCountrySelect() {
  if (!countrySelect) return;
  const countries = Array.from(new Set(ExploreState.destinations.map(d => d.country))).sort();
  countrySelect.innerHTML = `<option value="all">All Countries (Global)</option>` +
    countries.map(c => `<option value="${c}">${c}</option>`).join('');
}

export function populateCitySelect() {
  if (!destinationSelect) return;
  let filtered = ExploreState.destinations;
  if (ExploreState.selectedCountry !== 'all') {
    filtered = filtered.filter(d => d.country === ExploreState.selectedCountry);
  }

  destinationSelect.innerHTML = `<option value="all">All Destinations (${filtered.length})</option>` +
    filtered.map(d => `<option value="${d.id}">${d.name}, ${d.country}</option>`).join('');
}

export function handleCountryChange(country) {
  ExploreState.selectedCountry = country;
  ExploreState.selectedDestination = 'all';
  populateCitySelect();
  applyExploreFilters();
}

export function handleCityChange(destId) {
  ExploreState.selectedDestination = destId;
  applyExploreFilters();
}

export function handleKeywordSearch(keyword) {
  ExploreState.searchKeyword = keyword.trim().toLowerCase();
  applyExploreFilters();
}

// 3. Dynamic Filter & Results Evaluation
export function applyExploreFilters() {
  let list = [...ExploreState.allProducts];

  // 1. Country filter
  if (ExploreState.selectedCountry !== 'all') {
    list = list.filter(p => p.country === ExploreState.selectedCountry);
  }

  // 2. Destination/City filter
  if (ExploreState.selectedDestination !== 'all') {
    list = list.filter(p => p.destinationId.toLowerCase() === ExploreState.selectedDestination.toLowerCase());
  }

  // 3. Category filter
  if (ExploreState.selectedCategory !== 'all') {
    list = list.filter(p => p.category === ExploreState.selectedCategory);
  }

  // 4. Keyword search
  if (ExploreState.searchKeyword) {
    const q = ExploreState.searchKeyword;
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.destinationName && p.destinationName.toLowerCase().includes(q)) ||
      (p.country && p.country.toLowerCase().includes(q)) ||
      (p.highlights && p.highlights.some(h => h.toLowerCase().includes(q)))
    );
  }

  // 5. Max Price Filter
  if (ExploreState.filterMaxPrice !== 'all') {
    const maxVal = parseFloat(ExploreState.filterMaxPrice);
    list = list.filter(p => {
      const usd = p.priceUsdEstimate || p.price;
      return usd <= maxVal;
    });
  }

  // 6. 1-7 Star Rating Filter
  if (ExploreState.filterMinRating !== '0') {
    const minR = parseFloat(ExploreState.filterMinRating);
    list = list.filter(p => (p.rating || 0) >= minR);
  }

  // 7. Guests Filter
  if (ExploreState.filterGuests !== 'any') {
    const reqGuests = parseInt(ExploreState.filterGuests, 10);
    list = list.filter(p => {
      const maxG = p.maxGroupSize || 10;
      return maxG >= reqGuests;
    });
  }

  // 8. Language Filter
  if (ExploreState.filterLanguage !== 'all') {
    list = list.filter(p => p.languages && p.languages.includes(ExploreState.filterLanguage));
  }

  // 9. Sorting
  if (ExploreState.sortOrder === 'rating_desc') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (ExploreState.sortOrder === 'price_asc') {
    list.sort((a, b) => (a.priceUsdEstimate || a.price) - (b.priceUsdEstimate || b.price));
  } else if (ExploreState.sortOrder === 'price_desc') {
    list.sort((a, b) => (b.priceUsdEstimate || b.price) - (a.priceUsdEstimate || a.price));
  }

  renderListingCards(list);
  updateResultsSummary(list.length);
}

// 4. Results Grid & Listing Cards
export function renderListingCards(items) {
  if (!exploreListingsGrid) return;

  if (!items || items.length === 0) {
    exploreListingsGrid.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-icon">🌍</div>
        <h3>No listings available yet</h3>
        <p>No verified marketplace listings match the selected filters or destination criteria. Connect to the live catalog or reset your discovery filters below.</p>
        <button class="btn-reset-filters" id="emptyResetBtn">Reset All Filters</button>
      </div>
    `;
    const btn = document.getElementById("emptyResetBtn");
    if (btn) btn.addEventListener("click", resetAllFilters);
    return;
  }

  exploreListingsGrid.innerHTML = items.map(p => {
    // 7-Star visual rendering
    const starScore = Number(p.rating || 6.5).toFixed(1);
    const starCount = Math.min(7, Math.max(1, Math.round(p.rating || 6.5)));
    const starsHtml = '★'.repeat(starCount) + '☆'.repeat(7 - starCount);

    const badgeText = p.badges && p.badges[0] ? p.badges[0] : (p.category || 'Verified');
    const pricingUnit = p.pricingModel ? p.pricingModel : 'per person';

    return `
      <div class="listing-card" data-product-id="${p.id}">
        <div class="img">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <span class="badge">${badgeText}</span>
          <span class="loc-pill">📍 ${p.destinationName || p.country}</span>
        </div>
        <div class="body">
          <div class="meta">
            <span class="cat-pill">${p.category}</span>
            <span class="duration-pill">⏱️ ${p.duration}</span>
          </div>

          <h3 class="title">${p.title}</h3>
          <p class="desc">${p.description}</p>

          <!-- 7-Star Rating System -->
          <div class="rating-row">
            <div class="star-rating-7" title="${starScore} out of 7 Stars">
              <span class="stars-gold">${starsHtml}</span>
              <span class="score-badge">${starScore}/7.0</span>
            </div>
            <span class="review-count">(${p.reviewCount} verified reviews)</span>
          </div>

          <div class="foot">
            <div class="price-wrap">
              <span class="price-val">${Number(p.price).toLocaleString()} ${p.currency}</span>
              <span class="price-sub">/ ${pricingUnit} (~$${p.priceUsdEstimate || Math.round(p.price/49)})</span>
            </div>
            <button class="btn-card-details" data-id="${p.id}">View Details</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind View Details buttons
  const detailButtons = exploreListingsGrid.querySelectorAll('.btn-card-details');
  detailButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openExploreDetailModal(id);
    });
  });

  const cards = exploreListingsGrid.querySelectorAll('.listing-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-product-id');
      openExploreDetailModal(id);
    });
  });
}

function updateResultsSummary(count) {
  if (resultsCountBadge) resultsCountBadge.innerText = `${count} experiences`;
  if (resultsCountTitle) {
    if (ExploreState.selectedCategory !== 'all') {
      resultsCountTitle.innerText = `${ExploreState.selectedCategory} (${count})`;
    } else {
      resultsCountTitle.innerText = `All Available Experiences (${count})`;
    }
  }

  if (activeFiltersSummary) {
    const parts = [];
    if (ExploreState.selectedCountry !== 'all') parts.push(`Country: ${ExploreState.selectedCountry}`);
    if (ExploreState.selectedDestination !== 'all') parts.push(`City: ${ExploreState.selectedDestination}`);
    if (ExploreState.selectedCategory !== 'all') parts.push(`Category: ${ExploreState.selectedCategory}`);
    if (ExploreState.filterMinRating !== '0') parts.push(`Min Rating: ${ExploreState.filterMinRating}+`);
    if (ExploreState.filterMaxPrice !== 'all') parts.push(`Max Price: $${ExploreState.filterMaxPrice}`);

    activeFiltersSummary.innerText = parts.length > 0 ? parts.join(" • ") : "Showing All Global Catalog";
  }
}

// 5. Product Details Modal
export function openExploreDetailModal(productId) {
  const p = ExploreState.allProducts.find(item => item.id === productId);
  if (!p || !productDetailModal || !modalContentBody) return;

  const starScore = Number(p.rating || 6.5).toFixed(1);
  const starCount = Math.min(7, Math.max(1, Math.round(p.rating || 6.5)));
  const starsHtml = '★'.repeat(starCount) + '☆'.repeat(7 - starCount);

  const inclusionsHtml = (p.inclusions || []).map(i => `<li>✓ ${i}</li>`).join('');
  const exclusionsHtml = (p.exclusions || []).map(e => `<li>✕ ${e}</li>`).join('');
  const highlightsHtml = (p.highlights || []).map(h => `<li>✨ ${h}</li>`).join('');

  modalContentBody.innerHTML = `
    <div class="modal-hero-cover">
      <img src="${p.image}" alt="${p.title}">
      <div class="modal-cover-overlay">
        <span class="cat-pill">${p.category}</span>
        <h2>${p.title}</h2>
        <div class="modal-rating-badge">
          <span class="stars-gold">${starsHtml}</span>
          <span>${starScore} / 7.0 Standard Rating</span>
          <span>(${p.reviewCount} Reviews)</span>
        </div>
      </div>
    </div>

    <div class="modal-details-body">
      <div class="modal-quick-meta">
        <div><strong>📍 Location:</strong> ${p.destinationName || p.country}</div>
        <div><strong>⏱️ Duration:</strong> ${p.duration}</div>
        <div><strong>🛡️ Supplier:</strong> ${p.supplierName}</div>
        <div><strong>👥 Max Capacity:</strong> Up to ${p.maxGroupSize || 8} guests</div>
        <div><strong>🌐 Languages:</strong> ${(p.languages || ['English']).join(', ')}</div>
      </div>

      <div class="modal-section">
        <h4>Experience Overview</h4>
        <p>${p.description}</p>
      </div>

      <div class="modal-section">
        <h4>Signature Highlights</h4>
        <ul class="modal-list highlights-list">${highlightsHtml}</ul>
      </div>

      <div class="modal-inclusions-grid">
        <div class="inc-box">
          <h5>Included</h5>
          <ul class="modal-list">${inclusionsHtml}</ul>
        </div>
        <div class="exc-box">
          <h5>Not Included</h5>
          <ul class="modal-list">${exclusionsHtml}</ul>
        </div>
      </div>

      <div class="modal-booking-box">
        <div class="booking-price-line">
          <div>
            <span class="label">Price</span>
            <div class="value">${Number(p.price).toLocaleString()} ${p.currency} <small>(~$${p.priceUsdEstimate || Math.round(p.price/49)} / ${p.pricingModel || 'person'})</small></div>
          </div>
          <div class="policy-note">
            <span>🛡️ ${p.cancellationPolicy || 'Verified supplier reservation'}</span>
          </div>
        </div>

        <div class="booking-action-row">
          <button class="btn-modal-reserve" id="modalReserveBtn" data-id="${p.id}">
            Book Experience (Step 3: Book)
          </button>
          <button class="btn-modal-companion" id="modalCompanionBtn" data-title="${encodeURIComponent(p.title)}">
            🔗 Ask Aibou About This
          </button>
        </div>
      </div>
    </div>
  `;

  // Reserve button hook
  const reserveBtn = document.getElementById("modalReserveBtn");
  if (reserveBtn) {
    reserveBtn.addEventListener("click", () => {
      alert(`✅ Ready to Book: "${p.title}"\nSupplier: ${p.supplierName}\nOfficial Price: ${p.price} ${p.currency}\nStatus: Verified Availability`);
    });
  }

  // Companion ask hook
  const companionBtn = document.getElementById("modalCompanionBtn");
  if (companionBtn) {
    companionBtn.addEventListener("click", () => {
      closeExploreDetailModal();
      const aibouPanel = document.getElementById("aibouPanel");
      if (aibouPanel) aibouPanel.style.display = 'block';
      const input = document.getElementById("aibouTextInput");
      if (input) {
        input.value = `Tell me more about ${p.title} and what makes it special!`;
        input.focus();
      }
    });
  }

  productDetailModal.classList.add("open");
}

export function closeExploreDetailModal() {
  if (productDetailModal) productDetailModal.classList.remove("open");
}

export function resetAllFilters() {
  ExploreState.selectedCategory = "all";
  ExploreState.selectedCountry = "all";
  ExploreState.selectedDestination = "all";
  ExploreState.searchKeyword = "";
  ExploreState.filterDate = "";
  ExploreState.filterGuests = "any";
  ExploreState.filterMaxPrice = "all";
  ExploreState.filterMinRating = "0";
  ExploreState.filterLanguage = "all";
  ExploreState.sortOrder = "featured";

  if (exploreSearchInput) exploreSearchInput.value = "";
  if (countrySelect) countrySelect.value = "all";
  if (destinationSelect) destinationSelect.value = "all";
  if (filterDateInput) filterDateInput.value = "";
  if (filterGuestsSelect) filterGuestsSelect.value = "any";
  if (filterMaxPriceSelect) filterMaxPriceSelect.value = "all";
  if (filterMinRatingSelect) filterMinRatingSelect.value = "0";
  if (filterLanguageSelect) filterLanguageSelect.value = "all";
  if (sortOrderSelect) sortOrderSelect.value = "featured";

  renderCategories();
  populateCitySelect();
  applyExploreFilters();
}

// 6. Bind Event Listeners
function bindExploreEvents() {
  if (countrySelect) {
    countrySelect.addEventListener("change", (e) => handleCountryChange(e.target.value));
  }
  if (destinationSelect) {
    destinationSelect.addEventListener("change", (e) => handleCityChange(e.target.value));
  }
  if (exploreSearchInput) {
    exploreSearchInput.addEventListener("input", (e) => handleKeywordSearch(e.target.value));
  }
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetAllFilters);
  }
  if (filterGuestsSelect) {
    filterGuestsSelect.addEventListener("change", (e) => {
      ExploreState.filterGuests = e.target.value;
      applyExploreFilters();
    });
  }
  if (filterMaxPriceSelect) {
    filterMaxPriceSelect.addEventListener("change", (e) => {
      ExploreState.filterMaxPrice = e.target.value;
      applyExploreFilters();
    });
  }
  if (filterMinRatingSelect) {
    filterMinRatingSelect.addEventListener("change", (e) => {
      ExploreState.filterMinRating = e.target.value;
      applyExploreFilters();
    });
  }
  if (filterLanguageSelect) {
    filterLanguageSelect.addEventListener("change", (e) => {
      ExploreState.filterLanguage = e.target.value;
      applyExploreFilters();
    });
  }
  if (sortOrderSelect) {
    sortOrderSelect.addEventListener("change", (e) => {
      ExploreState.sortOrder = e.target.value;
      applyExploreFilters();
    });
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeExploreDetailModal);
  }
  if (productDetailModal) {
    productDetailModal.addEventListener("click", (e) => {
      if (e.target === productDetailModal) closeExploreDetailModal();
    });
  }
}

// Expose ExploreModule on window so legacy scripts (app.js) detect the modern module
if (typeof window !== 'undefined') {
  window.ExploreModule = {
    initExploreModule,
    renderCategories,
    applyExploreFilters,
    renderListingCards,
    openExploreDetailModal,
    closeExploreDetailModal,
    resetAllFilters,
    ExploreState,
    EXPLORE_CATEGORIES
  };
}

// Auto bootstrap on document load
if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", initExploreModule);
}

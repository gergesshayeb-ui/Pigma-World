/**
 * Pigma Tours — Core Frontend Application Controller
 * Version 1.0 (Foundational Marketplace & AI Companion)
 * Zero EGP spending - pure clean vanilla JavaScript
 */

// Application State
const AppState = {
  products: [],
  destinations: [],
  selectedCategory: 'all',
  selectedDestination: 'all',
  searchQuery: '',
  favorites: JSON.parse(localStorage.getItem('pigma_favs') || '[]'),
  activeBookings: JSON.parse(localStorage.getItem('pigma_bookings') || '[]'),
  isVoiceMode: false,
  isSpeaking: false,
  isListening: false,
  chatHistory: [],
  companionMinimized: false
};

// DOM References
const DOM = {
  startOverlay: document.getElementById('startOverlay'),
  startVoiceBtn: document.getElementById('startVoiceBtn'),
  startTextBtn: document.getElementById('startTextBtn'),

  // Products & Destinations (handled by js/explore.js in the Explore module)
  productsGrid: document.getElementById('exploreGrid') || document.getElementById('exploreListingsGrid'),
  destinationsGrid: document.getElementById('destinationsGrid'),
  categoryPills: document.querySelectorAll('.category-pill'),
  searchForm: document.getElementById('searchForm'),
  searchDestSelect: document.getElementById('searchDestSelect'),
  searchCategorySelect: document.getElementById('searchCategorySelect'),
  searchInput: document.getElementById('searchInput'),

  // Modals & Drawers
  productModal: document.getElementById('productModal') || document.getElementById('exploreModal'),
  modalBody: document.getElementById('modalBody') || document.getElementById('exploreModalContent'),
  modalCloseBtn: document.getElementById('modalCloseBtn') || document.getElementById('exploreModalClose'),
  tripDrawer: document.getElementById('tripDrawer'),
  tripBadge: document.getElementById('tripBadge'),
  favBadge: document.getElementById('favBadge'),

  // Aibou AI Companion
  aibouDock: document.getElementById('aibouDock'),
  aibouChatPanel: document.getElementById('aibouChatPanel'),
  aibouLauncherBtn: document.getElementById('aibouLauncherBtn'),
  aibouMinimizeBtn: document.getElementById('aibouMinimizeBtn'),
  aibouMessages: document.getElementById('aibouMessages'),
  aibouStatusText: document.getElementById('aibouStatusText'),
  aibouStatusDot: document.getElementById('aibouStatusDot'),
  aibouTextInput: document.getElementById('aibouTextInput'),
  aibouSendBtn: document.getElementById('aibouSendBtn'),
  aibouMicBtn: document.getElementById('aibouMicBtn'),
  navAibouBtn: document.getElementById('navAibouBtn'),

  // Companion layout controls
  mainStage: document.getElementById('mainStage'),
  exploreBtn: document.getElementById('exploreBtn'),
  joinUsBtn: document.getElementById('joinUsBtn'),
  langBtn: document.getElementById('langBtn'),
  aibouBtn: document.getElementById('aibouBtn'),
  chatInput: document.getElementById('chatInput'),
  chatSend: document.getElementById('chatSend'),
  langPanel: document.getElementById('langPanel'),
  aibouPanel: document.getElementById('aibouPanel'),
  explorePanel: document.getElementById('explorePanel'),
  joinUsPanel: document.getElementById('joinUsPanel')
};

// Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// Initialize Application
async function initApp() {
  updateBadges();
  bindEvents();
  initSpeechRecognition();

  // If the modern Explore module controller is present (explore.js),
  // let explore.js manage catalog rendering. Otherwise, fallback to legacy loading.
  if (!window.ExploreModule) {
    await loadDestinations();
    await loadProducts();
  }
}

// 1. Fetch & Render Destinations
async function loadDestinations() {
  try {
    const res = await fetch('/api/destinations');
    const data = await res.json();
    AppState.destinations = data.destinations || [];
    renderDestinations(AppState.destinations);
    populateDestinationSelect(AppState.destinations);
  } catch (err) {
    console.error("Failed to load destinations:", err);
  }
}

function renderDestinations(dests) {
  if (!DOM.destinationsGrid) return;
  DOM.destinationsGrid.innerHTML = dests.map(d => `
    <div class="destination-card" onclick="filterByDestination('${d.id}')">
      <img src="${d.heroImage}" alt="${d.name}" class="dest-img" loading="lazy">
      <div class="dest-overlay">
        <span class="dest-badge">${d.productCount} Experiences</span>
        <h3 class="dest-name">${d.name}</h3>
        <p class="dest-tagline">${d.tagline}</p>
      </div>
    </div>
  `).join('');
}

function populateDestinationSelect(dests) {
  if (!DOM.searchDestSelect) return;
  DOM.searchDestSelect.innerHTML = `<option value="all">All Destinations</option>` +
    dests.map(d => `<option value="${d.id}">${d.name}, ${d.country}</option>`).join('');
}

// 2. Fetch & Render Products
async function loadProducts() {
  try {
    let url = `/api/products?`;
    if (AppState.selectedDestination !== 'all') url += `destination=${encodeURIComponent(AppState.selectedDestination)}&`;
    if (AppState.selectedCategory !== 'all') url += `category=${encodeURIComponent(AppState.selectedCategory)}&`;
    if (AppState.searchQuery) url += `search=${encodeURIComponent(AppState.searchQuery)}&`;

    const res = await fetch(url);
    const data = await res.json();
    AppState.products = data.products || [];
    renderProducts(AppState.products);
  } catch (err) {
    console.error("Failed to load products:", err);
    if (DOM.productsGrid) {
      DOM.productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p>⚠️ Unable to load experiences right now. Please ensure server is running.</p>
        </div>`;
    }
  }
}

function renderProducts(items) {
  if (!DOM.productsGrid) return;

  if (!items || items.length === 0) {
    DOM.productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
        <h3 style="color: var(--pigma-royal-blue); margin-bottom: 8px;">No matching experiences found</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">Try adjusting your destination or category filters, or ask Aibou to craft a custom tour.</p>
        <button class="btn-search" onclick="resetFilters()">Reset All Filters</button>
      </div>`;
    return;
  }

  DOM.productsGrid.innerHTML = items.map(p => {
    const isFav = AppState.favorites.includes(p.id);
    const badge = p.badges && p.badges[0] ? `<span class="card-badge ${p.badges[0].includes('Best') ? 'gold' : ''}">${p.badges[0]}</span>` : '';

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="card-image-box">
          <img src="${p.image}" alt="${p.title}" class="card-img" loading="lazy">
          ${badge}
          <button class="card-fav-btn" onclick="toggleFavorite('${p.id}', event)">
            ${isFav ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-category">${p.category}</span>
            <span>•</span>
            <span>⏱️ ${p.duration}</span>
            <span>•</span>
            <span class="card-rating">⭐ ${p.rating} (${p.reviewCount})</span>
          </div>
          <h3 class="card-title">${p.title}</h3>
          <p class="card-highlights">${p.highlights[0] || p.description}</p>
          <div class="card-footer">
            <div class="price-box">
              <span class="price-label">Price per person</span>
              <div>
                <span class="price-val">${Number(p.price).toLocaleString()}</span>
                <span class="price-curr">${p.currency} (~$${p.priceUsdEstimate || Math.round(p.price/49)})</span>
              </div>
            </div>
            <button class="btn-card-action" onclick="openProductModal('${p.id}')">View Details & Book</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 3. Product Details Modal & Interactive Booking
function openProductModal(productId) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product || !DOM.modalBody || !DOM.productModal) return;

  const highlightsHtml = (product.highlights || []).map(h => `<li>✅ ${h}</li>`).join('');
  const inclusionsHtml = (product.inclusions || []).map(i => `<li>✓ ${i}</li>`).join('');
  const exclusionsHtml = (product.exclusions || []).map(e => `<li>✕ ${e}</li>`).join('');

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const minDateStr = defaultDate.toISOString().split('T')[0];

  DOM.modalBody.innerHTML = `
    <div style="position: relative; height: 260px; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
      <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
      <div style="position: absolute; bottom: 16px; left: 20px; right: 20px; color: white; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 12px; border-radius: var(--radius-sm);">
        <span style="background: var(--pigma-turquoise); padding: 3px 8px; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">${product.category}</span>
        <h2 style="font-size: 1.5rem; margin-top: 6px; font-weight: 800;">${product.title}</h2>
      </div>
    </div>
    <div style="padding: 24px;">
      <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; font-size: 0.9rem; color: var(--text-muted); border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <span>📍 <strong>Location:</strong> ${product.destinationName}</span>
        <span>⏱️ <strong>Duration:</strong> ${product.duration}</span>
        <span>⭐ <strong>Rating:</strong> ${product.rating} / 5</span>
        <span>🛡️ <strong>Provider:</strong> ${product.supplierName}</span>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--pigma-royal-blue); margin-bottom: 8px;">About This Experience</h4>
        <p style="color: var(--text-main); line-height: 1.6; font-size: 0.95rem;">${product.description}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--pigma-royal-blue); margin-bottom: 8px;">Key Highlights</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 0.92rem; color: var(--text-main);">
          ${highlightsHtml}
        </ul>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: var(--pigma-warm-ivory-surface); padding: 16px; border-radius: var(--radius-md);">
        <div>
          <h5 style="color: var(--pigma-turquoise); margin-bottom: 6px;">Included in Price</h5>
          <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">
            ${inclusionsHtml}
          </ul>
        </div>
        <div>
          <h5 style="color: var(--pigma-coral); margin-bottom: 6px;">Not Included</h5>
          <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">
            ${exclusionsHtml}
          </ul>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
        <h4 style="color: var(--pigma-royal-blue); margin-bottom: 12px;">Reserve Your Date & Guests</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Service Date</label>
            <input type="date" id="bookingDate" min="${minDateStr}" value="${minDateStr}" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit;">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Travelers</label>
            <select id="bookingGuests" onchange="calculateBookingTotal(${product.price})" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit;">
              <option value="1">1 Person</option>
              <option value="2" selected>2 Persons</option>
              <option value="3">3 Persons</option>
              <option value="4">4 Persons</option>
              <option value="5">5 Persons</option>
              <option value="6">6 Persons</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Lead Traveler Name *</label>
            <input type="text" id="bookingName" placeholder="Full legal name" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit;">
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 4px;">Email for Confirmation *</label>
            <input type="email" id="bookingEmail" placeholder="your.name@example.com" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit;">
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-color);">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-muted); display: block;">Total Booking Value</span>
            <span id="bookingTotalDisplay" style="font-size: 1.4rem; font-weight: 800; color: var(--pigma-royal-blue);">${(product.price * 2).toLocaleString()} EGP</span>
          </div>
          <button class="btn-search" style="padding: 10px 24px;" onclick="submitBookingRequest('${product.id}')">Submit Booking Request</button>
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.82rem; color: var(--pigma-turquoise); font-weight: 600;">🛡️ ${product.cancellationPolicy}</span>
        <button style="background: transparent; border: 1px solid var(--pigma-royal-blue); color: var(--pigma-royal-blue); padding: 8px 14px; border-radius: var(--radius-pill); cursor: pointer; font-weight: bold; font-size: 0.85rem;" onclick="askAibouAboutProduct('${product.title.replace(/'/g, "\\'")}')">
          🔗 Ask Aibou about this
        </button>
      </div>
    </div>
  `;

  DOM.productModal.classList.add('open');
}

function calculateBookingTotal(unitPrice) {
  const guestsEl = document.getElementById('bookingGuests');
  const displayEl = document.getElementById('bookingTotalDisplay');
  if (guestsEl && displayEl) {
    const guests = parseInt(guestsEl.value, 10) || 1;
    displayEl.innerText = `${(unitPrice * guests).toLocaleString()} EGP`;
  }
}

async function submitBookingRequest(productId) {
  const dateEl = document.getElementById('bookingDate');
  const guestsEl = document.getElementById('bookingGuests');
  const nameEl = document.getElementById('bookingName');
  const emailEl = document.getElementById('bookingEmail');

  if (!nameEl.value.trim() || !emailEl.value.trim()) {
    alert("Please enter lead traveler name and email for your booking confirmation.");
    return;
  }

  const payload = {
    productId,
    serviceDate: dateEl.value,
    guests: guestsEl.value,
    customerName: nameEl.value.trim(),
    customerEmail: emailEl.value.trim()
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      AppState.activeBookings.push(data.booking);
      localStorage.setItem('pigma_bookings', JSON.stringify(AppState.activeBookings));
      updateBadges();

      alert(`🎉 Booking Request Received!\nReference ID: ${data.booking.id}\nStatus: Pending Supplier Confirmation\nDetails have been recorded in your My Trip drawer.`);
      closeProductModal();

      // Notify companion of the new booking
      appendMessage('pigma', `Mabrouk! I see your booking request for "${data.booking.productTitle}" on ${data.booking.serviceDate}. Our licensed local team in Luxor is reviewing it now.`);
      speakResponse(`Mabrouk! Your booking request for ${data.booking.productTitle} has been submitted.`);
      openAibouPanel();
    } else {
      alert(`Booking failed: ${data.error || 'Server error'}`);
    }
  } catch (err) {
    console.error("Booking error:", err);
    alert("Network error communicating with the booking server.");
  }
}

function closeProductModal() {
  if (DOM.productModal) {
    DOM.productModal.classList.remove('open');
  }
}

// 4. Favorites & My Trip Storage
function toggleFavorite(productId, event) {
  if (event) event.stopPropagation();
  const idx = AppState.favorites.indexOf(productId);
  if (idx > -1) {
    AppState.favorites.splice(idx, 1);
  } else {
    AppState.favorites.push(productId);
  }
  localStorage.setItem('pigma_favs', JSON.stringify(AppState.favorites));
  updateBadges();
  renderProducts(AppState.products);
}

function updateBadges() {
  if (DOM.favBadge) DOM.favBadge.innerText = AppState.favorites.length;
  if (DOM.tripBadge) DOM.tripBadge.innerText = AppState.activeBookings.length;
}

function showMyTripDrawer() {
  if (AppState.activeBookings.length === 0) {
    alert("You have no pending or confirmed bookings yet. Browse Luxor experiences and submit a booking request!");
    return;
  }
  const summary = AppState.activeBookings.map((b, i) =>
    `${i+1}. [${b.id}] ${b.productTitle}\n   Date: ${b.serviceDate} | Guests: ${b.guests} | Total: ${b.totalAmount} ${b.currency}\n   Status: ${b.status}`
  ).join('\n\n');
  alert(`📋 MY TRIP BOOKINGS (${AppState.activeBookings.length}):\n\n${summary}`);
}

function showFavoritesView() {
  if (AppState.favorites.length === 0) {
    alert("Your favorites list is empty. Click the heart icon on any experience to save it!");
    return;
  }
  const favItems = AppState.products.filter(p => AppState.favorites.includes(p.id));
  renderProducts(favItems);
  window.scrollTo({ top: document.getElementById('exploreSection').offsetTop - 80, behavior: 'smooth' });
}

// 5. Filtering & Search Navigation
function filterByCategory(category) {
  AppState.selectedCategory = category;
  DOM.categoryPills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-category') === category);
  });
  loadProducts();
}

function filterByDestination(destId) {
  AppState.selectedDestination = destId;
  if (DOM.searchDestSelect) DOM.searchDestSelect.value = destId;
  loadProducts();
  const exploreEl = document.getElementById('exploreSection');
  if (exploreEl) exploreEl.scrollIntoView({ behavior: 'smooth' });
}

function resetFilters() {
  AppState.selectedCategory = 'all';
  AppState.selectedDestination = 'all';
  AppState.searchQuery = '';
  if (DOM.searchDestSelect) DOM.searchDestSelect.value = 'all';
  if (DOM.searchCategorySelect) DOM.searchCategorySelect.value = 'all';
  if (DOM.searchInput) DOM.searchInput.value = '';
  DOM.categoryPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-category') === 'all'));
  loadProducts();
}

function askAibouAboutProduct(productTitle) {
  closeProductModal();
  openAibouPanel();
  const q = `Tell me about the ${productTitle} experience in Luxor. Is it worth booking?`;
  DOM.aibouTextInput.value = q;
  handleAibouSend();
}

// 6. Aibou AI Travel Companion Controller (Preserving Speech & AI Integration)
function setAibouStatus(statusText, isActive = false) {
  if (DOM.aibouStatusText) DOM.aibouStatusText.innerText = statusText;
  if (DOM.aibouStatusDot) {
    DOM.aibouStatusDot.classList.toggle('active', isActive);
  }
}

function appendMessage(sender, text) {
  if (!DOM.aibouMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = `msg-bubble ${sender}`;
  msgDiv.innerText = text;
  DOM.aibouMessages.appendChild(msgDiv);
  DOM.aibouMessages.scrollTop = DOM.aibouMessages.scrollHeight;

  AppState.chatHistory.push({ sender, text });
}

function speakResponse(text, callback) {
  if (!('speechSynthesis' in window)) {
    if (callback) callback();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;

  AppState.isSpeaking = true;
  setAibouStatus("Speaking...", true);

  utterance.onend = () => {
    AppState.isSpeaking = false;
    setAibouStatus("Ready", false);
    if (callback) callback();
  };

  utterance.onerror = () => {
    AppState.isSpeaking = false;
    setAibouStatus("Ready", false);
    if (callback) callback();
  };

  window.speechSynthesis.speak(utterance);
}

async function processAIResponse(userInput) {
  setAibouStatus("Thinking...", true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userInput,
        history: AppState.chatHistory.slice(-8)
      })
    });

    const data = await response.json();
    const replyText = data.reply || "I'm having trouble connecting to Aibou right now.";

    appendMessage('pigma', replyText);

    speakResponse(replyText, () => {
      if (AppState.isVoiceMode && recognition) {
        try {
          setAibouStatus("Listening...", true);
          recognition.start();
        } catch (e) {
          console.log("Mic ready for next input.");
        }
      }
    });

  } catch (error) {
    console.error("AI API Error:", error);
    const fallbackText = "Sorry, I couldn't reach the AI server. Please make sure node server.js is running.";
    appendMessage('pigma', fallbackText);
    speakResponse(fallbackText);
  }
}

function initSpeechRecognition() {
  if (!SpeechRecognition) {
    setAibouStatus("Voice not supported in this browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    if (!AppState.isSpeaking) {
      AppState.isListening = true;
      setAibouStatus("Listening...", true);
      if (DOM.aibouMicBtn) DOM.aibouMicBtn.classList.add('listening');
    }
  };

  recognition.onresult = (event) => {
    if (AppState.isSpeaking) return;
    setAibouStatus("Processing...", true);
    const transcript = event.results[0][0].transcript;
    appendMessage('user', transcript);
    processAIResponse(transcript);
  };

  recognition.onerror = (event) => {
    console.warn("Speech error:", event.error);
    AppState.isListening = false;
    if (DOM.aibouMicBtn) DOM.aibouMicBtn.classList.remove('listening');
    if (event.error === 'not-allowed') {
      setAibouStatus("Mic permission denied");
      AppState.isVoiceMode = false;
    }
  };

  recognition.onend = () => {
    AppState.isListening = false;
    if (DOM.aibouMicBtn) DOM.aibouMicBtn.classList.remove('listening');
    if (AppState.isVoiceMode && !AppState.isSpeaking) {
      try {
        recognition.start();
      } catch (e) {}
    } else {
      setAibouStatus("Ready", false);
    }
  };
}

function handleAibouSend() {
  const text = DOM.aibouTextInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  DOM.aibouTextInput.value = "";
  processAIResponse(text);
}

function toggleVoiceMode() {
  if (!recognition) {
    alert("Speech recognition is not supported in your browser. You can continue using text chat!");
    return;
  }

  if (AppState.isListening) {
    try { recognition.stop(); } catch(e){}
    AppState.isVoiceMode = false;
    AppState.isListening = false;
    setAibouStatus("Ready", false);
  } else {
    AppState.isVoiceMode = true;
    try { recognition.start(); } catch(e){}
  }
}

function openAibouPanel() {
  if (DOM.aibouChatPanel) {
    DOM.aibouChatPanel.classList.remove('minimized');
    AppState.companionMinimized = false;
  }
}

function toggleAibouPanel() {
  if (DOM.aibouChatPanel) {
    DOM.aibouChatPanel.classList.toggle('minimized');
    AppState.companionMinimized = DOM.aibouChatPanel.classList.contains('minimized');
  }
}

// 7. Event Binding
function bindEvents() {
  // Add skip button handling for intro overlay
  const skipBtn = document.getElementById('skipOverlayBtn');
  if (skipBtn && DOM.startOverlay) {
    skipBtn.addEventListener('click', () => {
      DOM.startOverlay.style.opacity = '0';
      setTimeout(() => DOM.startOverlay.style.display = 'none', 400);
    });
  }
  // Auto-hide intro overlay after 3 seconds if still visible
  if (DOM.startOverlay) {
    setTimeout(() => {
      if (DOM.startOverlay.style.display !== 'none') {
        DOM.startOverlay.style.opacity = '0';
        setTimeout(() => DOM.startOverlay.style.display = 'none', 400);
      }
    }, 3000);
  }

  // PIGMA WORLD Intro Overlay buttons
  if (DOM.startVoiceBtn) {
    DOM.startVoiceBtn.addEventListener('click', () => {
      DOM.startOverlay.style.opacity = '0';
      setTimeout(() => DOM.startOverlay.style.display = 'none', 400);
      AppState.isVoiceMode = true;
      openAibouPanel();
      if (recognition) {
        try { recognition.start(); } catch(e){}
      }
    });
  }

  if (DOM.startTextBtn) {
    DOM.startTextBtn.addEventListener('click', () => {
      DOM.startOverlay.style.opacity = '0';
      setTimeout(() => DOM.startOverlay.style.display = 'none', 400);
      AppState.isVoiceMode = false;
      setAibouStatus("Text chat mode active");
      openAibouPanel();
    });
  }

  // Category filter pills
  DOM.categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-category');
      filterByCategory(cat);
    });
  });

  // Search Form
  if (DOM.searchForm) {
    DOM.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      AppState.selectedDestination = DOM.searchDestSelect ? DOM.searchDestSelect.value : 'all';
      AppState.selectedCategory = DOM.searchCategorySelect ? DOM.searchCategorySelect.value : 'all';
      AppState.searchQuery = DOM.searchInput ? DOM.searchInput.value.trim() : '';
      loadProducts();
      const exploreSection = document.getElementById('exploreSection');
      if (exploreSection) exploreSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Modal Close
  if (DOM.modalCloseBtn) {
    DOM.modalCloseBtn.addEventListener('click', closeProductModal);
  }
  if (DOM.productModal) {
    DOM.productModal.addEventListener('click', (e) => {
      if (e.target === DOM.productModal) closeProductModal();
    });
  }

  // Aibou Controls
  if (DOM.aibouLauncherBtn) DOM.aibouLauncherBtn.addEventListener('click', toggleAibouPanel);
  if (DOM.aibouMinimizeBtn) DOM.aibouMinimizeBtn.addEventListener('click', toggleAibouPanel);
  if (DOM.navAibouBtn) DOM.navAibouBtn.addEventListener('click', () => {
    openAibouPanel();
    DOM.aibouTextInput.focus();
  });
  if (DOM.aibouSendBtn) DOM.aibouSendBtn.addEventListener('click', handleAibouSend);
  if (DOM.aibouTextInput) {
    DOM.aibouTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAibouSend();
    });
  }
  if (DOM.aibouMicBtn) DOM.aibouMicBtn.addEventListener('click', toggleVoiceMode);
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', initApp);

# PIGMA TOURS — TECHNICAL ARCHITECTURE & DATA MODEL SPECIFICATION
**Version:** 1.0 (Foundational Architecture)
**Budgetary Constraint:** Permanently ZERO EGP Spending

---

## 1. System Overview

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|  - index.html (Responsive HTML5 UI, PIGMA WORLD Intro, Floating Dock)   |
|  - css/design-system.css (Design tokens: Royal blue, Warm ivory, etc.)  |
|  - js/app.js (Catalog controller, booking forms, Web Speech API audio)  |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTP REST & Static Assets (Port 3000)
                                     v
+-------------------------------------------------------------------------+
|                              SERVER TIER                                |
|  - server.js (Node.js ES Modules + Express 5)                          |
|  - Static asset handler: app.use(express.static(__dirname))             |
|  - REST Endpoints:                                                      |
|      * GET  /api/destinations                                           |
|      * GET  /api/products?destination=...&category=...&search=...       |
|      * GET  /api/products/:id                                           |
|      * POST /api/bookings (Authoritative price & validation)            |
|      * GET  /api/bookings/:id                                           |
|      * POST /api/chat (Grounded Gemini companion endpoint)              |
+------------------------------------+------------------------------------+
                                     |
                    +----------------+----------------+
                    |                                 |
                    v                                 v
    +-------------------------------+   +-------------------------------+
    |         DATA MODULES          |   |       AI PROVIDER TIER        |
    |  - data/destinations.js       |   |  - Google Gemini API (v1beta) |
    |  - data/products.js           |   |  - gemini-flash-latest        |
    |  - In-memory bookings store   |   |  - gemini-flash-lite fallback |
    |  - Client localStorage ledger |   |  - Grounded catalog prompt    |
    +-------------------------------+   +-------------------------------+
```

---

## 2. Core Design Decisions

### 2.1 Permanent Zero-Cost Constraint
* **No Paid Subscriptions:** Zero paid database hosting, zero external paid vector stores, zero paid UI kits, and zero paid speech recognition services.
* **API Utilization:** Utilizes the official `@google/genai` free tier quota for `gemini-flash-latest`.
* **Browser-Native Voice:** Utilizes the browser's built-in `window.SpeechRecognition` (STT) and `window.speechSynthesis` (TTS), requiring zero cloud audio billing.

### 2.2 Global Scalability & Pilot Isolation
* **Initial Pilot:** Luxor, Egypt (`luxor`).
* **Data Conventions:** Products and destinations are decoupled via relational identifiers (`destinationId`, `supplierId`, `currency`). An experience in Aswan (`aswan`), Cairo (`cairo`), or an international hub (e.g., Tokyo, Rome) can be added without schema modifications.

### 2.3 Authoritative Financial Calculations
* **Server Authority:** The frontend never computes or sends trusted final prices. The server checks the product registry, multiplies by validated guest count, and attaches the immutable cancellation policy snapshot at time of booking.

### 2.4 Specific Brand Requirement
* The navigation bar includes the explicit specification requirement:
  ```html
  <button class="nav-aibou-btn" id="navAibouBtn">
      <span class="chain-icon">🔗</span> Aibou
  </button>
  ```
  A small chain-link icon (🔗) is displayed beside "Aibou" in place of the generic robot icon.

---

## 3. Data Schema Definitions

### 3.1 Destination Entity
```typescript
interface Destination {
  id: string;               // e.g. "luxor", "cairo"
  name: string;             // e.g. "Luxor"
  country: string;          // e.g. "Egypt"
  tagline: string;
  description: string;
  heroImage: string;
  productCount: number;
  currency: string;         // ISO code (e.g. "EGP")
  timezone: string;         // IANA zone (e.g. "Africa/Cairo")
  featured: boolean;
}
```

### 3.2 Product Entity
```typescript
interface Product {
  id: string;               // e.g. "lux-001"
  title: string;
  titleAr?: string;
  category: "Tours" | "Activities" | "Cruises" | "Guided Visits" | "Stays";
  destinationId: string;
  destinationName: string;
  supplierId: string;
  supplierName: string;
  rating: number;
  reviewCount: number;
  price: number;            // Integer amount in base currency
  currency: string;         // "EGP"
  priceUsdEstimate?: number;
  duration: string;
  image: string;
  badges: string[];
  highlights: string[];
  description: string;
  inclusions: string[];
  exclusions: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  minGroupSize: number;
  maxGroupSize: number;
  languages: string[];
  availability: string;
}
```

### 3.3 Booking Entity
```typescript
interface Booking {
  id: string;               // e.g. "PIGMA-MVNF94UG-9567"
  productId: string;
  productTitle: string;
  supplierId: string;
  supplierName: string;
  serviceDate: string;      // YYYY-MM-DD
  guests: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  specialRequests?: string;
  status: "draft" | "pending_confirmation" | "confirmed" | "cancelled" | "completed";
  cancellationPolicy: string;
  createdAt: string;        // ISO timestamp
}
```

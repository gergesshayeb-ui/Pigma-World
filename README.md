# Pigma Tours — Global Tourism Marketplace & Voice AI Companion

Pigma Tours is a modern, global digital tourism marketplace featuring an authentic Egyptian AI travel companion named **Aibou**.

> **Operating Constraint:** Permanently ZERO EGP spending. Built with pure vanilla technologies, browser-native Web Speech audio, and official Google Gemini API free-tier quotas.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js:** v20.x or higher (tested on Node v24.22.1)
* **API Key:** A valid Google Gemini API key placed inside your local `.env` file:
  ```env
  GEMINI_API_KEY=your_key_here
  PORT=3000
  ```

### 2. Start the Server
Run the application server directly with Node:
```bash
node server.js
```
The server will start at:
👉 **`http://localhost:3000`**

### 3. Open in Your Browser
Navigate to **`http://localhost:3000`** in Google Chrome, Edge, or any modern browser.
* Choose **Start Voice Mode** or **Text Mode Only** on the PIGMA WORLD welcome screen.
* Explore tours in Luxor (Sunrise Hot Air Balloon, Valley of the Kings, Nile Felucca sailing).
* Click **View Details & Book** to open the interactive reservation form.
* Click **🔗 Aibou** in the navigation bar or the floating assistant dock to chat with your companion via voice or text.

---

## 🧪 Testing the APIs

### 1. Syntax & Static Validation
```bash
node --check server.js
```

### 2. Marketplace Products Endpoint
```bash
# In PowerShell:
Invoke-RestMethod -Uri "http://localhost:3000/api/products" | Select-Object -ExpandProperty total
```

### 3. Booking Request Endpoint
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/bookings" -Method Post -ContentType "application/json" -Body '{"productId":"lux-001","serviceDate":"2026-11-01","guests":2,"customerName":"Traveler Name","customerEmail":"traveler@example.com"}' | ConvertTo-Json
```

### 4. Grounded AI Companion Endpoint
```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post -ContentType "application/json" -Body '{"message":"Recommend a sunrise tour in Luxor"}' | ConvertTo-Json
```

---

## 🎨 Design Tokens & Icons
* **Palette:** Royal Blue (`#1e3a8a`), Warm Ivory (`#fcfbf8`), Turquoise (`#0d9488`), Coral (`#f43f5e`), and Restrained Gold (`#d97706`).
* **Aibou Navigation Icon:** Adheres to Specification Section 4: displayed with a small chain-link icon (`🔗 Aibou`) rather than a robot icon.

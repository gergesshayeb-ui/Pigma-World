import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { destinations } from './data/destinations.js';
import { products } from './data/products.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend assets directly from project root
app.use(express.static(__dirname));

// Initialize Google Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Build a concise catalog summary for AI grounding
const catalogSummary = products.map(p =>
  `- [${p.id}] "${p.title}" (${p.category}, ${p.price} ${p.currency}, ${p.duration}): ${p.highlights[0]}`
).join('\n');

const SYSTEM_PROMPT = `You are Aibou, a friendly, witty, and deeply knowledgeable Egyptian travel companion for Pigma Tours (pigma.com).
Your goal is to assist travelers exploring Egypt (Luxor, Aswan, Cairo, Pyramids, Nile Cruises, etc.).
You have access to our verified real-time marketplace experiences in Luxor:
${catalogSummary}

Guidelines:
1. Keep your answers engaging, warm, helpful, and concise (2-4 sentences for smooth voice playback), unless the traveler explicitly requests an extensive historical or itinerary breakdown.
2. When travelers ask for recommendations, reference our actual bookable experiences (like the Sunrise Hot Air Balloon, Valley of the Kings private tour, or Nile Felucca sailing) and mention their fair prices in EGP.
3. Be culturally authentic, welcoming (use occasional warm Egyptian greetings like "Ahlan wa Sahlan", "Marhaban"), and practical.`;

// In-memory bookings ledger for local MVP (stateful during server session)
const bookingsStore = new Map();

// --- REST API ENDPOINTS ---

// 1. Get Destinations
app.get('/api/destinations', (req, res) => {
    return res.json({ destinations });
});

// 2. Get Products (with filtering by country, destination, category, rating, maxPrice, or search query)
app.get('/api/products', (req, res) => {
    const { country, destination, category, search, minRating, maxPrice } = req.query;
    let filtered = [...products];

    if (country && country !== 'all') {
        filtered = filtered.filter(p => p.country && p.country.toLowerCase() === country.toLowerCase());
    }

    if (destination && destination !== 'all') {
        filtered = filtered.filter(p => p.destinationId.toLowerCase() === destination.toLowerCase());
    }

    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minRating && parseFloat(minRating) > 0) {
        filtered = filtered.filter(p => (p.rating || 0) >= parseFloat(minRating));
    }

    if (maxPrice && maxPrice !== 'all') {
        const maxVal = parseFloat(maxPrice);
        filtered = filtered.filter(p => {
            const usd = p.priceUsdEstimate || p.price;
            return usd <= maxVal;
        });
    }

    if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.country && p.country.toLowerCase().includes(q)) ||
            (p.destinationName && p.destinationName.toLowerCase().includes(q)) ||
            (p.highlights && p.highlights.some(h => h.toLowerCase().includes(q)))
        );
    }

    return res.json({
        total: filtered.length,
        products: filtered
    });
});

// 3. Get Single Product by ID
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ product });
});

// 4. Create Booking Draft / Request
app.post('/api/bookings', (req, res) => {
    try {
        const { productId, serviceDate, guests, customerName, customerEmail, customerPhone, specialRequests } = req.body;

        if (!productId || !serviceDate || !guests || !customerName || !customerEmail) {
            return res.status(400).json({ error: "Missing required booking details (productId, serviceDate, guests, customerName, customerEmail)" });
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ error: "Selected product does not exist" });
        }

        const guestCount = parseInt(guests, 10);
        if (isNaN(guestCount) || guestCount < 1) {
            return res.status(400).json({ error: "Invalid guest count" });
        }

        // Authoritative server-side price calculation
        const totalAmount = product.price * guestCount;
        const bookingId = `PIGMA-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const bookingRecord = {
            id: bookingId,
            productId: product.id,
            productTitle: product.title,
            supplierId: product.supplierId,
            supplierName: product.supplierName,
            serviceDate,
            guests: guestCount,
            unitPrice: product.price,
            totalAmount,
            currency: product.currency,
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone || ""
            },
            specialRequests: specialRequests || "",
            status: "pending_confirmation",
            cancellationPolicy: product.cancellationPolicy,
            createdAt: new Date().toISOString()
        };

        bookingsStore.set(bookingId, bookingRecord);

        return res.status(201).json({
            success: true,
            message: "Booking request received. Awaiting licensed supplier confirmation.",
            booking: bookingRecord
        });
    } catch (err) {
        console.error("Booking error:", err);
        return res.status(500).json({ error: "Failed to process booking request" });
    }
});

// 5. Get Booking by ID
app.get('/api/bookings/:id', (req, res) => {
    const booking = bookingsStore.get(req.params.id);
    if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
    }
    return res.json({ booking });
});

// 6. AI Travel Companion Chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build structured conversational history
        const contents = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: "Understood! I am Aibou, ready to guide travelers through Luxor and all of Egypt with Pigma Tours." }] }
        ];

        if (Array.isArray(history)) {
            history.forEach(item => {
                if (item.text && item.text.trim()) {
                    contents.push({
                        role: item.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: item.text }]
                    });
                }
            });
        }

        contents.push({ role: 'user', parts: [{ text: message }] });

        // Robust generation with automatic retry and model fallback on temporary 503 spikes
        let response = null;
        const modelsToTry = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                response = await ai.models.generateContent({
                    model: modelName,
                    contents: contents,
                });
                if (response && response.text) break;
            } catch (err) {
                lastError = err;
                console.warn(`Model ${modelName} temporary spike (${err?.status || '503'}), attempting fallback...`);
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        if (!response || !response.text) {
            console.error("Gemini API Error after retries:", lastError?.message || lastError);
            // Graceful companion response adhering to zero-outage principle
            const fallbackCompanionReply = "Ahlan! High demand on the Nile network briefly slowed my full reply, but I'm here! For the ultimate Luxor experience, I recommend our Sunrise Hot Air Balloon Flight (1,850 EGP) or Karnak Temple at Sunset (1,650 EGP). What type of adventure are you looking for?";
            return res.json({ reply: fallbackCompanionReply });
        }

        const replyText = response.text || "I'm having trouble retrieving that detail right now.";
        return res.json({ reply: replyText });

    } catch (error) {
        console.error("Server API Chat Error:", error?.message || error);
        return res.status(500).json({ error: "Failed to connect to AI server." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Pigma AI Server running locally on http://localhost:${PORT}`);
});

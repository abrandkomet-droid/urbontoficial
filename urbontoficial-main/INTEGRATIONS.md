# URBONT — API Integrations Documentation

## Overview
URBONT uses 4 external APIs for core functionality. This document covers configuration, key renewal, and endpoint documentation.

---

## 1. Groq (AI & Voice)
**Purpose:** Real-time message refinement (Guante Blanco protocol) and voice transcription.

| Detail | Value |
|--------|-------|
| **API Key Variable** | `GROQ_API_KEY` |
| **Location** | `.env` (server-side only) |
| **Models Used** | `whisper-large-v3-turbo` (STT), `llama3-70b-versatile` (LLM) |
| **Endpoints** | `/api/chat/transcribe`, `/api/chat/send`, `/api/chat/messages/:rideId`, `/api/chat/purge/:rideId` |

### Key Renewal
1. Go to [console.groq.com](https://console.groq.com)
2. Navigate to **API Keys** → **Create New Key**
3. Update `GROQ_API_KEY` in `.env`
4. Restart the server

### Notes
- Keys are **never** exposed to the client
- Message refinement transforms chauffeur messages into courteous language
- Chat sessions are automatically purged when a trip completes

---

## 2. Google Maps
**Purpose:** Real-time vehicle tracking and address autocomplete.

| Detail | Value |
|--------|-------|
| **API Key Variable** | `VITE_GOOGLE_MAPS_API_KEY` |
| **Location** | `.env` (client-side via Vite) |
| **APIs Enabled** | Maps JavaScript API, Places API, Directions API, Geocoding API |
| **Map Style** | Navy/Silver custom theme |

### Map Style (Navy/Silver)
```json
[
  { "elementType": "geometry", "stylers": [{ "color": "#0A2540" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#C0C0C0" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0A2540" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1A3A5C" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#0D1F3A" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#071B30" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
]
```

### Key Renewal
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Create or rotate the API key
4. **Restrict the key** to your app domains (Android/iOS package names)
5. Update `VITE_GOOGLE_MAPS_API_KEY` in `.env`
6. Rebuild the app

---

## 3. Stripe (Payments)
**Purpose:** Payment processing for rides in USD.

| Detail | Value |
|--------|-------|
| **API Key Variable** | `STRIPE_SECRET_KEY` (server), `VITE_STRIPE_PUBLISHABLE_KEY` (client) |
| **Location** | `.env` |
| **Mode** | Test mode (switch to live for production) |
| **Currency** | USD |

### UI Guidelines
- Show only **last 4 digits** of card number
- Display **cardholder name** (if available)
- Show **Stripe branding** in payment footer for trust
- Payment button: "Pay $XX.XX USD"

### Key Renewal
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Roll the keys and update both `.env` variables
4. For production: switch from `sk_test_*` to `sk_live_*`

---

## 4. Cloudinary (Images)
**Purpose:** Optimized storage and delivery of chauffeur portraits and vehicle photos.

| Detail | Value |
|--------|-------|
| **API Key Variable** | `CLOUDINARY_URL` or individual `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Location** | `.env` (server-side only) |

### Image Transformations
| Image Type | Transformation |
|-----------|---------------|
| **Chauffeur Portrait** | `width=150, height=150, crop="fill", gravity="face", format="webp"` |
| **Vehicle Photo** | `width=300, height=200, crop="fit", format="webp"` |

### Key Renewal
1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Navigate to **Settings** → **Access Keys**
3. Regenerate the API key/secret
4. Update the `.env` variables

---

## 5. Gemini (Translation)
**Purpose:** Language Bridge — real-time translation and TTS for multilingual communication.

| Detail | Value |
|--------|-------|
| **API Key Variable** | `GEMINI_API_KEY` |
| **Location** | `.env` (server-side only) |
| **Endpoint** | `/api/bridge/process`, `/api/bridge/speak` |
| **Voice Config** | `Kore` (Spanish), `Fenrir` (English) |

### Key Renewal
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Navigate to **Get API Key** → **Create API Key**
3. Update `GEMINI_API_KEY` in `.env`
4. Restart the server

---

## Environment Variables Summary

```bash
# Server-side (never exposed to client)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_URL=cloudinary://...

# Client-side (prefixed with VITE_)
VITE_GOOGLE_MAPS_API_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Security Rules
1. **Never** expose server-side API keys in client code
2. All `VITE_` prefixed variables are visible to the client — use only for public keys
3. Use API key restrictions (domain, IP, app signatures) when available
4. Rotate keys immediately if compromised
5. Use environment variables in production — never hardcode keys

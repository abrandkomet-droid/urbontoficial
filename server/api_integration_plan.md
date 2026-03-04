# Urbont API Integration Plan (USA Market)

## 1. Google Maps Enterprise (Advanced Markers & Real-time Traffic)

**Objective:** Achieve "God's Eye" accuracy for fleet tracking and route optimization.

**Configuration Steps:**
1.  **Enable APIs:** In Google Cloud Console, enable:
    *   Maps JavaScript API (for Web Client)
    *   Directions API (for Route Calculation)
    *   Distance Matrix API (for ETA)
    *   Roads API (for Snap-to-Roads accuracy)
2.  **Quota Management:**
    *   Set daily quotas to prevent runaway costs.
    *   Enable "Advanced Markers" in the Maps JavaScript API settings.
3.  **Traffic Model:**
    *   Use `traffic_model=best_guess` (default) for standard ETAs.
    *   Use `traffic_model=pessimistic` for VIP airport runs to ensure buffer.

**Implementation Note:** The `integrationsRouter` includes a mock wrapper for route calculation that simulates traffic delays.

## 2. FlightAware / Aviationstack (Flight Status Webhook)

**Objective:** Real-time flight tracking to adjust pickup times automatically.

**Configuration Steps:**
1.  **Webhook Setup:**
    *   Register a webhook URL: `https://api.urbont.com/api/integrations/webhooks/flight-status`
    *   Subscribe to events: `arrival`, `departure`, `cancellation`, `diversion`.
2.  **Payload Handling:**
    *   The system parses the JSON payload to extract `flight_id`, `status`, and `estimated_arrival`.
    *   Triggers the Logistics Module to recalculate pickup times.

## 3. Twilio (Proxy Number Masking)

**Objective:** Protect privacy of both Chauffeur and VIP Client.

**Configuration Steps:**
1.  **Buy Numbers:** Purchase a pool of local US numbers (e.g., +1 212...) in Twilio Console.
2.  **Voice URL:** Configure the "Voice Request URL" for these numbers to point to:
    *   `https://api.urbont.com/api/integrations/webhooks/twilio/voice`
3.  **Logic:**
    *   When a call is received, the system identifies the caller (Driver or Passenger).
    *   It looks up the active ride.
    *   It bridges the call to the *other* party using `<Dial callerId="PROXY_NUMBER">`.
    *   Neither party sees the other's real number.

## 4. Checkr API (Background Checks)

**Objective:** Ensure 100% compliance and safety for drivers.

**Configuration Steps:**
1.  **API Keys:** Generate API keys in Checkr Dashboard (Test/Live).
2.  **Webhook Setup:**
    *   Register webhook URL: `https://api.urbont.com/api/integrations/webhooks/checkr`
    *   Subscribe to: `report.completed`, `report.suspended`.
3.  **Flow:**
    *   **Initiate:** Admin triggers check via `/api/integrations/checkr/initiate`.
    *   **Pending:** Driver status set to `pending_background_check` (cannot drive).
    *   **Webhook:** When `report.completed` arrives with `status: clear`, driver is activated.
    *   **Adverse Action:** If `status: consider`, manual review is triggered.

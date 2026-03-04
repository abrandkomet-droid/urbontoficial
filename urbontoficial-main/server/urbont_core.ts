import { Router, Request, Response } from "express";
import crypto from "crypto";

export const urbontCoreRouter = Router();

// --- 1. Bank-Grade Security & Anti-Fraud (Enhanced) ---

// Velocity Checking (Already in security.ts, but refined here for specific "Urbont" rules)
const velocityLog: Map<string, number[]> = new Map();
const VELOCITY_LIMIT = 3; // Max 3 bookings
const VELOCITY_WINDOW = 60000; // per minute (Strict)

function checkVelocityStrict(ip: string): boolean {
  const now = Date.now();
  const timestamps = velocityLog.get(ip) || [];
  const recent = timestamps.filter(t => now - t < VELOCITY_WINDOW);
  
  if (recent.length >= VELOCITY_LIMIT) return false;
  
  recent.push(now);
  velocityLog.set(ip, recent);
  return true;
}

// PII Anonymization (24h Rule)
// This function would be called by a cron job every hour
export function runPiiAnonymizationProtocol() {
  console.log("[PRIVACY] Running 24h PII Anonymization Protocol (SOC2/PCI-DSS Compliance)...");
  // In a real DB, this would be:
  // UPDATE rides SET passenger_name = 'REDACTED', phone = 'REDACTED' 
  // WHERE status = 'completed' AND completed_at < NOW() - INTERVAL '24 HOURS';
  return { anonymized_count: 0, status: "completed" };
}

// --- 2. Elite Chauffeur Mode (Protocol-Driven) ---

interface Checklist {
  rideId: string;
  vehicleClean: boolean;
  amenitiesStocked: boolean; // Water, Mints, Charger
  attireCompliant: boolean; // Suit & Tie
}

urbontCoreRouter.post("/chauffeur/checklist", (req: Request, res: Response) => {
  const checklist: Checklist = req.body;
  
  if (!checklist.vehicleClean || !checklist.amenitiesStocked || !checklist.attireCompliant) {
    res.status(400).json({ 
      error: "PROTOCOL_VIOLATION", 
      message: "Cannot start ride. Standards not met.",
      action: "RECTIFY_IMMEDIATELY"
    });
    return;
  }
  
  // Log success
  res.json({ status: "approved", message: "You may proceed to pickup." });
});

// Grace Period Timer Logic
urbontCoreRouter.get("/ride/:id/grace-period", (req: Request, res: Response) => {
  const { type } = req.query; // 'city' or 'airport'
  const limitMinutes = type === 'airport' ? 60 : 15;
  
  // Mock start time
  const arrivalTime = new Date(Date.now() - 1000 * 60 * 10); // Arrived 10 mins ago
  const elapsedMinutes = 10;
  const remainingMinutes = limitMinutes - elapsedMinutes;
  
  res.json({
    limitMinutes,
    elapsedMinutes,
    remainingMinutes,
    alertLevel: remainingMinutes < 5 ? "CRITICAL" : "NORMAL"
  });
});

// --- 3. "God's Eye" Telemetry (Smartphone-Based) ---

interface TelemetryData {
  rideId: string;
  lat: number;
  lng: number;
  speedMph: number;
  accelX: number; // G-force
  accelY: number; // G-force
  timestamp: number;
}

// Mock Route Path (simplified)
const expectedRoute = [{lat: 40.7128, lng: -74.0060}, {lat: 40.7580, lng: -73.9855}]; 

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  // Haversine formula
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function checkRouteDeviation(lat: number, lng: number): boolean {
  // Check distance to nearest point on route
  // Simplified: check distance to start/end for demo
  const distStart = calculateDistance(lat, lng, expectedRoute[0].lat, expectedRoute[0].lng);
  const distEnd = calculateDistance(lat, lng, expectedRoute[1].lat, expectedRoute[1].lng);
  
  // If > 300m from "route" (simplified as > 5km from both points for demo safety)
  // In real app: use Google Maps Snap to Roads API or Polyline decoding
  return false; 
}

urbontCoreRouter.post("/telemetry/stream", (req: Request, res: Response) => {
  const data: TelemetryData = req.body;
  const alerts: string[] = [];
  
  // 1. Harsh Driving Detection (Accelerometer)
  // Threshold: 0.4g for luxury comfort
  const gForce = Math.sqrt(data.accelX**2 + data.accelY**2);
  if (gForce > 0.4) {
    alerts.push("HARSH_DRIVING_DETECTED");
    console.log(`[GODS_EYE] Harsh driving on Ride ${data.rideId}: ${gForce.toFixed(2)}g`);
  }
  
  // 2. Route Deviation
  if (checkRouteDeviation(data.lat, data.lng)) {
    alerts.push("ROUTE_DEVIATION");
    console.log(`[GODS_EYE] RED ALERT: Vehicle deviated from route!`);
  }
  
  // 3. Unauthorized Stop
  if (data.speedMph < 1 && !alerts.includes("ROUTE_DEVIATION")) {
    // Check if near pickup/dropoff. If not -> Alert
    // Simplified logic
  }
  
  res.json({ status: "processed", alerts });
});

// --- 4. Cancellation & Contingency (USA Market) ---

urbontCoreRouter.post("/ride/:id/cancel", (req: Request, res: Response) => {
  const { reason } = req.body;
  // Logic: If cancelled < 2 hours before -> 100% Fee
  const feePercentage = 100; 
  const feeAmount = 150.00; // Mock price
  
  console.log(`[BILLING] Charging No-Show Fee: $${feeAmount} (100%)`);
  
  res.json({
    status: "cancelled",
    fee: feeAmount,
    currency: "USD",
    message: "Cancellation processed. 100% fee applied per policy."
  });
});

urbontCoreRouter.post("/ride/:id/contingency-check", (req: Request, res: Response) => {
  const { driverLat, driverLng, pickupLat, pickupLng, scheduledTime } = req.body;
  
  const now = Date.now();
  const scheduled = new Date(scheduledTime).getTime();
  const minutesUntilPickup = (scheduled - now) / 60000;
  
  // Rule: 10 minutes before, must be within 500m
  if (minutesUntilPickup <= 10 && minutesUntilPickup > 0) {
    const dist = calculateDistance(driverLat, driverLng, pickupLat, pickupLng);
    
    if (dist > 500) {
      console.log(`[CONTINGENCY] Driver is ${dist.toFixed(0)}m away with ${minutesUntilPickup.toFixed(1)}m left. REASSIGNING.`);
      
      return res.json({
        status: "REASSIGN_TRIGGERED",
        action: "FIND_BACKUP_DRIVER",
        alert: "DRIVER_NOT_POSITIONED"
      });
    }
  }
  
  res.json({ status: "ok", distance: "acceptable" });
});

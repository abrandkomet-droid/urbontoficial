import { Router, Request, Response } from "express";
import crypto from "crypto";

export const productRouter = Router();

// --- 1. VIP Preferences Module ---

interface VipPreferences {
  temperature: string; // e.g., "20°C", "Cool", "Warm"
  musicGenre: string; // e.g., "Jazz", "Classical", "Silence"
  conversationLevel: 'silent' | 'minimal' | 'polite' | 'engaging';
  amenities: string[]; // e.g., ["Water", "Charger", "Newspaper"]
}

// Mock User Store extension
const userPreferences: Map<string, VipPreferences> = new Map();

productRouter.post("/preferences/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  const prefs: VipPreferences = req.body;
  
  // Validation
  if (!prefs.temperature || !prefs.conversationLevel) {
    res.status(400).json({ error: "Missing required preferences" });
    return;
  }

  userPreferences.set(userId, prefs);
  res.json({ message: "VIP Preferences updated", preferences: prefs });
});

productRouter.get("/preferences/:userId", (req: Request, res: Response) => {
  const prefs = userPreferences.get(req.params.userId) || {
    temperature: "21°C",
    musicGenre: "None",
    conversationLevel: "polite",
    amenities: []
  };
  res.json(prefs);
});

// --- 2. Hourly Booking Logic ---

const HOURLY_RATES: Record<string, number> = {
  'luxury': 120, // $120/hr
  'suv': 150,    // $150/hr
  'van': 180     // $180/hr
};

const MILES_PER_HOUR_LIMIT = 15; // 15 miles included per hour booked
const EXCESS_MILE_RATE = 5.00; // $5 per extra mile

productRouter.post("/quote/hourly", (req: Request, res: Response) => {
  const { vehicleClass, hours, estimatedMiles } = req.body;

  if (!HOURLY_RATES[vehicleClass]) {
    res.status(400).json({ error: "Invalid vehicle class" });
    return;
  }

  const baseRate = HOURLY_RATES[vehicleClass];
  const basePrice = baseRate * hours;
  
  const includedMiles = hours * MILES_PER_HOUR_LIMIT;
  let excessMiles = 0;
  let excessCharge = 0;

  if (estimatedMiles > includedMiles) {
    excessMiles = estimatedMiles - includedMiles;
    excessCharge = excessMiles * EXCESS_MILE_RATE;
  }

  const totalPrice = basePrice + excessCharge;

  res.json({
    quoteId: crypto.randomUUID(),
    vehicleClass,
    hours,
    basePrice,
    includedMiles,
    estimatedMiles,
    excessMiles,
    excessCharge,
    totalPrice,
    currency: "USD"
  });
});

// --- 3. Corporate Billing System ---

interface BillingProfile {
  id: string;
  userId: string;
  type: 'personal' | 'corporate';
  companyName?: string;
  taxId?: string;
  emailForReceipts: string;
}

// Mock Billing Store
const billingProfiles: BillingProfile[] = [];
// Mock Rides for Billing
const completedRides: any[] = []; 

productRouter.post("/billing/profiles", (req: Request, res: Response) => {
  const profile: BillingProfile = {
    id: crypto.randomUUID(),
    ...req.body
  };
  billingProfiles.push(profile);
  res.json(profile);
});

productRouter.get("/billing/consolidated-invoice", (req: Request, res: Response) => {
  const { profileId, month, year } = req.query;
  
  const profile = billingProfiles.find(p => p.id === profileId);
  if (!profile || profile.type !== 'corporate') {
    res.status(400).json({ error: "Invalid or non-corporate profile" });
    return;
  }

  // Filter rides for this profile in the given month (Mock logic)
  // In a real DB, this would be a SQL query with date range
  const rides = completedRides.filter(r => r.billingProfileId === profileId); // Simplified
  
  const totalAmount = rides.reduce((sum, r) => sum + r.finalPrice, 0);
  
  res.json({
    invoiceId: `INV-${year}${month}-${profile.companyName?.substring(0,3).toUpperCase()}`,
    period: `${month}/${year}`,
    company: profile.companyName,
    taxId: profile.taxId,
    totalRides: rides.length,
    totalAmount,
    currency: "USD",
    breakdown: rides
  });
});

// --- 4. Airport Protocol (Buffer & Tracking) ---

productRouter.post("/airport/calculate-pickup", (req: Request, res: Response) => {
  const { flightArrivalTime, gracePeriodMinutes, domesticOrInternational } = req.body;
  
  const arrival = new Date(flightArrivalTime);
  
  // Base buffer for taxiing/gate arrival
  const baseBuffer = 15; // minutes
  
  // Immigration buffer (International only)
  const immigrationBuffer = domesticOrInternational === 'international' ? 45 : 0;
  
  // User selected grace period (e.g., "I have checked bags" -> +30m)
  const userGrace = gracePeriodMinutes || 0;
  
  const totalDelayMinutes = baseBuffer + immigrationBuffer + userGrace;
  
  const pickupTime = new Date(arrival.getTime() + (totalDelayMinutes * 60000));
  
  res.json({
    flightArrivalTime: arrival.toISOString(),
    adjustments: {
      taxiing: baseBuffer,
      immigration: immigrationBuffer,
      userGrace: userGrace
    },
    totalDelayMinutes,
    recommendedPickupTime: pickupTime.toISOString()
  });
});

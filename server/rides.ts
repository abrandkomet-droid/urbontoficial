import { Router, Request, Response } from "express";
import crypto from "crypto";

export const rideRouter = Router();

// --- Mock Database ---
export interface Ride {
  id: string;
  passengerId: string;
  driverId: string;
  pickupLocation: { lat: number, lng: number };
  dropoffLocation: { lat: number, lng: number };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: string;
  completedAt?: string;
  isAnonymized: boolean;
  price: number;
}

export const rides: Ride[] = [
  {
    id: "mock-old-ride-1",
    passengerId: "user-123",
    driverId: "driver-456",
    pickupLocation: { lat: 40.7128, lng: -74.0060 },
    dropoffLocation: { lat: 40.7580, lng: -73.9855 },
    status: 'completed',
    scheduledTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    completedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(), // 47 hours ago
    isAnonymized: false,
    price: 50
  },
  {
    id: "mock-recent-ride-2",
    passengerId: "user-789",
    driverId: "driver-012",
    pickupLocation: { lat: 34.0522, lng: -118.2437 },
    dropoffLocation: { lat: 34.0522, lng: -118.2437 },
    status: 'completed',
    scheduledTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    completedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(), // 11 hours ago
    isAnonymized: false,
    price: 30
  }
];

// --- 1. Cancellation Logic (Scenario A) ---
function calculateCancellationFee(ride: Ride): number {
  const now = new Date();
  const scheduled = new Date(ride.scheduledTime);
  const diffHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 2) {
    return ride.price; // 100% fee if < 2 hours
  } else if (diffHours < 24) {
    return ride.price * 0.5; // 50% fee if < 24 hours
  }
  return 0; // Free cancellation
}

// --- 2. Inverse Geofencing (Scenario B) ---
function checkDriverProximity(driverLat: number, driverLng: number, pickupLat: number, pickupLng: number): boolean {
  // Simple Haversine or Euclidean distance for demo
  const R = 6371e3; // metres
  const φ1 = driverLat * Math.PI/180; // φ, λ in radians
  const φ2 = pickupLat * Math.PI/180;
  const Δφ = (pickupLat-driverLat) * Math.PI/180;
  const Δλ = (pickupLng-driverLng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres

  return d <= 500; // 500 meters threshold
}

// --- Routes ---

rideRouter.post("/create", (req: Request, res: Response) => {
  const { passengerId, pickupLocation, dropoffLocation, scheduledTime, price } = req.body;
  
  const ride: Ride = {
    id: crypto.randomUUID(),
    passengerId,
    driverId: "pending",
    pickupLocation,
    dropoffLocation,
    status: 'pending',
    scheduledTime,
    isAnonymized: false,
    price
  };
  
  rides.push(ride);
  res.json(ride);
});

rideRouter.post("/cancel/:id", (req: Request, res: Response) => {
  const ride = rides.find(r => r.id === req.params.id);
  if (!ride) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  
  const fee = calculateCancellationFee(ride);
  ride.status = 'cancelled';
  
  res.json({ 
    message: "Ride cancelled", 
    cancellationFee: fee, 
    currency: "USD" 
  });
});

rideRouter.post("/driver-checkin/:id", (req: Request, res: Response) => {
  const { driverLat, driverLng } = req.body;
  const ride = rides.find(r => r.id === req.params.id);
  
  if (!ride) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  
  // Check if 5 mins before scheduled time
  const now = new Date();
  const scheduled = new Date(ride.scheduledTime);
  const diffMinutes = (scheduled.getTime() - now.getTime()) / (1000 * 60);
  
  if (diffMinutes <= 5 && diffMinutes > 0) {
    const isNearby = checkDriverProximity(driverLat, driverLng, ride.pickupLocation.lat, ride.pickupLocation.lng);
    
    if (!isNearby) {
      // ALERT DISPATCH
      console.error(`[ALERT] Driver for ride ${ride.id} is NOT nearby! Initiating refund protocol.`);
      res.status(400).json({ 
        alert: "DRIVER_NOT_NEARBY", 
        action: "REFUND_INITIATED",
        upgradeOffer: true 
      });
      return;
    }
  }
  
  res.json({ status: "checked_in", proximity: "ok" });
});

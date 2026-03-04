import { Router, Request, Response } from "express";
import crypto from "crypto";

export const logisticsRouter = Router();

// --- Types ---
interface Driver {
  id: string;
  name: string;
  rating: number;
  totalRides: number;
  isSuspended: boolean;
  categories: string[]; // e.g., ['luxury', 'suv', 'standard']
}

interface Ride {
  id: string;
  driverId: string;
  flightNumber?: string;
  scheduledTime: Date;
  estimatedDurationMinutes: number; // Duration of the ride itself
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

// --- Mock Data Store ---
const drivers: Map<string, Driver> = new Map([
  ['driver-1', { id: 'driver-1', name: 'James Bond', rating: 4.9, totalRides: 100, isSuspended: false, categories: ['luxury', 'standard'] }],
  ['driver-2', { id: 'driver-2', name: 'Jason Statham', rating: 4.7, totalRides: 50, isSuspended: false, categories: ['standard'] }] // Already below 4.8, shouldn't be in luxury
]);

const rides: Ride[] = [
  {
    id: 'ride-1',
    driverId: 'driver-1',
    scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    estimatedDurationMinutes: 60,
    status: 'accepted'
  }
];

const BUFFER_MINUTES = 45;

// --- 1. Buffer Algorithm ---

function checkScheduleConflict(driverId: string, newPickupTime: Date, newDurationMinutes: number): { hasConflict: boolean, reason?: string } {
  const driverRides = rides.filter(r => r.driverId === driverId && r.status !== 'cancelled' && r.status !== 'completed');
  const newStart = newPickupTime.getTime();
  const newEnd = newStart + (newDurationMinutes * 60 * 1000);
  const bufferMs = BUFFER_MINUTES * 60 * 1000;

  for (const ride of driverRides) {
    const existingStart = ride.scheduledTime.getTime();
    const existingEnd = existingStart + (ride.estimatedDurationMinutes * 60 * 1000);

    // Case A: New ride is AFTER existing ride
    // Existing End + Buffer > New Start?
    if (existingStart < newStart) {
      if (existingEnd + bufferMs > newStart) {
        return { 
          hasConflict: true, 
          reason: `Insufficient buffer after Ride ${ride.id}. Needed 45m, available ${(newStart - existingEnd) / 60000}m.` 
        };
      }
    }

    // Case B: New ride is BEFORE existing ride
    // New End + Buffer > Existing Start?
    if (newStart < existingStart) {
      if (newEnd + bufferMs > existingStart) {
        return { 
          hasConflict: true, 
          reason: `Insufficient buffer before Ride ${ride.id}. Needed 45m, available ${(existingStart - newEnd) / 60000}m.` 
        };
      }
    }
    
    // Case C: Direct Overlap
    if ((newStart >= existingStart && newStart < existingEnd) || (existingStart >= newStart && existingStart < newEnd)) {
        return { hasConflict: true, reason: `Direct time overlap with Ride ${ride.id}.` };
    }
  }

  return { hasConflict: false };
}

// --- 2. Flight Tracking Module ---

function handleFlightUpdate(flightNumber: string, newArrivalTime: Date) {
  const affectedRides = rides.filter(r => r.flightNumber === flightNumber && r.status === 'accepted');
  const alerts: string[] = [];

  affectedRides.forEach(ride => {
    // Assuming pickup is 30 mins after landing
    const newPickupTime = new Date(newArrivalTime.getTime() + 30 * 60000);
    
    // Check if the new time works for the CURRENTLY assigned driver
    const conflict = checkScheduleConflict(ride.driverId, newPickupTime, ride.estimatedDurationMinutes);

    if (conflict.hasConflict) {
      alerts.push(`CRITICAL: Flight ${flightNumber} update causes conflict for Driver ${ride.driverId} on Ride ${ride.id}. Reason: ${conflict.reason}`);
      // Logic to unassign driver and trigger re-dispatch would go here
      ride.status = 'pending'; // Reset to pending for re-assignment
      ride.driverId = ''; // Unassign
    } else {
      // Update the ride time automatically
      ride.scheduledTime = newPickupTime;
      alerts.push(`INFO: Ride ${ride.id} updated for Flight ${flightNumber}. New Pickup: ${newPickupTime.toISOString()}`);
    }
  });

  return alerts;
}

// --- 3. Quality Assurance (QA) Logic ---

interface RatingSubmission {
  cleanliness: number; // 1-5
  protocol: number; // 1-5
  driving: number; // 1-5
}

function submitDriverRating(driverId: string, ratings: RatingSubmission) {
  const driver = drivers.get(driverId);
  if (!driver) throw new Error("Driver not found");

  const averageRating = (ratings.cleanliness + ratings.protocol + ratings.driving) / 3;
  
  // Update rolling average (Simplified math for demo)
  const totalScore = (driver.rating * driver.totalRides) + averageRating;
  driver.totalRides++;
  driver.rating = parseFloat((totalScore / driver.totalRides).toFixed(2));

  // Check Suspension Threshold
  if (driver.rating < 4.8) {
    // Remove 'luxury' category
    driver.categories = driver.categories.filter(c => c !== 'luxury');
    
    // If they were ONLY luxury, maybe suspend entirely?
    // Requirement: "suspend automatically from Luxury category"
    
    return {
      newRating: driver.rating,
      action: "SUSPENDED_FROM_LUXURY",
      message: `Driver ${driver.name} rating dropped to ${driver.rating}. Removed from Luxury tier.`
    };
  }

  return {
    newRating: driver.rating,
    action: "NONE",
    message: "Rating updated successfully."
  };
}

// --- Routes ---

logisticsRouter.post("/check-availability", (req: Request, res: Response) => {
  const { driverId, pickupTime, durationMinutes } = req.body;
  const result = checkScheduleConflict(driverId, new Date(pickupTime), durationMinutes);
  
  if (result.hasConflict) {
    res.status(409).json(result);
  } else {
    res.json({ status: "available" });
  }
});

logisticsRouter.post("/flight-update", (req: Request, res: Response) => {
  const { flightNumber, newArrivalTime } = req.body;
  const alerts = handleFlightUpdate(flightNumber, new Date(newArrivalTime));
  res.json({ alerts });
});

logisticsRouter.post("/rate-driver", (req: Request, res: Response) => {
  const { driverId, cleanliness, protocol, driving } = req.body;
  
  try {
    const result = submitDriverRating(driverId, { cleanliness, protocol, driving });
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

logisticsRouter.get("/drivers/:id", (req: Request, res: Response) => {
    const driver = drivers.get(req.params.id);
    if(driver) res.json(driver);
    else res.status(404).json({error: "Driver not found"});
});

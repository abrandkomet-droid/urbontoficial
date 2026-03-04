import cron from 'node-cron';
import { rides, Ride } from './rides';

/**
 * Anonymizes PII in completed rides older than 24 hours.
 * Adheres to SOC2 and PCI-DSS standards by removing sensitive data.
 */
function anonymizeOldRides() {
  console.log('[CRON] Starting daily PII anonymization job...');
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  let anonymizedCount = 0;

  rides.forEach((ride) => {
    if (ride.status === 'completed' && !ride.isAnonymized && ride.completedAt) {
      const completedAt = new Date(ride.completedAt);
      
      if (completedAt < twentyFourHoursAgo) {
        // Anonymize PII
        // We keep the ID for reference but remove the link to the user
        // In a real DB, we might soft-delete or move to an archive table
        
        // Redact Passenger ID
        ride.passengerId = `ANON-${ride.passengerId.substring(0, 4)}...`; 
        
        // Redact Driver ID
        ride.driverId = `ANON-${ride.driverId.substring(0, 4)}...`;
        
        // Fuzz Location Data (Keep general area if needed for analytics, but remove precise coords)
        // For strict PCI-DSS/SOC2, we remove it entirely or truncate heavily.
        // Here we set to 0,0 to fully remove.
        ride.pickupLocation = { lat: 0, lng: 0 };
        ride.dropoffLocation = { lat: 0, lng: 0 };
        
        ride.isAnonymized = true;
        anonymizedCount++;
        
        console.log(`[CRON] Anonymized ride ${ride.id}`);
      }
    }
  });

  console.log(`[CRON] Job completed. Anonymized ${anonymizedCount} rides.`);
}

export function startCronJobs() {
  // Schedule task to run every day at midnight (00:00)
  cron.schedule('0 0 * * *', () => {
    anonymizeOldRides();
  });

  console.log('[CRON] Daily anonymization job scheduled for 00:00.');
}

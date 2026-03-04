import { Router, Request, Response } from "express";
import crypto from "crypto";

export const securityRouter = Router();

// --- 1. Velocity Checking (Anti-Fraud) ---
const requestLog: Map<string, number[]> = new Map();
const VELOCITY_LIMIT = 3; // Max 3 requests
const VELOCITY_WINDOW = 10000; // per 10 seconds

function checkVelocity(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  
  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(t => now - t < VELOCITY_WINDOW);
  
  if (recentTimestamps.length >= VELOCITY_LIMIT) {
    return false; // Blocked
  }
  
  recentTimestamps.push(now);
  requestLog.set(ip, recentTimestamps);
  return true;
}

// --- 2. Device Fingerprinting (Mock) ---
const blockedFingerprints: Set<string> = new Set(["bad-device-hash-123"]);

function checkDeviceFingerprint(fingerprint: string): boolean {
  return !blockedFingerprints.has(fingerprint);
}

// --- 3. 3D Secure 2.0 Logic (Mock) ---
function verify3DSecure(cardDetails: any): { verified: boolean, riskScore: number } {
  // In a real scenario, this would call Stripe/Adyen 3DS API
  // Mock logic: high risk if amount > $5000 without history
  const riskScore = Math.random() * 100; // 0-100
  return {
    verified: riskScore < 80, // 80% chance of success for demo
    riskScore
  };
}

// --- 4. Audit Logging (Immutable Hash Chain) ---
interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  data: any;
  previousHash: string;
  hash: string;
}

const auditChain: AuditLog[] = [];

function logAuditEvent(action: string, data: any) {
  const previousBlock = auditChain[auditChain.length - 1];
  const previousHash = previousBlock ? previousBlock.hash : "GENESIS_BLOCK";
  
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({ action, data, previousHash, timestamp });
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  
  const log: AuditLog = {
    id: crypto.randomUUID(),
    timestamp,
    action,
    data,
    previousHash,
    hash
  };
  
  auditChain.push(log);
  console.log(`[AUDIT] Event logged: ${action} | Hash: ${hash.substring(0, 8)}...`);
}

// --- 5. Data Anonymization (PII) ---
// This would typically run as a cron job
export function anonymizeOldData(rides: any[]) {
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  let anonymizedCount = 0;
  
  rides.forEach(ride => {
    if (ride.status === 'completed' && (now - new Date(ride.completedAt).getTime() > TWENTY_FOUR_HOURS)) {
      if (!ride.isAnonymized) {
        ride.passengerName = "ANONYMIZED";
        ride.passengerPhone = "REDACTED";
        ride.pickupLocation = "REDACTED";
        ride.dropoffLocation = "REDACTED";
        ride.isAnonymized = true;
        logAuditEvent("DATA_ANONYMIZATION", { rideId: ride.id });
        anonymizedCount++;
      }
    }
  });
  
  if (anonymizedCount > 0) {
    console.log(`[PRIVACY] Anonymized ${anonymizedCount} records.`);
  }
}

// --- Routes ---

securityRouter.post("/verify-transaction", (req: Request, res: Response) => {
  const ip = req.ip || "unknown";
  const { deviceFingerprint, cardDetails } = req.body;

  // 1. Velocity Check
  if (!checkVelocity(ip)) {
    logAuditEvent("FRAUD_BLOCK_VELOCITY", { ip });
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  // 2. Device Fingerprint
  if (!checkDeviceFingerprint(deviceFingerprint)) {
    logAuditEvent("FRAUD_BLOCK_DEVICE", { deviceFingerprint });
    res.status(403).json({ error: "Device blocked due to suspicious activity." });
    return;
  }

  // 3. 3D Secure
  const { verified, riskScore } = verify3DSecure(cardDetails);
  
  if (!verified) {
    logAuditEvent("FRAUD_BLOCK_3DS", { riskScore });
    res.status(402).json({ error: "Transaction failed 3D Secure verification.", riskScore });
    return;
  }

  logAuditEvent("TRANSACTION_APPROVED", { riskScore });
  res.json({ status: "approved", riskScore });
});

securityRouter.get("/audit-logs", (req: Request, res: Response) => {
  // In production, this would be protected by strict admin auth
  res.json(auditChain);
});

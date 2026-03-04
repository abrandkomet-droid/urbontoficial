# Urbont Technical Integration Specs (CTO Level)

## 1. Push Notification JSON Structures (FCM/APNS)

### Scenario: Driver Reassigned (Contingency Triggered)
```json
{
  "to": "/topics/user_{user_id}",
  "notification": {
    "title": "Urbont Service Update",
    "body": "Your chauffeur has been upgraded to ensure punctuality. Meet James in the Black S-Class (Plate: URB-007)."
  },
  "data": {
    "type": "DRIVER_REASSIGNED",
    "ride_id": "ride_12345",
    "new_driver_name": "James Bond",
    "new_vehicle": "Mercedes-Benz S-Class",
    "plate": "URB-007",
    "rating": 5.0
  },
  "priority": "high"
}
```

### Scenario: Grace Period Ending (15 min City / 60 min Airport)
```json
{
  "to": "/topics/user_{user_id}",
  "notification": {
    "title": "Chauffeur Waiting",
    "body": "Your complimentary grace period ends in 5 minutes. Waiting charges will apply thereafter."
  },
  "data": {
    "type": "GRACE_PERIOD_WARNING",
    "ride_id": "ride_12345",
    "remaining_minutes": 5,
    "waiting_rate": "$2.50/min"
  }
}
```

### Scenario: Red Alert (To Admin/Dispatch - "God's Eye")
```json
{
  "to": "/topics/admin_alerts",
  "notification": {
    "title": "🔴 RED ALERT: Route Deviation",
    "body": "Ride #12345 deviated >300m from route. Immediate attention required."
  },
  "data": {
    "type": "SECURITY_ALERT",
    "ride_id": "ride_12345",
    "driver_id": "driver_99",
    "deviation_meters": 450,
    "location": "40.748817, -73.985428",
    "timestamp": "2024-05-20T14:30:00Z"
  },
  "priority": "high"
}
```

## 2. Required Webhooks (Phase 2 Integration)

### Stripe (Payments & Fraud)
| Event | Action |
| :--- | :--- |
| `payment_intent.succeeded` | Confirm booking, release pre-auth hold. |
| `payment_intent.payment_failed` | Trigger "Payment Update Required" email to user. Do not dispatch driver. |
| `charge.dispute.created` | **Critical:** Auto-freeze user account. Log event in `audit_logs`. |
| `radar.early_fraud_warning.created` | Flag user for manual review. Enable 3D Secure mandatory for next booking. |

### FlightAware (Airport Protocol)
| Event | Action |
| :--- | :--- |
| `flight_status` | Update `flight_arrival_time` in DB. |
| `arrival_time` | Recalculate `pickup_time` using logic: `Arrival + 15m (Taxi) + 45m (Intl)`. |
| `cancellation` | Notify user immediately. Offer free cancellation or reschedule. |
| `diversion` | Trigger "Flight Diverted" protocol. Cancel ride without fee. |

### Google Maps Platform (Navigation & Geofencing)
| API / Event | Usage |
| :--- | :--- |
| `Geofencing API` (Entry) | Trigger "Driver Arrived" notification when driver enters 100m radius of pickup. |
| `Routes API` (Compute Routes) | Calculate `expected_route_polyline` for "God's Eye" deviation checks. |
| `Places API` | Validate pickup/dropoff addresses for "Velocity Checking" (e.g., prevent 5 bookings to same address in 1 min). |

## 3. PII Anonymization Protocol (SOC2/PCI-DSS)

**Execution:** Daily Cron Job at 03:00 UTC.

**Logic:**
1. Select all rides where `status = 'completed'` AND `completed_at < NOW() - INTERVAL '24 HOURS'`.
2. For each record:
   - `passenger_name` -> `SHA256(passenger_name)` (One-way hash for analytics, irreversible).
   - `phone_number` -> `REDACTED`.
   - `pickup_address` -> `City, State` (Drop street address).
   - `dropoff_address` -> `City, State`.
3. Log the number of anonymized records in `audit_logs`.
4. **Hard Delete** any temporary logs or cache associated with the ride ID.

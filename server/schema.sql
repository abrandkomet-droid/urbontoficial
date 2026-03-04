-- Database Schema for Urbont Security & Operations (PostgreSQL Syntax)

-- 1. Users (Passengers & Drivers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_hash VARCHAR(255) NOT NULL, -- Hashed for privacy
    role VARCHAR(50) CHECK (role IN ('passenger', 'chauffeur', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    risk_score DECIMAL(5, 2) DEFAULT 0.00, -- 0-100 score from Sift/LexisNexis
    
    -- Checkr Background Check Integration
    checkr_candidate_id VARCHAR(100),
    checkr_report_id VARCHAR(100),
    background_check_status VARCHAR(50) DEFAULT 'pending', -- pending, clear, consider, suspended
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Devices (Fingerprinting)
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    fingerprint_hash VARCHAR(255) UNIQUE NOT NULL,
    last_ip VARCHAR(45),
    is_blocked BOOLEAN DEFAULT FALSE,
    trust_score DECIMAL(5, 2) DEFAULT 100.00
);

-- 3. Rides (Core Transaction)
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES users(id),
    chauffeur_id UUID REFERENCES users(id),
    
    -- Location Data (Encrypted at rest)
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),
    
    status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded')),
    
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_time TIMESTAMP WITH TIME ZONE,
    
    -- Financials
    estimated_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2),
    cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Logistics
    flight_number VARCHAR(20),
    flight_arrival_time TIMESTAMP WITH TIME ZONE,
    
    -- Security Flags
    is_anonymized BOOLEAN DEFAULT FALSE, -- PII wiped after 24h
    fraud_check_passed BOOLEAN DEFAULT FALSE,
    proximity_validated BOOLEAN DEFAULT FALSE
);

-- 5. Ratings & QA
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    driver_id UUID REFERENCES users(id),
    passenger_id UUID REFERENCES users(id),
    
    cleanliness_score INT CHECK (cleanliness_score BETWEEN 1 AND 5),
    protocol_score INT CHECK (protocol_score BETWEEN 1 AND 5),
    driving_score INT CHECK (driving_score BETWEEN 1 AND 5),
    
    average_score DECIMAL(3, 2) GENERATED ALWAYS AS ((cleanliness_score + protocol_score + driving_score) / 3.0) STORED,
    
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Product Features (VIP, Billing, Hourly)
ALTER TABLE users ADD COLUMN vip_preferences JSONB DEFAULT '{}';
-- Structure: { temperature: '20C', music: 'Jazz', conversation: 'Minimal', amenities: ['Water', 'Charger'] }

CREATE TABLE billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(20) CHECK (type IN ('personal', 'corporate')),
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    email_for_receipts VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE
);

ALTER TABLE rides ADD COLUMN booking_type VARCHAR(20) DEFAULT 'distance' CHECK (booking_type IN ('distance', 'hourly'));
ALTER TABLE rides ADD COLUMN hourly_duration INT; -- in hours
ALTER TABLE rides ADD COLUMN included_miles INT;
ALTER TABLE rides ADD COLUMN billing_profile_id UUID REFERENCES billing_profiles(id);
ALTER TABLE rides ADD COLUMN flight_grace_period_minutes INT DEFAULT 0;
ALTER TABLE rides ADD COLUMN grace_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE rides ADD COLUMN grace_period_end TIMESTAMP WITH TIME ZONE;

-- 7. Chauffeur Checklists (Protocol-Driven)
CREATE TABLE chauffeur_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    driver_id UUID REFERENCES users(id),
    vehicle_clean BOOLEAN NOT NULL,
    amenities_stocked BOOLEAN NOT NULL,
    attire_compliant BOOLEAN NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Telemetry & "God's Eye" Logs
CREATE TABLE telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    driver_id UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed_mph DECIMAL(5, 2),
    g_force_x DECIMAL(5, 3), -- Accelerometer data
    g_force_y DECIMAL(5, 3),
    event_type VARCHAR(50) CHECK (event_type IN ('normal', 'harsh_braking', 'sharp_turn', 'speeding', 'route_deviation', 'unauthorized_stop')),
    deviation_meters DECIMAL(10, 2) -- Distance from expected route
);

-- 9. The Language Bridge (Conversation History)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id),
    sender_id UUID REFERENCES users(id), -- Driver or Passenger
    sender_role VARCHAR(20) CHECK (sender_role IN ('chauffeur', 'passenger')),
    
    original_text TEXT,
    translated_text TEXT,
    
    source_language VARCHAR(5) DEFAULT 'en', -- 'en' or 'es'
    target_language VARCHAR(5) DEFAULT 'es',
    
    audio_url VARCHAR(255), -- Path to stored audio file (if persisted)
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Driver Compliance Documents
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES users(id),
    document_type VARCHAR(50) CHECK (document_type IN ('commercial_license', 'liability_insurance', 'airport_permit', 'vehicle_registration')),
    document_number VARCHAR(100),
    image_url VARCHAR(255),
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('valid', 'expired', 'pending', 'rejected')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_rides_scheduled ON rides(scheduled_time);
CREATE INDEX idx_audit_entity ON audit_logs(entity_id);
CREATE INDEX idx_ratings_driver ON ratings(driver_id);
CREATE INDEX idx_telemetry_ride ON telemetry_events(ride_id);
CREATE INDEX idx_conversations_ride ON conversations(ride_id);
CREATE INDEX idx_driver_docs_driver ON driver_documents(driver_id);
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL, -- ID of the ride/user being modified
    action_type VARCHAR(100) NOT NULL, -- e.g., 'RIDE_CANCELLED', 'PRICE_ADJUSTED'
    actor_id UUID REFERENCES users(id), -- Who made the change
    
    previous_state JSONB, -- Snapshot before change
    new_state JSONB, -- Snapshot after change
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Cryptographic Proof
    previous_hash VARCHAR(64) NOT NULL, -- Hash of the previous log entry
    current_hash VARCHAR(64) NOT NULL -- SHA-256(timestamp + action + data + prev_hash)
);

-- Indexes for Performance
CREATE INDEX idx_rides_scheduled ON rides(scheduled_time);
CREATE INDEX idx_audit_entity ON audit_logs(entity_id);

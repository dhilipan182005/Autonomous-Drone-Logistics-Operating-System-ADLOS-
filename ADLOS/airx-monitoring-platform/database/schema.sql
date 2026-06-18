CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'OPERATOR', 'AGENT', 'AUTHORITY', 'SUPER_ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airx_id VARCHAR(50) UNIQUE NOT NULL,
    drone_name VARCHAR(255),
    drone_model VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(100) UNIQUE,
    owner_id UUID REFERENCES profiles(id),
    operator_id UUID REFERENCES profiles(id),
    registration_number VARCHAR(100),
    insurance_number VARCHAR(100),
    home_location_lat DOUBLE PRECISION,
    home_location_lng DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drone_id UUID REFERENCES drones(id),
    operator_id UUID REFERENCES profiles(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    mission_purpose VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_FLIGHT', 'COMPLETED', 'EMERGENCY', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES flights(id),
    drone_id UUID REFERENCES drones(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    battery_percentage INTEGER,
    signal_strength INTEGER,
    current_zone VARCHAR(50)
);

CREATE INDEX idx_telemetry_drone_id_timestamp ON telemetry(drone_id, timestamp DESC);

CREATE TABLE airspace_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('AIRPORT', 'RESTRICTED', 'CONTROLLED', 'SAFE')),
    zone_color VARCHAR(20) NOT NULL CHECK (zone_color IN ('GREEN', 'YELLOW', 'RED')),
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_meters DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drone_id UUID REFERENCES drones(id),
    flight_id UUID REFERENCES flights(id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('LOW_BATTERY', 'SIGNAL_LOSS', 'RESTRICTED_ZONE_ENTRY', 'CRITICAL_FAILURE')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT
);

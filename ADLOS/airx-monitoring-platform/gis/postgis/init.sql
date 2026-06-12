-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Operator Management
CREATE TABLE IF NOT EXISTS operators (
    operator_id VARCHAR(50) PRIMARY KEY,
    operator_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    certification VARCHAR(100),
    organization VARCHAR(100),
    contact_details VARCHAR(255),
    authorization_level VARCHAR(50),
    status VARCHAR(20)
);

-- 2. Drone Registration
CREATE TABLE IF NOT EXISTS drone_registry (
    drone_id VARCHAR(50) PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    weight_class VARCHAR(50),
    owner VARCHAR(100),
    operator_id VARCHAR(50) REFERENCES operators(operator_id),
    license_number VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    validity TIMESTAMP
);

-- 3. Airspace Zones (Geofencing)
CREATE TABLE IF NOT EXISTS airspace_zones (
    zone_id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) NOT NULL, -- GREEN, YELLOW, RED
    authority VARCHAR(100),
    status VARCHAR(20),
    altitude_limit_ft INT,
    permission_required BOOLEAN,
    geom GEOMETRY(Polygon, 4326),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Airports table
CREATE TABLE IF NOT EXISTS airports (
    airport_id SERIAL PRIMARY KEY,
    airport_name VARCHAR(150) NOT NULL,
    icao VARCHAR(10) UNIQUE NOT NULL,
    iata VARCHAR(10) UNIQUE,
    location GEOMETRY(Point, 4326) NOT NULL,
    radius_meters FLOAT NOT NULL DEFAULT 5000
);

-- 5. Geofences table
CREATE TABLE IF NOT EXISTS geofences (
    fence_id SERIAL PRIMARY KEY,
    fence_name VARCHAR(100) NOT NULL,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    restriction_level VARCHAR(50) NOT NULL -- RED, YELLOW, GREEN
);

-- 6. Flight Permissions
CREATE TABLE IF NOT EXISTS flight_permissions (
    request_id VARCHAR(50) PRIMARY KEY,
    drone_id VARCHAR(50) NOT NULL REFERENCES drone_registry(drone_id),
    operator_id VARCHAR(50) NOT NULL REFERENCES operators(operator_id),
    route GEOMETRY(LineString, 4326) NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, APPROVED, REJECTED, EXPIRED
    approved_by VARCHAR(100),
    approved_at TIMESTAMP
);

-- 7. Missions
CREATE TABLE IF NOT EXISTS missions (
    mission_id VARCHAR(50) PRIMARY KEY,
    mission_name VARCHAR(100),
    operator_id VARCHAR(50) REFERENCES operators(operator_id),
    drone_id VARCHAR(50) REFERENCES drone_registry(drone_id),
    launch_location GEOMETRY(Point, 4326),
    destination GEOMETRY(Point, 4326),
    planned_route GEOMETRY(LineString, 4326),
    planned_altitude_ft INT,
    planned_duration_min INT,
    mission_status VARCHAR(50),
    approval_status VARCHAR(50),
    risk_score FLOAT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Drone Telemetry (Live Tracking)
CREATE TABLE IF NOT EXISTS drone_telemetry (
    record_id SERIAL PRIMARY KEY,
    drone_id VARCHAR(50) REFERENCES drone_registry(drone_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    altitude_ft FLOAT,
    speed_kmh FLOAT,
    heading FLOAT,
    battery_percentage FLOAT,
    signal_strength FLOAT,
    status VARCHAR(20),
    mission_id VARCHAR(50) REFERENCES missions(mission_id)
);

-- 9. Violations
CREATE TABLE IF NOT EXISTS violations (
    violation_id SERIAL PRIMARY KEY,
    drone_id VARCHAR(50) REFERENCES drone_registry(drone_id),
    operator_id VARCHAR(50) REFERENCES operators(operator_id),
    violation_location GEOMETRY(Point, 4326),
    violation_type VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity VARCHAR(20),
    status VARCHAR(20),
    resolution_notes TEXT,
    evidence_link VARCHAR(255)
);

-- ==========================================
-- SEED DATA SECTION (DGCA Enterprise Compliant)
-- ==========================================

-- Seed Operators
INSERT INTO operators (operator_id, operator_name, license_number, certification, organization, contact_details, authorization_level, status) VALUES
('OP-001', 'Aditya Sharma', 'UAOP-DEL-43920', 'Basic Remote Pilot License', 'IndiDrone Solutions', 'aditya.sharma@indidrone.in', 'COMMERCIAL', 'ACTIVE'),
('OP-002', 'Priya Patel', 'UAOP-BOM-87491', 'Advanced Drone Operations', 'Skyskye Logistics', 'priya.patel@skyskye.com', 'COMMERCIAL', 'ACTIVE'),
('OP-003', 'Rajesh Kumar', 'UAOP-BLR-12345', 'Basic Remote Pilot License', 'EcoAgri Services', 'rajesh.kumar@ecoagri.co.in', 'AGRICULTURE', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Seed Drones (AIRX-0001 to AIRX-0050 matching simulation)
DO $$
BEGIN
    FOR i IN 1..50 LOOP
        INSERT INTO drone_registry (drone_id, registration_number, manufacturer, model, serial_number, weight_class, owner, operator_id, license_number, status, validity)
        VALUES (
            'AIRX-' || LPAD(i::text, 4, '0'),
            'UIN-D' || LPAD((1000 + i)::text, 4, '0'),
            CASE WHEN i % 2 = 0 THEN 'DJI' ELSE 'IdeaForge' END,
            CASE WHEN i % 2 = 0 THEN 'Matrice 300 RTK' ELSE 'NETRA V4' END,
            'SN-SER-' || LPAD(i::text, 6, '0'),
            CASE WHEN i % 3 = 0 THEN 'MICRO' WHEN i % 3 = 1 THEN 'SMALL' ELSE 'MEDIUM' END,
            'AeroGov India',
            'OP-00' || ((i % 3) + 1),
            'UAOP-DEL-' || LPAD((40000 + i)::text, 5, '0'),
            'ACTIVE',
            '2028-12-31 23:59:59'
        ) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Seed Airports (6 Major Hubs)
INSERT INTO airports (airport_name, icao, iata, location, radius_meters) VALUES
('Indira Gandhi International Airport', 'VIDP', 'DEL', ST_SetSRID(ST_MakePoint(77.1000, 28.5562), 4326), 5000),
('Chhatrapati Shivaji Maharaj International Airport', 'VABB', 'BOM', ST_SetSRID(ST_MakePoint(72.8656, 19.0896), 4326), 5000),
('Kempegowda International Airport', 'VOBL', 'BLR', ST_SetSRID(ST_MakePoint(77.7066, 13.1986), 4326), 5000),
('Chennai International Airport', 'VOMM', 'MAA', ST_SetSRID(ST_MakePoint(80.1709, 12.9941), 4326), 5000),
('Netaji Subhash Chandra Bose International Airport', 'VECC', 'CCU', ST_SetSRID(ST_MakePoint(88.4467, 22.6547), 4326), 5000),
('Rajiv Gandhi International Airport', 'VOHY', 'HYD', ST_SetSRID(ST_MakePoint(78.4294, 17.2403), 4326), 5000)
ON CONFLICT (icao) DO NOTHING;

-- Seed Airspace Zones
-- Delhi Red Zone (Rashtrapati Bhavan / Parliament)
INSERT INTO airspace_zones (zone_name, zone_type, authority, status, altitude_limit_ft, permission_required, geom) VALUES
('Delhi Central High Security Zone', 'RED', 'DGCA / Ministry of Home Affairs', 'ACTIVE', 0, TRUE,
 ST_GeomFromText('POLYGON((77.18 28.60, 77.23 28.60, 77.23 28.64, 77.18 28.64, 77.18 28.60))', 4326))
ON CONFLICT DO NOTHING;

-- Jodhpur Border Airbase (Red Zone)
INSERT INTO airspace_zones (zone_name, zone_type, authority, status, altitude_limit_ft, permission_required, geom) VALUES
('Jodhpur Border Restricted Zone', 'RED', 'Indian Air Force', 'ACTIVE', 0, TRUE,
 ST_GeomFromText('POLYGON((72.95 26.22, 73.05 26.22, 73.05 26.30, 72.95 26.30, 72.95 26.22))', 4326))
ON CONFLICT DO NOTHING;

-- Delhi Yellow Zone (Airport Perimeter Buffer)
INSERT INTO airspace_zones (zone_name, zone_type, authority, status, altitude_limit_ft, permission_required, geom) VALUES
('Delhi Airport Buffer Controlled Airspace', 'YELLOW', 'AAI / Delhi ATC', 'ACTIVE', 200, TRUE,
 ST_GeomFromText('POLYGON((77.00 28.50, 77.20 28.50, 77.20 28.62, 77.00 28.62, 77.00 28.50))', 4326))
ON CONFLICT DO NOTHING;

-- Bengaluru Tech Corridor Green Zone
INSERT INTO airspace_zones (zone_name, zone_type, authority, status, altitude_limit_ft, permission_required, geom) VALUES
('Bengaluru Tech Corridor Open Zone', 'GREEN', 'DGCA', 'ACTIVE', 400, FALSE,
 ST_GeomFromText('POLYGON((77.60 12.85, 77.85 12.85, 77.85 13.05, 77.60 13.05, 77.60 12.85))', 4326))
ON CONFLICT DO NOTHING;

-- Mumbai Outer Green Zone
INSERT INTO airspace_zones (zone_name, zone_type, authority, status, altitude_limit_ft, permission_required, geom) VALUES
('Mumbai Outer Green Zone', 'GREEN', 'DGCA', 'ACTIVE', 400, FALSE,
 ST_GeomFromText('POLYGON((72.90 19.10, 73.15 19.10, 73.15 19.35, 72.90 19.35, 72.90 19.10))', 4326))
ON CONFLICT DO NOTHING;

-- Seed Geofences
INSERT INTO geofences (fence_name, geometry, restriction_level) VALUES
('Sanjay Gandhi National Park Sanctuary',
 ST_GeomFromText('POLYGON((72.85 19.15, 72.95 19.15, 72.95 19.25, 72.85 19.25, 72.85 19.15))', 4326), 'YELLOW'),
('Parliament Complex Temporal Protection Fence',
 ST_GeomFromText('POLYGON((77.20 28.61, 77.22 28.61, 77.22 28.63, 77.20 28.63, 77.20 28.61))', 4326), 'RED')
ON CONFLICT DO NOTHING;

-- Seed Permissions
INSERT INTO flight_permissions (request_id, drone_id, operator_id, route, status, approved_by, approved_at) VALUES
('PERM-001', 'AIRX-0001', 'OP-001', ST_GeomFromText('LINESTRING(77.15 28.58, 77.16 28.59, 77.17 28.60)', 4326), 'APPROVED', 'DGCA_AUTOMATION', CURRENT_TIMESTAMP),
('PERM-002', 'AIRX-0002', 'OP-002', ST_GeomFromText('LINESTRING(72.88 19.12, 72.89 19.13, 72.90 19.14)', 4326), 'APPROVED', 'DGCA_AUTOMATION', CURRENT_TIMESTAMP),
('PERM-003', 'AIRX-0003', 'OP-003', ST_GeomFromText('LINESTRING(77.65 12.92, 77.66 12.93, 77.67 12.94)', 4326), 'PENDING', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Trigger to automatically update geography/geometry Point from Lat/Lng fields
CREATE OR REPLACE FUNCTION update_telemetry_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_telemetry_location
BEFORE INSERT ON drone_telemetry
FOR EACH ROW
EXECUTE FUNCTION update_telemetry_location();



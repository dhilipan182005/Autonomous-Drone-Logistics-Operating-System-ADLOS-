// =====================================================
// AIRX Monitoring Platform™ — Command Center Engine
// =====================================================

// ---- Configuration ----
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// ---- Initialize Leaflet Map ----
const map = L.map('map', { zoomControl: true }).setView(INDIA_CENTER, DEFAULT_ZOOM);

// High-contrast clean light tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// ---- Layer Groups ----
const layers = {
    drones: L.layerGroup().addTo(map),
    airports: L.layerGroup().addTo(map),
    redZones: L.layerGroup().addTo(map),
    yellowZones: L.layerGroup().addTo(map),
    greenZones: L.layerGroup().addTo(map),
    geofences: L.layerGroup().addTo(map),
    flightPaths: L.layerGroup().addTo(map)
};

// ---- State ----
const droneMarkers = {};
const activeDronesData = {};
let alertCount = 0;
let violationCount = 0;

// ---- Embedded Fallback Zone Data ----
// Used when the backend API is unreachable (cold start, network issue, etc.)
const FALLBACK_ZONES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "Delhi Central High Security Zone", "type": "RED", "altitudeLimit": 0, "authority": "DGCA / Ministry of Home Affairs" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[77.18, 28.60], [77.23, 28.60], [77.23, 28.64], [77.18, 28.64], [77.18, 28.60]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Jodhpur Border Restricted Zone", "type": "RED", "altitudeLimit": 0, "authority": "Indian Air Force" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[72.95, 26.22], [73.05, 26.22], [73.05, 26.30], [72.95, 26.30], [72.95, 26.22]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Delhi Airport Buffer Controlled Airspace", "type": "YELLOW", "altitudeLimit": 200, "authority": "AAI / Delhi ATC" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[77.00, 28.50], [77.20, 28.50], [77.20, 28.62], [77.00, 28.62], [77.00, 28.50]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Bengaluru Tech Corridor Open Zone", "type": "GREEN", "altitudeLimit": 400, "authority": "DGCA" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[77.60, 12.85], [77.85, 12.85], [77.85, 13.05], [77.60, 13.05], [77.60, 12.85]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Mumbai Outer Green Zone", "type": "GREEN", "altitudeLimit": 400, "authority": "DGCA" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[72.90, 19.10], [73.15, 19.10], [73.15, 19.35], [72.90, 19.35], [72.90, 19.10]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Hyderabad Controlled Corridor", "type": "YELLOW", "altitudeLimit": 200, "authority": "AAI / Hyderabad ATC" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[78.30, 17.20], [78.55, 17.20], [78.55, 17.35], [78.30, 17.35], [78.30, 17.20]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Chennai Coastal Green Zone", "type": "GREEN", "altitudeLimit": 400, "authority": "DGCA" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[80.10, 12.90], [80.35, 12.90], [80.35, 13.10], [80.10, 13.10], [80.10, 12.90]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Jaisalmer Military Restricted Area", "type": "RED", "altitudeLimit": 0, "authority": "Indian Air Force" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[70.80, 26.80], [71.10, 26.80], [71.10, 27.05], [70.80, 27.05], [70.80, 26.80]]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Kolkata Metro Green Zone", "type": "GREEN", "altitudeLimit": 400, "authority": "DGCA" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[88.30, 22.50], [88.55, 22.50], [88.55, 22.70], [88.30, 22.70], [88.30, 22.50]]]
            }
        }
    ]
};

const FALLBACK_AIRPORTS = [
    { name: "Indira Gandhi International Airport", icao: "VIDP", iata: "DEL", lat: 28.5562, lng: 77.1000 },
    { name: "Chhatrapati Shivaji Maharaj Intl Airport", icao: "VABB", iata: "BOM", lat: 19.0896, lng: 72.8656 },
    { name: "Kempegowda International Airport", icao: "VOBL", iata: "BLR", lat: 13.1986, lng: 77.7066 },
    { name: "Chennai International Airport", icao: "VOMM", iata: "MAA", lat: 12.9941, lng: 80.1709 },
    { name: "Netaji Subhash Chandra Bose Intl Airport", icao: "VECC", iata: "CCU", lat: 22.6547, lng: 88.4467 },
    { name: "Rajiv Gandhi International Airport", icao: "VOHY", iata: "HYD", lat: 17.2403, lng: 78.4294 }
];

const FALLBACK_GEOFENCES = [
    {
        name: "Sanjay Gandhi National Park Sanctuary",
        level: "YELLOW",
        geometry: { "type": "Polygon", "coordinates": [[[72.85, 19.15], [72.95, 19.15], [72.95, 19.25], [72.85, 19.25], [72.85, 19.15]]] }
    },
    {
        name: "Parliament Complex Temporal Protection Fence",
        level: "RED",
        geometry: { "type": "Polygon", "coordinates": [[[77.20, 28.61], [77.22, 28.61], [77.22, 28.63], [77.20, 28.63], [77.20, 28.61]]] }
    }
];

// ============================================================
// LIVE CLOCK
// ============================================================
function updateClock() {
    const now = new Date();
    const utc = now.toISOString().split('T')[1].split('.')[0];
    const local = now.toLocaleTimeString('en-IN', { hour12: false });
    const el = document.getElementById('header-clock');
    if (el) el.innerText = `${local} IST | ${utc} UTC`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// MAP EVENTS
// ============================================================
map.on('mousemove', (e) => {
    document.getElementById('mouse-coords').innerText = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
});
map.on('zoomend', () => {
    document.getElementById('zoom-level').innerText = map.getZoom();
});

// ============================================================
// ZONE RENDERING (GeoJSON → Leaflet)
// ============================================================
function renderZoneFeature(feature, targetLayer) {
    const props = feature.properties;
    const zoneType = props.type || 'GREEN';
    const color = zoneType === 'RED' ? '#F44336' : (zoneType === 'YELLOW' ? '#FFC107' : '#4CAF50');
    const fillOpacity = zoneType === 'RED' ? 0.30 : (zoneType === 'YELLOW' ? 0.22 : 0.15);

    L.geoJSON(feature.geometry, {
        style: {
            fillColor: color,
            fillOpacity: fillOpacity,
            color: color,
            weight: 2,
            dashArray: zoneType === 'YELLOW' ? '5, 5' : null
        }
    }).addTo(targetLayer).bindPopup(`
        <div class="gov-popup">
            <h3>ZONE: ${props.name}</h3>
            <b>Classification:</b> ${zoneType} Zone<br>
            <b>Alt Limit:</b> 0-${props.altitudeLimit || props.limit || 0} ft<br>
            <b>Authority:</b> ${props.authority || 'DGCA'}
        </div>
    `);
}

function renderAirport(airport, targetLayer) {
    const latlng = [airport.lat, airport.lng];

    // Airport marker
    L.circleMarker(latlng, {
        radius: 7,
        fillColor: '#0B3D91',
        color: '#FFFFFF',
        weight: 2.5,
        fillOpacity: 1
    }).addTo(targetLayer).bindPopup(`
        <div class="gov-popup">
            <h3>AIRPORT: ${airport.name}</h3>
            <b>ICAO:</b> ${airport.icao} | <b>IATA:</b> ${airport.iata}<br>
            <b>Safety Rings:</b> 5 km Exclusion (RED) | 12 km Controlled (YELLOW)
        </div>
    `);

    // 5 km exclusion ring (RED)
    L.circle(latlng, {
        radius: 5000,
        fillColor: '#F44336',
        color: '#F44336',
        weight: 2,
        fillOpacity: 0.12,
        dashArray: '3, 6'
    }).addTo(targetLayer);

    // 12 km controlled buffer (YELLOW)
    L.circle(latlng, {
        radius: 12000,
        fillColor: '#FFC107',
        color: '#FFC107',
        weight: 1.5,
        fillOpacity: 0.06,
        dashArray: '5, 5'
    }).addTo(targetLayer);
}

function renderGeofence(fence, targetLayer) {
    const color = fence.level === 'RED' ? '#F44336' : '#FFC107';
    L.geoJSON(fence.geometry, {
        style: {
            fillColor: color,
            fillOpacity: 0.25,
            color: color,
            weight: 1.5
        }
    }).addTo(targetLayer).bindPopup(`
        <div class="gov-popup">
            <h3>GEOFENCE: ${fence.name}</h3>
            <b>Restriction:</b> ${fence.level} Restricted Area
        </div>
    `);
}

// ============================================================
// LOAD GIS LAYERS (Backend → Fallback)
// ============================================================
async function loadGisLayers() {
    let zonesLoaded = false;
    let airportsLoaded = false;
    let geofencesLoaded = false;
    let zoneCount = 0;
    let airportCount = 0;

    // 1. Load Airspace Zones
    try {
        const zonesRes = await fetch('/api/gis/zones');
        if (zonesRes.ok) {
            const zones = await zonesRes.json();
            if (zones && zones.length > 0) {
                zones.forEach(zone => {
                    const geom = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry;
                    const zoneType = zone.zone_type || zone.type || 'GREEN';
                    const targetLayer = zoneType === 'RED' ? layers.redZones : (zoneType === 'YELLOW' ? layers.yellowZones : layers.greenZones);
                    renderZoneFeature({
                        geometry: geom,
                        properties: {
                            name: zone.zone_name || zone.name,
                            type: zoneType,
                            altitudeLimit: zone.altitude_limit_ft || zone.altitudeLimit || 0,
                            authority: zone.authority || 'DGCA'
                        }
                    }, targetLayer);
                });
                zoneCount = zones.length;
                zonesLoaded = true;
                console.log(`[GIS] Loaded ${zones.length} zones from backend API`);
            }
        }
    } catch (err) {
        console.warn("[GIS] Backend zones API unavailable, using fallback data", err.message);
    }

    // Fallback: use embedded GeoJSON
    if (!zonesLoaded) {
        FALLBACK_ZONES.features.forEach(feature => {
            const zoneType = feature.properties.type;
            const targetLayer = zoneType === 'RED' ? layers.redZones : (zoneType === 'YELLOW' ? layers.yellowZones : layers.greenZones);
            renderZoneFeature(feature, targetLayer);
        });
        zoneCount = FALLBACK_ZONES.features.length;
        console.log(`[GIS] Loaded ${FALLBACK_ZONES.features.length} zones from fallback data`);
    }

    // 2. Load Airports
    try {
        const airportsRes = await fetch('/api/gis/airports');
        if (airportsRes.ok) {
            const airports = await airportsRes.json();
            if (airports && airports.length > 0) {
                airports.forEach(airport => {
                    const loc = typeof airport.location === 'string' ? JSON.parse(airport.location) : airport.location;
                    renderAirport({
                        name: airport.airport_name || airport.name,
                        icao: airport.icao,
                        iata: airport.iata,
                        lat: loc.coordinates[1],
                        lng: loc.coordinates[0]
                    }, layers.airports);
                });
                airportCount = airports.length;
                airportsLoaded = true;
                console.log(`[GIS] Loaded ${airports.length} airports from backend API`);
            }
        }
    } catch (err) {
        console.warn("[GIS] Backend airports API unavailable, using fallback data", err.message);
    }

    if (!airportsLoaded) {
        FALLBACK_AIRPORTS.forEach(airport => renderAirport(airport, layers.airports));
        airportCount = FALLBACK_AIRPORTS.length;
        console.log(`[GIS] Loaded ${FALLBACK_AIRPORTS.length} airports from fallback data`);
    }

    // 3. Load Geofences
    try {
        const geofenceRes = await fetch('/api/gis/geofences');
        if (geofenceRes.ok) {
            const geofences = await geofenceRes.json();
            if (geofences && geofences.length > 0) {
                geofences.forEach(fence => {
                    const geom = typeof fence.geometry === 'string' ? JSON.parse(fence.geometry) : fence.geometry;
                    renderGeofence({
                        name: fence.fence_name || fence.name,
                        level: fence.restriction_level || fence.level,
                        geometry: geom
                    }, layers.geofences);
                });
                geofencesLoaded = true;
                console.log(`[GIS] Loaded ${geofences.length} geofences from backend API`);
            }
        }
    } catch (err) {
        console.warn("[GIS] Backend geofences API unavailable, using fallback data", err.message);
    }

    if (!geofencesLoaded) {
        FALLBACK_GEOFENCES.forEach(fence => renderGeofence(fence, layers.geofences));
        console.log(`[GIS] Loaded ${FALLBACK_GEOFENCES.length} geofences from fallback data`);
    }

    // 4. Load Flight Paths
    try {
        const pathsRes = await fetch('/api/permissions');
        if (pathsRes.ok) {
            const permissions = await pathsRes.json();
            permissions.forEach(perm => {
                if (perm.route && perm.status === 'APPROVED') {
                    const routeWkt = perm.route;
                    const coords = routeWkt.replace("LINESTRING(", "").replace(")", "").split(", ").map(c => {
                        const parts = c.split(" ");
                        return [parseFloat(parts[1]), parseFloat(parts[0])];
                    });
                    L.polyline(coords, {
                        color: '#0B3D91',
                        weight: 2,
                        opacity: 0.6,
                        dashArray: '6, 6'
                    }).addTo(layers.flightPaths).bindPopup(`<b>FLIGHT PATH: ${perm.requestId}</b><br>Approved Route`);
                }
            });
        }
    } catch (err) {
        console.warn("[GIS] Flight paths unavailable", err.message);
    }

    // Update KPI counters
    document.getElementById('kpi-zones').innerText = zoneCount;
    document.getElementById('kpi-airports').innerText = airportCount;
}

// ============================================================
// FETCH KPI DATA FROM BACKEND
// ============================================================
async function loadKpiData() {
    // Fetch total registered drones
    try {
        const res = await fetch('/api/drone_positions');
        // The endpoint may return drone count or we can derive it
    } catch (e) { /* backend offline */ }

    // Fetch planned missions
    try {
        const res = await fetch('/api/gis/zones');
        // Already handled above
    } catch (e) { /* */ }

    // For now, the drone count comes from the seed data (50 drones)
    // We'll update this once drones connect via WebSocket
    try {
        const res = await fetch('/api/gis/zones');
        if (res.ok) {
            // Backend is reachable, so database should have 50 seeded drones
            document.getElementById('kpi-total-drones').innerText = '50';
        }
    } catch (e) {
        // Backend offline — KPIs stay at 0
    }
}

// ============================================================
// LAYER TOGGLES
// ============================================================
function setupLayerToggles() {
    const mappings = {
        'layer-drones': layers.drones,
        'layer-airports': layers.airports,
        'layer-red-zones': layers.redZones,
        'layer-yellow-zones': layers.yellowZones,
        'layer-green-zones': layers.greenZones,
        'layer-geofences': layers.geofences,
        'layer-flight-paths': layers.flightPaths
    };

    Object.keys(mappings).forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    map.addLayer(mappings[id]);
                } else {
                    map.removeLayer(mappings[id]);
                }
            });
        }
    });
}

// ============================================================
// WEBSOCKET CONNECTIONS
// ============================================================
function connectWebSockets() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;

    // 1. Live Drones
    try {
        const droneSocket = new WebSocket(`${protocol}//${host}/ws/live-drones`);
        droneSocket.onopen = () => {
            console.log("[WS] Live Drone telemetry socket connected");
            document.querySelector('.system-status-indicator').innerHTML = '<span class="status-pulse-dot"></span> RADAR STREAM ONLINE';
        };
        droneSocket.onmessage = (event) => {
            const drone = JSON.parse(event.data);
            updateDrone(drone);
        };
        droneSocket.onerror = (err) => console.warn("[WS] Drone socket error:", err);
        droneSocket.onclose = () => {
            console.warn("[WS] Drone socket closed, reconnecting in 5s…");
            setTimeout(connectWebSockets, 5000);
        };
    } catch (e) {
        console.warn("[WS] Unable to connect to drone socket", e);
    }

    // 2. Live Alerts
    try {
        const alertSocket = new WebSocket(`${protocol}//${host}/ws/alerts`);
        alertSocket.onopen = () => console.log("[WS] Airspace alert socket connected");
        alertSocket.onmessage = (event) => {
            const alert = JSON.parse(event.data);
            handleAlert(alert);
        };
        alertSocket.onerror = (err) => console.warn("[WS] Alert socket error:", err);
    } catch (e) {
        console.warn("[WS] Unable to connect to alert socket", e);
    }
}

// ============================================================
// DRONE MARKER UPDATE
// ============================================================
function updateDrone(drone) {
    const latlng = [drone.lat || drone.latitude, drone.lng || drone.longitude];
    const droneId = drone.droneId || drone.id || drone.drone_id;
    const battery = drone.batteryPercentage || drone.battery || 100;
    const speed = drone.speedKmh || drone.speed || 0;
    const altitude = drone.altitudeFt || drone.altitude || 0;
    const signal = drone.signalStrength || drone.signal || 1;
    const status = drone.status || 'NOMINAL';

    // Battery-based marker color
    let fillColor = '#4CAF50';
    if (battery < 20) fillColor = '#F44336';
    else if (battery <= 50) fillColor = '#FFC107';

    let markerClass = '';
    if (status === 'EMERGENCY') {
        fillColor = '#F44336';
        markerClass = 'marker-blink-red';
    }

    // Update or create marker
    if (droneMarkers[droneId]) {
        droneMarkers[droneId].setLatLng(latlng);
        droneMarkers[droneId].setStyle({
            fillColor: fillColor,
            color: status === 'EMERGENCY' ? '#F44336' : '#FFFFFF'
        });
        droneMarkers[droneId].getPopup().setContent(buildPopupContent({
            id: droneId, altitude, speed, battery, signal, status
        }));
    } else {
        const marker = L.circleMarker(latlng, {
            radius: 6,
            fillColor: fillColor,
            color: status === 'EMERGENCY' ? '#F44336' : '#FFFFFF',
            weight: 1.5,
            fillOpacity: 0.9,
            className: markerClass
        }).addTo(layers.drones);
        marker.bindPopup(buildPopupContent({
            id: droneId, altitude, speed, battery, signal, status
        }));
        droneMarkers[droneId] = marker;
    }

    // Store telemetry data
    activeDronesData[droneId] = {
        droneId: droneId,
        status: status,
        altitudeFt: altitude,
        speedKmh: speed,
        batteryPercentage: battery,
        signalStrength: signal,
        lat: latlng[0],
        lng: latlng[1]
    };
    renderActiveDronesTable();
    updateFleetHealth();
}

function buildPopupContent(drone) {
    return `
        <div class="gov-popup">
            <h3>TRANSPONDER: ${drone.id}</h3>
            <b>Altitude:</b> ${Math.round(drone.altitude)} ft<br>
            <b>Speed:</b> ${Math.round(drone.speed)} km/h<br>
            <b>Battery:</b> ${Math.round(drone.battery)}%<br>
            <b>Signal:</b> ${Math.round((drone.signal || 0) * 100)}%<br>
            <b>Status:</b> ${drone.status}
        </div>
    `;
}

// ============================================================
// ACTIVE DRONES TABLE
// ============================================================
function renderActiveDronesTable() {
    const tbody = document.getElementById('active-drones-tbody');
    tbody.innerHTML = '';

    const list = Object.values(activeDronesData);
    if (list.length === 0) {
        tbody.innerHTML = '<tr class="no-data-row"><td colspan="7">Awaiting telemetry streams…</td></tr>';
        return;
    }

    list.sort((a, b) => a.droneId.localeCompare(b.droneId));

    list.forEach(drone => {
        const tr = document.createElement('tr');

        if (drone.status === 'EMERGENCY') tr.className = 'row-emergency';
        else if (drone.status === 'WARNING') tr.className = 'row-warning';
        else tr.className = 'row-info';

        let batteryBadge = 'badge-green';
        if (drone.batteryPercentage < 20) batteryBadge = 'badge-red';
        else if (drone.batteryPercentage <= 50) batteryBadge = 'badge-yellow';

        let statusBadge = 'badge-green';
        if (drone.status === 'EMERGENCY') statusBadge = 'badge-red';
        else if (drone.status === 'WARNING') statusBadge = 'badge-yellow';

        // Determine current zone
        const zoneName = getZoneForPosition(drone.lat, drone.lng);

        tr.innerHTML = `
            <td><b>${drone.droneId}</b></td>
            <td><span class="badge ${statusBadge}">${drone.status}</span></td>
            <td>${Math.round(drone.altitudeFt)} ft</td>
            <td>${Math.round(drone.speedKmh)} km/h</td>
            <td><span class="badge ${batteryBadge}">${Math.round(drone.batteryPercentage)}%</span></td>
            <td>${Math.round(drone.signalStrength * 100)}%</td>
            <td><span class="zone-tag zone-${zoneName.toLowerCase()}">${zoneName}</span></td>
        `;
        tbody.appendChild(tr);
    });

    // Update KPIs
    document.getElementById('kpi-active-drones').innerText = list.length;
}

// Simple zone detection based on position (fallback client-side check)
function getZoneForPosition(lat, lng) {
    for (const feature of FALLBACK_ZONES.features) {
        const coords = feature.geometry.coordinates[0];
        if (pointInPolygon(lat, lng, coords)) {
            return feature.properties.type;
        }
    }
    return 'OPEN';
}

function pointInPolygon(lat, lng, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][1], yi = polygon[i][0];
        const xj = polygon[j][1], yj = polygon[j][0];
        const intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// ============================================================
// FLEET HEALTH UPDATE
// ============================================================
function updateFleetHealth() {
    const list = Object.values(activeDronesData);
    if (list.length === 0) return;

    const avgBattery = list.reduce((s, d) => s + d.batteryPercentage, 0) / list.length;
    const lowBattery = list.filter(d => d.batteryPercentage < 20).length;
    const emergencyCount = list.filter(d => d.status === 'EMERGENCY').length;
    const avgAlt = list.reduce((s, d) => s + d.altitudeFt, 0) / list.length;

    const batteryEl = document.getElementById('fleet-avg-battery');
    batteryEl.innerText = `${Math.round(avgBattery)}%`;
    if (avgBattery < 30) batteryEl.classList.add('fleet-stat-warn');
    else batteryEl.classList.remove('fleet-stat-warn');

    document.getElementById('fleet-low-battery').innerText = lowBattery;
    document.getElementById('fleet-emergency').innerText = emergencyCount;
    document.getElementById('fleet-avg-alt').innerText = `${Math.round(avgAlt)} ft`;
}

// ============================================================
// ALERT HANDLER
// ============================================================
function handleAlert(alert) {
    const tbody = document.getElementById('alerts-tbody');

    // Remove "No data" placeholder
    const noData = tbody.querySelector('.no-data-row');
    if (noData) tbody.removeChild(noData);

    alertCount++;
    document.getElementById('kpi-alerts').innerText = alertCount;

    const date = new Date(alert.timestamp);
    const timeStr = date.toLocaleTimeString('en-IN', { hour12: false });

    const tr = document.createElement('tr');
    if (alert.severity === 'CRITICAL') tr.className = 'row-critical';
    else if (alert.severity === 'EMERGENCY') tr.className = 'row-emergency';
    else if (alert.severity === 'WARNING') tr.className = 'row-warning';
    else tr.className = 'row-info';

    let severityBadge = 'badge-green';
    if (alert.severity === 'EMERGENCY' || alert.severity === 'CRITICAL') severityBadge = 'badge-red';
    else if (alert.severity === 'WARNING') severityBadge = 'badge-yellow';

    const details = `${(alert.type || 'UNKNOWN').replace(/_/g, ' ')} — Check Required`;

    tr.innerHTML = `
        <td><b>${timeStr}</b></td>
        <td><span class="badge ${severityBadge}">${alert.severity}</span></td>
        <td><b style="color:#0B3D91;">${alert.droneId}</b></td>
        <td>${details}</td>
    `;

    tbody.insertBefore(tr, tbody.firstChild);
    if (tbody.children.length > 20) tbody.removeChild(tbody.lastChild);
}

// ============================================================
// INIT
// ============================================================
loadGisLayers();
loadKpiData();
setupLayerToggles();
connectWebSockets();

package com.adlos.airspace.restriction;

import com.adlos.airspace.zone.ZoneService;
import com.adlos.airspace.zone.AirspaceZone;
import com.adlos.airspace.airport.AirportService;
import com.adlos.airspace.airport.Airport;
import com.adlos.airspace.geofence.GeofenceService;
import com.adlos.airspace.geofence.Geofence;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestrictionService {

    @Autowired
    private ZoneService zoneService;

    @Autowired
    private AirportService airportService;

    @Autowired
    private GeofenceService geofenceService;

    public AirspaceRule evaluateRules(Double lat, Double lng) {
        // 1. Check Airport proximity (Exclusion zone - Red)
        List<Airport> airports = airportService.getAirportsNear(lat, lng);
        if (!airports.isEmpty()) {
            Airport airport = airports.get(0);
            return new AirspaceRule("RED", 0, true, "Airport Security Zone: " + airport.getAirportName());
        }

        // 2. Check Custom Geofences
        List<Geofence> geofences = geofenceService.getGeofencesAt(lat, lng);
        if (!geofences.isEmpty()) {
            Geofence fence = geofences.get(0);
            int altLimit = "RED".equals(fence.getRestrictionLevel()) ? 0 : 200;
            return new AirspaceRule(fence.getRestrictionLevel(), altLimit, true, "Geofence: " + fence.getFenceName());
        }

        // 3. Check official airspace zones
        List<AirspaceZone> zones = zoneService.getZonesAt(lat, lng);
        if (!zones.isEmpty()) {
            AirspaceZone zone = zones.get(0);
            return new AirspaceRule(zone.getZoneType(), zone.getAltitudeLimitFt(), zone.getPermissionRequired(), "Airspace Zone: " + zone.getZoneName());
        }

        // Default: Green zone (400 ft max altitude, no special permission required)
        return new AirspaceRule("GREEN", 400, false, "Default Open Airspace");
    }
}

package com.adlos.controller;

import com.adlos.airspace.zone.AirspaceZoneRepository;
import com.adlos.airspace.airport.AirportRepository;
import com.adlos.airspace.geofence.GeofenceRepository;
import com.adlos.violation.ViolationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gis")
@CrossOrigin(origins = "*")
public class GisApiController {

    @Autowired
    private AirspaceZoneRepository zoneRepository;

    @Autowired
    private AirportRepository airportRepository;

    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private ViolationRepository violationRepository;

    @GetMapping("/zones")
    public ResponseEntity<List<Map<String, Object>>> getZones() {
        return ResponseEntity.ok(zoneRepository.findAllZonesGeoJson());
    }

    @GetMapping("/airports")
    public ResponseEntity<List<Map<String, Object>>> getAirports() {
        return ResponseEntity.ok(airportRepository.findAllAirportsGeoJson());
    }

    @GetMapping("/geofences")
    public ResponseEntity<List<Map<String, Object>>> getGeofences() {
        return ResponseEntity.ok(geofenceRepository.findAllGeofencesGeoJson());
    }

    @GetMapping("/violations")
    public ResponseEntity<List<Map<String, Object>>> getViolations() {
        return ResponseEntity.ok(violationRepository.findAllViolationsGeoJson());
    }
}

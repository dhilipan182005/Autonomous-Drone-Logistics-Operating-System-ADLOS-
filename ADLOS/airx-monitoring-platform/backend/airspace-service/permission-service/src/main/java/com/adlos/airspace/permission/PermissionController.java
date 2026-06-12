package com.adlos.airspace.permission;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "*")
public class PermissionController {

    @Autowired
    private PermissionService service;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPermissions() {
        return ResponseEntity.ok(service.getAllPermissions());
    }

    @PostMapping
    public ResponseEntity<FlightPermission> createPermission(@RequestBody Map<String, String> request) {
        String droneId = request.get("droneId");
        String operatorId = request.get("operatorId");
        String routeWkt = request.get("route"); // Expected WKT e.g. "LINESTRING(77.10 28.55, 77.12 28.56)"
        
        if (droneId == null || operatorId == null || routeWkt == null) {
            return ResponseEntity.badRequest().build();
        }
        
        FlightPermission created = service.createPermission(droneId, operatorId, routeWkt);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<FlightPermission> approvePermission(
            @PathVariable("id") String id, 
            @RequestParam(value = "officer", defaultValue = "DGCA_OFFICIAL") String officer) {
        try {
            FlightPermission approved = service.approvePermission(id, officer);
            return ResponseEntity.ok(approved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<FlightPermission> rejectPermission(
            @PathVariable("id") String id, 
            @RequestParam(value = "officer", defaultValue = "DGCA_OFFICIAL") String officer) {
        try {
            FlightPermission rejected = service.rejectPermission(id, officer);
            return ResponseEntity.ok(rejected);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

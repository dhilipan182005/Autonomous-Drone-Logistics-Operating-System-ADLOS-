package com.adlos.violation;

import com.adlos.airspace.restriction.AirspaceRule;
import com.adlos.airspace.restriction.RestrictionService;
import com.adlos.airspace.permission.PermissionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ViolationService {

    @Autowired
    private ViolationRepository repository;

    @Autowired
    private RestrictionService restrictionService;

    @Autowired
    private PermissionService permissionService;

    public List<Violation> getAllLatest() {
        return repository.findAllLatest();
    }

    public Violation checkTelemetry(String droneId, Double lat, Double lng, Double altitudeFt, Double signalStrength, String status) {
        String operatorId = repository.findOperatorIdForDrone(droneId);
        if (operatorId == null) {
            operatorId = "UNKNOWN_OPERATOR";
        }

        AirspaceRule rule = restrictionService.evaluateRules(lat, lng);
        Timestamp now = new Timestamp(System.currentTimeMillis());

        // 1. Check Emergency Landing Status
        if ("EMERGENCY".equalsIgnoreCase(status)) {
            repository.saveViolationWithLocation(droneId, operatorId, lat, lng, "EMERGENCY_LANDING", now, "EMERGENCY", "ACTIVE");
            return createViolationObject(droneId, operatorId, "EMERGENCY_LANDING", "EMERGENCY");
        }

        // 2. Check Signal Loss
        if (signalStrength != null && signalStrength <= 0.1) {
            repository.saveViolationWithLocation(droneId, operatorId, lat, lng, "SIGNAL_LOSS", now, "WARNING", "ACTIVE");
            return createViolationObject(droneId, operatorId, "SIGNAL_LOSS", "WARNING");
        }

        // 3. Check Airport Entry (highest priority spatial alert)
        if ("RED".equals(rule.getZoneType()) && rule.getRuleSource().contains("Airport")) {
            repository.saveViolationWithLocation(droneId, operatorId, lat, lng, "AIRPORT_ENTRY", now, "EMERGENCY", "ACTIVE");
            return createViolationObject(droneId, operatorId, "AIRPORT_ENTRY", "EMERGENCY");
        }

        // 4. Check Red Zone Entry
        if ("RED".equals(rule.getZoneType())) {
            repository.saveViolationWithLocation(droneId, operatorId, lat, lng, "RED_ZONE_ENTRY", now, "CRITICAL", "ACTIVE");
            return createViolationObject(droneId, operatorId, "RED_ZONE_ENTRY", "CRITICAL");
        }

        // 5. Check Restricted Zone (Yellow Zone) Entry without approved flight permission
        if (rule.getPermissionRequired() && !permissionService.hasApprovedPermission(droneId)) {
            repository.saveViolationWithLocation(droneId, operatorId, lat, lng, "RESTRICTED_ZONE_ENTRY", now, "CRITICAL", "ACTIVE");
            return createViolationObject(droneId, operatorId, "RESTRICTED_ZONE_ENTRY", "CRITICAL");
        }

        // 6. Check Altitude Violation
        if (altitudeFt != null && altitudeFt > rule.getAltitudeLimitFt()) {
            repository.saveViolationWithLocation(droneId, operatorId, lat, lng, "ALTITUDE_VIOLATION", now, "WARNING", "ACTIVE");
            return createViolationObject(droneId, operatorId, "ALTITUDE_VIOLATION", "WARNING");
        }

        return null; // No violation
    }

    private Violation createViolationObject(String droneId, String operatorId, String type, String severity) {
        Violation v = new Violation();
        v.setDroneId(droneId);
        v.setOperatorId(operatorId);
        v.setViolationType(type);
        v.setTimestamp(new Timestamp(System.currentTimeMillis()));
        v.setTriggeredSeverity(severity);
        v.setStatus("ACTIVE");
        return v;
    }
}

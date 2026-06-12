package com.adlos.airspace.permission;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PermissionService {

    @Autowired
    private FlightPermissionRepository repository;

    public List<Map<String, Object>> getAllPermissions() {
        return repository.findAllPermissionsWithRoute();
    }

    @Transactional
    public FlightPermission createPermission(String droneId, String operatorId, String routeWkt) {
        String requestId = "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        repository.savePermissionWithRoute(requestId, droneId, operatorId, routeWkt, "PENDING");
        
        FlightPermission perm = new FlightPermission();
        perm.setRequestId(requestId);
        perm.setDroneId(droneId);
        perm.setOperatorId(operatorId);
        perm.setStatus("PENDING");
        return perm;
    }

    @Transactional
    public FlightPermission approvePermission(String requestId, String officerName) {
        FlightPermission perm = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Permission request not found: " + requestId));
        perm.setStatus("APPROVED");
        perm.setApprovedBy(officerName);
        perm.setApprovedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(perm);
    }

    @Transactional
    public FlightPermission rejectPermission(String requestId, String officerName) {
        FlightPermission perm = repository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Permission request not found: " + requestId));
        perm.setStatus("REJECTED");
        perm.setApprovedBy(officerName);
        perm.setApprovedAt(new Timestamp(System.currentTimeMillis()));
        return repository.save(perm);
    }

    public boolean hasApprovedPermission(String droneId) {
        List<FlightPermission> approvedList = repository.findApprovedPermissionsForDrone(droneId);
        return !approvedList.isEmpty();
    }
}

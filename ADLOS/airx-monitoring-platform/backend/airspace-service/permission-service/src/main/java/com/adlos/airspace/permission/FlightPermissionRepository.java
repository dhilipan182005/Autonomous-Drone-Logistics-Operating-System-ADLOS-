package com.adlos.airspace.permission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Repository
public interface FlightPermissionRepository extends JpaRepository<FlightPermission, String> {

    @Query(value = "SELECT request_id as requestId, drone_id as droneId, operator_id as operatorId, ST_AsText(route) as route, status, approved_by as approvedBy, approved_at as approvedAt FROM flight_permissions", nativeQuery = true)
    List<Map<String, Object>> findAllPermissionsWithRoute();

    @Query(value = "SELECT * FROM flight_permissions WHERE drone_id = :droneId AND status = 'APPROVED'", nativeQuery = true)
    List<FlightPermission> findApprovedPermissionsForDrone(@Param("droneId") String droneId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO flight_permissions (request_id, drone_id, operator_id, route, status) VALUES (:requestId, :droneId, :operatorId, ST_GeomFromText(:routeWkt, 4326), :status)", nativeQuery = true)
    void savePermissionWithRoute(@Param("requestId") String requestId, @Param("droneId") String droneId, @Param("operatorId") String operatorId, @Param("routeWkt") String routeWkt, @Param("status") String status);
}

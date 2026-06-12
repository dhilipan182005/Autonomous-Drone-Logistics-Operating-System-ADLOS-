package com.adlos.violation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {

    @Query(value = "SELECT * FROM violations ORDER BY timestamp DESC", nativeQuery = true)
    List<Violation> findAllLatest();

    @Query(value = "SELECT operator_id FROM drone_registry WHERE drone_id = :droneId LIMIT 1", nativeQuery = true)
    String findOperatorIdForDrone(@Param("droneId") String droneId);

    @Query(value = "SELECT violation_id as id, drone_id as droneId, operator_id as operatorId, violation_type as type, timestamp, severity, status, ST_AsGeoJSON(violation_location) as location FROM violations ORDER BY timestamp DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findAllViolationsGeoJson();

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO violations (drone_id, operator_id, violation_location, violation_type, timestamp, severity, status) " +
                   "VALUES (:droneId, :operatorId, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :violationType, :timestamp, :severity, :status)", nativeQuery = true)
    void saveViolationWithLocation(
            @Param("droneId") String droneId, 
            @Param("operatorId") String operatorId, 
            @Param("lat") Double lat, 
            @Param("lng") Double lng, 
            @Param("violationType") String violationType, 
            @Param("timestamp") Timestamp timestamp, 
            @Param("severity") String severity, 
            @Param("status") String status);
}

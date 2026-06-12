package com.adlos.repository;

import com.adlos.model.DroneTelemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DroneTelemetryRepository extends JpaRepository<DroneTelemetry, Long> {
    
    @Query(value = "SELECT DISTINCT ON (drone_id) * FROM drone_telemetry ORDER BY drone_id, timestamp DESC", nativeQuery = true)
    List<DroneTelemetry> findLatestPositions();
}

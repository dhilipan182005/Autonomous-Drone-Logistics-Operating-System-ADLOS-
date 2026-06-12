package com.adlos.airspace.zone;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AirspaceZoneRepository extends JpaRepository<AirspaceZone, Long> {

    @Query(value = "SELECT * FROM airspace_zones WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))", nativeQuery = true)
    List<AirspaceZone> findZonesIntersecting(@Param("lat") Double lat, @Param("lng") Double lng);

    @Query(value = "SELECT zone_id as id, zone_name as name, zone_type as type, authority, status, altitude_limit_ft as altitudeLimit, ST_AsGeoJSON(geom) as geometry FROM airspace_zones", nativeQuery = true)
    List<java.util.Map<String, Object>> findAllZonesGeoJson();
}

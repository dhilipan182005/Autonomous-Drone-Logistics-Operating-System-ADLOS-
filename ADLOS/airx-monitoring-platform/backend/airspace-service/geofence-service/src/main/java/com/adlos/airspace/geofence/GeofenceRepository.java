package com.adlos.airspace.geofence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeofenceRepository extends JpaRepository<Geofence, Long> {

    @Query(value = "SELECT * FROM geofences WHERE ST_Contains(geometry, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))", nativeQuery = true)
    List<Geofence> findGeofencesIntersecting(@Param("lat") Double lat, @Param("lng") Double lng);

    @Query(value = "SELECT fence_id as id, fence_name as name, ST_AsGeoJSON(geometry) as geometry, restriction_level as level FROM geofences", nativeQuery = true)
    List<java.util.Map<String, Object>> findAllGeofencesGeoJson();
}

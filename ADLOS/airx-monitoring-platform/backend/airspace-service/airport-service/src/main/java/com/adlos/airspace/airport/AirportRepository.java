package com.adlos.airspace.airport;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AirportRepository extends JpaRepository<Airport, Long> {

    @Query(value = "SELECT * FROM airports WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, radius_meters)", nativeQuery = true)
    List<Airport> findAirportsIntersecting(@Param("lat") Double lat, @Param("lng") Double lng);

    @Query(value = "SELECT airport_id as id, airport_name as name, icao, iata, ST_AsGeoJSON(location) as location, radius_meters as radius FROM airports", nativeQuery = true)
    List<java.util.Map<String, Object>> findAllAirportsGeoJson();
}

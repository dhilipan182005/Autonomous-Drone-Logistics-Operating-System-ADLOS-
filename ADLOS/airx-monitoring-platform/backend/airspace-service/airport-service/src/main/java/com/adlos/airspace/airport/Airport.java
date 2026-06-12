package com.adlos.airspace.airport;

import jakarta.persistence.*;

@Entity
@Table(name = "airports")
public class Airport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long airportId;

    private String airportName;
    private String icao;
    private String iata;
    private Double radiusMeters;

    // Getters and Setters
    public Long getAirportId() { return airportId; }
    public void setAirportId(Long airportId) { this.airportId = airportId; }

    public String getAirportName() { return airportName; }
    public void setAirportName(String airportName) { this.airportName = airportName; }

    public String getIcao() { return icao; }
    public void setIcao(String icao) { this.icao = icao; }

    public String getIata() { return iata; }
    public void setIata(String iata) { this.iata = iata; }

    public Double getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(Double radiusMeters) { this.radiusMeters = radiusMeters; }
}

package com.adlos.airspace.airport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AirportService {

    @Autowired
    private AirportRepository repository;

    public List<Airport> getAirportsNear(Double lat, Double lng) {
        return repository.findAirportsIntersecting(lat, lng);
    }
}

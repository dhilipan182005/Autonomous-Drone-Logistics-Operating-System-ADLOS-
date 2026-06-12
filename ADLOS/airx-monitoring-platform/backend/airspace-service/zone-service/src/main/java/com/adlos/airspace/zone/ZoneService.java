package com.adlos.airspace.zone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ZoneService {

    @Autowired
    private AirspaceZoneRepository repository;

    public List<AirspaceZone> getZonesAt(Double lat, Double lng) {
        return repository.findZonesIntersecting(lat, lng);
    }
}

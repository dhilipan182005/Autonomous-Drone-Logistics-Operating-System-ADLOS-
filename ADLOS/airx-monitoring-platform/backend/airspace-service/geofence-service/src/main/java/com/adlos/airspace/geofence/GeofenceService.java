package com.adlos.airspace.geofence;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GeofenceService {

    @Autowired
    private GeofenceRepository repository;

    public List<Geofence> getGeofencesAt(Double lat, Double lng) {
        return repository.findGeofencesIntersecting(lat, lng);
    }
}

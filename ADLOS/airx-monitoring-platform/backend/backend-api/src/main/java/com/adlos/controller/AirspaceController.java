package com.adlos.controller;

import com.adlos.model.DroneTelemetry;
import com.adlos.repository.DroneTelemetryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AirspaceController {

    @Autowired
    private DroneTelemetryRepository repository;

    @GetMapping("/drone_positions")
    public ResponseEntity<List<Map<String, Object>>> getDronePositions() {
        List<DroneTelemetry> latest = repository.findLatestPositions();
        
        if (latest.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (DroneTelemetry t : latest) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", t.getDroneId());
            dto.put("lat", t.getLatitude());
            dto.put("lng", t.getLongitude());
            dto.put("status", t.getStatus());
            response.add(dto);
        }
        return ResponseEntity.ok(response);
    }
}

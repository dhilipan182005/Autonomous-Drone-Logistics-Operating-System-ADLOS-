package com.adlos.kafka;

import com.adlos.model.DroneTelemetry;
import com.adlos.repository.DroneTelemetryRepository;
import com.adlos.violation.Violation;
import com.adlos.violation.ViolationService;
import com.adlos.websocket.DronePositionWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@Service
public class TelemetryConsumerService {

    @Autowired
    private DroneTelemetryRepository telemetryRepository;

    @Autowired
    private ViolationService violationService;

    @Autowired
    private DronePositionWebSocketHandler dronePositionWebSocketHandler;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "airx_telemetry", groupId = "airx-telemetry-group")
    public void consume(String message) {
        try {
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            
            String droneId = (String) data.get("droneId");
            Double latitude = data.get("latitude") != null ? ((Number) data.get("latitude")).doubleValue() : null;
            Double longitude = data.get("longitude") != null ? ((Number) data.get("longitude")).doubleValue() : null;
            Double altitude = data.get("altitudeFt") != null ? ((Number) data.get("altitudeFt")).doubleValue() : 0.0;
            Double speed = data.get("speedKmh") != null ? ((Number) data.get("speedKmh")).doubleValue() : 0.0;
            Double heading = data.get("heading") != null ? ((Number) data.get("heading")).doubleValue() : 0.0;
            Double battery = data.get("batteryPercentage") != null ? ((Number) data.get("batteryPercentage")).doubleValue() : 100.0;
            Double signal = data.get("signalStrength") != null ? ((Number) data.get("signalStrength")).doubleValue() : 1.0;
            String status = (String) data.get("status");

            if (droneId == null || latitude == null || longitude == null) {
                return;
            }

            // Save Telemetry Entity
            DroneTelemetry telemetry = new DroneTelemetry();
            telemetry.setDroneId(droneId);
            telemetry.setLatitude(latitude);
            telemetry.setLongitude(longitude);
            telemetry.setAltitudeFt(altitude);
            telemetry.setSpeedKmh(speed);
            telemetry.setHeading(heading);
            telemetry.setBatteryPercentage(battery);
            telemetry.setSignalStrength(signal);
            telemetry.setStatus(status);
            telemetry.setTimestamp(new Timestamp(System.currentTimeMillis()));
            telemetryRepository.save(telemetry);

            // Broadcast live coordinates to WebSocket clients
            Map<String, Object> wsMsg = new HashMap<>();
            wsMsg.put("id", droneId);
            wsMsg.put("lat", latitude);
            wsMsg.put("lng", longitude);
            wsMsg.put("altitude", altitude);
            wsMsg.put("speed", speed);
            wsMsg.put("heading", heading);
            wsMsg.put("battery", battery);
            wsMsg.put("signal", signal);
            wsMsg.put("status", status);
            String wsJson = objectMapper.writeValueAsString(wsMsg);
            dronePositionWebSocketHandler.broadcastPosition(wsJson);

            // Run Violation Checks
            Violation violation = violationService.checkTelemetry(droneId, latitude, longitude, altitude, signal, status);
            if (violation != null) {
                // Publish alert to Kafka 'airx_alerts' topic
                Map<String, Object> alert = new HashMap<>();
                alert.put("droneId", droneId);
                alert.put("operatorId", violation.getOperatorId());
                alert.put("type", violation.getViolationType());
                alert.put("severity", violation.getSeverity());
                alert.put("lat", latitude);
                alert.put("lng", longitude);
                alert.put("timestamp", System.currentTimeMillis());
                
                String alertJson = objectMapper.writeValueAsString(alert);
                kafkaTemplate.send("airx_alerts", alertJson);
                System.out.println("Published violation alert to airx_alerts: " + alertJson);
            }

        } catch (Exception e) {
            System.err.println("Error processing Kafka telemetry: " + e.getMessage());
        }
    }
}

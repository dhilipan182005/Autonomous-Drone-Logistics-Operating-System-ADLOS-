package com.adlos.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "drone_telemetry")
public class DroneTelemetry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recordId;
    
    private String droneId;
    private Timestamp timestamp;
    private Double altitudeFt;
    private Double speedKmh;
    private Double heading;
    private Double batteryPercentage;
    private Double signalStrength;
    private String missionId;
    private String status;

    private Double latitude;
    private Double longitude;

    // Getters and Setters
    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public String getDroneId() { return droneId; }
    public void setDroneId(String droneId) { this.droneId = droneId; }

    public Timestamp getTimestamp() { return timestamp; }
    public void setTimestamp(Timestamp timestamp) { this.timestamp = timestamp; }

    public Double getAltitudeFt() { return altitudeFt; }
    public void setAltitudeFt(Double altitudeFt) { this.altitudeFt = altitudeFt; }

    public Double getSpeedKmh() { return speedKmh; }
    public void setSpeedKmh(Double speedKmh) { this.speedKmh = speedKmh; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public Double getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(Double batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public Double getSignalStrength() { return signalStrength; }
    public void setSignalStrength(Double signalStrength) { this.signalStrength = signalStrength; }

    public String getMissionId() { return missionId; }
    public void setMissionId(String missionId) { this.missionId = missionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}

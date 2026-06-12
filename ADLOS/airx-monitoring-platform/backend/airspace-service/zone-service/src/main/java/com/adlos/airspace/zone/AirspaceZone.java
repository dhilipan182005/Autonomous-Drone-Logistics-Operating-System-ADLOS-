package com.adlos.airspace.zone;

import jakarta.persistence.*;

@Entity
@Table(name = "airspace_zones")
public class AirspaceZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long zoneId;

    private String zoneName;
    private String zoneType; // RED, YELLOW, GREEN
    private String authority;
    private String status;
    private Integer altitudeLimitFt;
    private Boolean permissionRequired;

    // Getters and Setters
    public Long getZoneId() { return zoneId; }
    public void setZoneId(Long zoneId) { this.zoneId = zoneId; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public String getZoneType() { return zoneType; }
    public void setZoneType(String zoneType) { this.zoneType = zoneType; }

    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAltitudeLimitFt() { return altitudeLimitFt; }
    public void setAltitudeLimitFt(Integer altitudeLimitFt) { this.altitudeLimitFt = altitudeLimitFt; }

    public Boolean getPermissionRequired() { return permissionRequired; }
    public void setPermissionRequired(Boolean permissionRequired) { this.permissionRequired = permissionRequired; }
}

package com.adlos.airspace.geofence;

import jakarta.persistence.*;

@Entity
@Table(name = "geofences")
public class Geofence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fenceId;

    private String fenceName;
    private String restrictionLevel; // RED, YELLOW, GREEN

    // Getters and Setters
    public Long getFenceId() { return fenceId; }
    public void setFenceId(Long fenceId) { this.fenceId = fenceId; }

    public String getFenceName() { return fenceName; }
    public void setFenceName(String fenceName) { this.fenceName = fenceName; }

    public String getRestrictionLevel() { return restrictionLevel; }
    public void setRestrictionLevel(String restrictionLevel) { this.restrictionLevel = restrictionLevel; }
}

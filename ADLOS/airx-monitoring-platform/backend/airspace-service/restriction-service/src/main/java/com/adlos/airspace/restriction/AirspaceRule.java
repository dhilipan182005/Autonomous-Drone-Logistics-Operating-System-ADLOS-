package com.adlos.airspace.restriction;

public class AirspaceRule {
    private String zoneType; // RED, YELLOW, GREEN
    private Integer altitudeLimitFt;
    private Boolean permissionRequired;
    private String ruleSource;

    public AirspaceRule(String zoneType, Integer altitudeLimitFt, Boolean permissionRequired, String ruleSource) {
        this.zoneType = zoneType;
        this.altitudeLimitFt = altitudeLimitFt;
        this.permissionRequired = permissionRequired;
        this.ruleSource = ruleSource;
    }

    public String getZoneType() { return zoneType; }
    public Integer getAltitudeLimitFt() { return altitudeLimitFt; }
    public Boolean getPermissionRequired() { return permissionRequired; }
    public String getRuleSource() { return ruleSource; }
}

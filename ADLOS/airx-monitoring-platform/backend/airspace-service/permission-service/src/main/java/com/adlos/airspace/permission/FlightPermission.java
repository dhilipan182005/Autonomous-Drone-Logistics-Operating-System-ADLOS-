package com.adlos.airspace.permission;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "flight_permissions")
public class FlightPermission {

    @Id
    private String requestId;

    private String droneId;
    private String operatorId;
    private String status; // PENDING, APPROVED, REJECTED, EXPIRED
    private String approvedBy;
    private Timestamp approvedAt;

    // Getters and Setters
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getDroneId() { return droneId; }
    public void setDroneId(String droneId) { this.droneId = droneId; }

    public String getOperatorId() { return operatorId; }
    public void setOperatorId(String operatorId) { this.operatorId = operatorId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public Timestamp getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Timestamp approvedAt) { this.approvedAt = approvedAt; }
}

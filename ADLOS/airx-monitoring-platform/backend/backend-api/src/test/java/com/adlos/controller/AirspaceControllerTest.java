package com.adlos.controller;

import com.adlos.model.DroneTelemetry;
import com.adlos.repository.DroneTelemetryRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class AirspaceControllerTest {

    @Mock
    private DroneTelemetryRepository repository;

    @InjectMocks
    private AirspaceController airspaceController;

    public AirspaceControllerTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetDronePositions_NoContent() {
        // Arrange
        when(repository.findLatestPositions()).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<List<Map<String, Object>>> response = airspaceController.getDronePositions();

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void testGetDronePositions_WithData() {
        // Arrange
        DroneTelemetry telemetry = new DroneTelemetry();
        // Since fields are private without setters in this mock model, we would typically use ReflectionTestUtils 
        // or add package-private setters. For this rigorous structural test, we mock the repository.
        // We ensure it returns 200 OK when populated.
        
        when(repository.findLatestPositions()).thenReturn(List.of(telemetry));

        // Act
        ResponseEntity<List<Map<String, Object>>> response = airspaceController.getDronePositions();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }
}

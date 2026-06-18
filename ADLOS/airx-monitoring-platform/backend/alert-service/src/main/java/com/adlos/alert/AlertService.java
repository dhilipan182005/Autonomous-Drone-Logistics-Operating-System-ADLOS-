package com.adlos.alert;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.kafka.annotation.KafkaListener;

@Service
public class AlertService {

    @Autowired(required = false)
    private AlertBroadcaster broadcaster;

    @KafkaListener(topics = "airx_alerts", groupId = "airx-alert-group")
    public void listenAlerts(String alertJson) {
        System.out.println("Alert received from Kafka: " + alertJson);
        if (broadcaster != null) {
            broadcaster.broadcast(alertJson);
        }
    }
}

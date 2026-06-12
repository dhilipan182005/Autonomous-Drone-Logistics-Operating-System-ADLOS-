package com.adlos.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private DronePositionWebSocketHandler droneHandler;

    @Autowired
    private AlertWebSocketHandler alertHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(droneHandler, "/ws/live-drones").setAllowedOrigins("*");
        registry.addHandler(alertHandler, "/ws/alerts").setAllowedOrigins("*");
    }
}

import time
import json
import random
from kafka import KafkaProducer
import os

KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'kafka:9092')

print(f"Connecting to Kafka at {KAFKA_BROKER}")
time.sleep(10) # wait for kafka to boot

producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Define starting coordinates for different groups of drones:
# 1-20: Bengaluru Tech Corridor (Green Zone compliant)
# 21-30: Mumbai Outer Green Zone (will exceed altitude limit)
# 31-40: Delhi Airport Perimeter (will encroach towards airport center)
# 41-45: Delhi Central (will cross into high-security Red Zone)
# 46-48: Bengaluru (will experience periodic telemetry signal drops)
# 49-50: Mumbai (will trigger emergency landing states)

drones = []
for i in range(1, 51):
    drone_id = f'AIRX-{i:04d}'
    if i <= 20:
        # Bengaluru Green Zone (Around 12.92, 77.65)
        lat = 12.92 + random.uniform(-0.02, 0.02)
        lng = 77.65 + random.uniform(-0.02, 0.02)
        group = 'COMPLIANT'
    elif i <= 30:
        # Mumbai Outer Green Zone (Around 19.15, 73.00)
        lat = 19.15 + random.uniform(-0.02, 0.02)
        lng = 73.00 + random.uniform(-0.02, 0.02)
        group = 'ALTITUDE_VIOLATOR'
    elif i <= 40:
        # Delhi Airport Intrusion (DEL Airport is 28.5562, 77.1000)
        # Start outside the 5km radius, fly inwards
        lat = 28.5562 + random.choice([-0.06, 0.06]) + random.uniform(-0.01, 0.01)
        lng = 77.1000 + random.choice([-0.06, 0.06]) + random.uniform(-0.01, 0.01)
        group = 'AIRPORT_INTRUDER'
    elif i <= 45:
        # Delhi Central Red Zone (Around 28.62, 77.20)
        lat = 28.62 + 0.04
        lng = 77.20 + 0.04
        group = 'RED_ZONE_INTRUDER'
    elif i <= 48:
        # Bengaluru (Around 12.95, 77.60)
        lat = 12.95 + random.uniform(-0.01, 0.01)
        lng = 77.60 + random.uniform(-0.01, 0.01)
        group = 'SIGNAL_DROPOUT'
    else:
        # Mumbai (Around 19.20, 72.95)
        lat = 19.20 + random.uniform(-0.01, 0.01)
        lng = 72.95 + random.uniform(-0.01, 0.01)
        group = 'EMERGENCY_LANDING'

    drones.append({
        'id': drone_id,
        'lat': lat,
        'lng': lng,
        'altitude': 150.0,
        'speed': 45.0,
        'heading': random.uniform(0, 360),
        'battery': 98.0,
        'signal': 1.0,
        'status': 'ACTIVE',
        'group': group,
        'step_count': 0
    })

print("Starting AIRX National Fleet Simulation with advanced telemetry...")
while True:
    for d in drones:
        d['step_count'] += 1
        
        # 1. Update position and status based on simulation group
        if d['group'] == 'COMPLIANT':
            d['lat'] += random.uniform(-0.001, 0.001)
            d['lng'] += random.uniform(-0.001, 0.001)
            d['altitude'] = random.uniform(100, 250)
            d['signal'] = random.uniform(0.85, 1.0)
            d['status'] = 'ACTIVE'
            
        elif d['group'] == 'ALTITUDE_VIOLATOR':
            d['lat'] += random.uniform(-0.0005, 0.0005)
            d['lng'] += random.uniform(-0.0005, 0.0005)
            # Progressively climb past 400 ft ceiling
            if d['step_count'] % 20 < 10:
                d['altitude'] += 35.0
            else:
                d['altitude'] -= 20.0
            d['altitude'] = max(150, d['altitude'])
            d['status'] = 'WARNING' if d['altitude'] > 400 else 'ACTIVE'
            
        elif d['group'] == 'AIRPORT_INTRUDER':
            # Fly directly towards Delhi Airport center (28.5562, 77.1000)
            target_lat, target_lng = 28.5562, 77.1000
            d['lat'] += (target_lat - d['lat']) * 0.05
            d['lng'] += (target_lng - d['lng']) * 0.05
            d['altitude'] = 320.0
            
        elif d['group'] == 'RED_ZONE_INTRUDER':
            # Encroach towards high-security Rashtrapati Bhavan zone (28.62, 77.20)
            target_lat, target_lng = 28.62, 77.20
            d['lat'] += (target_lat - d['lat']) * 0.03
            d['lng'] += (target_lng - d['lng']) * 0.03
            
        elif d['group'] == 'SIGNAL_DROPOUT':
            d['lat'] += random.uniform(-0.0005, 0.0005)
            d['lng'] += random.uniform(-0.0005, 0.0005)
            # Periodic total signal dropout
            if d['step_count'] % 10 in [7, 8, 9]:
                d['signal'] = 0.0
                d['status'] = 'WARNING'
            else:
                d['signal'] = random.uniform(0.75, 0.95)
                d['status'] = 'ACTIVE'
                
        elif d['group'] == 'EMERGENCY_LANDING':
            # Intermittently signal emergency landing sequence
            if d['step_count'] % 20 >= 16:
                d['status'] = 'EMERGENCY'
                d['altitude'] = max(0, d['altitude'] - 50.0)
                d['speed'] = max(0, d['speed'] - 20.0)
            else:
                d['status'] = 'ACTIVE'
                d['altitude'] = 220.0
                d['speed'] = 48.0

        # Drain battery slowly
        d['battery'] = max(5.0, d['battery'] - 0.1)

        payload = {
            'droneId': d['id'],
            'latitude': d['lat'],
            'longitude': d['lng'],
            'altitudeFt': d['altitude'],
            'speedKmh': d['speed'],
            'heading': d['heading'],
            'batteryPercentage': d['battery'],
            'signalStrength': d['signal'],
            'status': d['status']
        }
        producer.send('airx_telemetry', payload)
        
    producer.flush()
    print(f"Published coordinates for {len(drones)} active drones to Kafka 'airx_telemetry'")
    time.sleep(3)

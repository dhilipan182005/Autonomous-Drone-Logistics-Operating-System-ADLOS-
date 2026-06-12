import json
import time
import os
import psycopg2
from kafka import KafkaConsumer

KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'kafka:9092')
DB_HOST = os.getenv('DB_HOST', 'postgis')
DB_USER = os.getenv('DB_USER', 'airx')
DB_PASS = os.getenv('DB_PASS', 'airx')
DB_NAME = os.getenv('DB_NAME', 'airx_spatial')

print("Waiting for PostGIS and Kafka to be ready...")
time.sleep(15)

# Connect to DB
conn = psycopg2.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
conn.autocommit = True
cursor = conn.cursor()

# Ensure table exists (in case Java JPA hasn't created it yet)
cursor.execute("""
CREATE TABLE IF NOT EXISTS drone_telemetry (
    record_id SERIAL PRIMARY KEY,
    drone_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20)
)
""")

print("Connected to PostGIS successfully.")

consumer = KafkaConsumer(
    'airx_telemetry',
    bootstrap_servers=[KAFKA_BROKER],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

print("Listening for Kafka telemetry...")

for message in consumer:
    data = message.value
    # Insert into PostGIS
    cursor.execute(
        "INSERT INTO drone_telemetry (drone_id, latitude, longitude, status) VALUES (%s, %s, %s, %s)",
        (data['droneId'], data['latitude'], data['longitude'], data['status'])
    )

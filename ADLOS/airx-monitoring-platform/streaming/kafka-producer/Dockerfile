FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY simulate_fleet.py .
CMD ["python", "simulate_fleet.py"]

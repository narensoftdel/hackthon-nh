# Emergency Evacuation System Backend

This backend simulates an emergency evacuation system with dummy sensor data and API endpoints.

## Features
- Simulates TVOC, Fire Alarm, CO2, Temperature, and Smoke Detected values
- Provides `/api/sensors` endpoint for dashboard polling
- Health check at `/api/health`

## Usage
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Poll `/api/sensors` for live dummy data

## Endpoints
- `GET /api/sensors` — Get current sensor data
- `GET /api/health` — Health check

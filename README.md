# Evacuation System Monorepo

This repository contains:
- `frontend/`: Angular app (NgModules, standalone=false) with a dashboard UI that fetches and displays sensor data from the backend.
- `backend/`: Node.js/Express API that generates and serves dummy sensor data.

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `node index.js`

### Frontend
1. `cd frontend`
2. `npm install`
3. `ng serve`

The Angular app will fetch sensor data from `http://localhost:3000/api/sensors`.

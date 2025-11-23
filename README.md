# Smart Agriculture Dashboard (frontend)

This is a lightweight React frontend that displays live sensor data from your backend and shows a 10-day evapotranspiration forecast.

Features
- Polls `GET /api/sensors/current` every 2 seconds and updates UI
- Shows live cards (temperature, soil moisture, node id)
- Trains a simple Random-Forest-like ensemble in the browser from historical daily aggregates and shows a 10-day ET forecast using Chart.js

Quick start
1. From the `frontend/` folder install deps:

```powershell
cd c:\Users\saihe\Desktop\ne\frontend
npm install
npm run dev
```

2. Open the printed Vite URL (http://localhost:5173 by default) in a browser and set Backend URL to your backend (`http://<WINDOWS_PC_IP>:3001`).

Notes
- This frontend uses a tiny RandomForest-like regressor implemented in JS as a demonstration. Replace with a server-side trained model for production.
- The app attempts to login using `saihemanth2112@gmail.com` / `hemanth` to obtain a JWT automatically. If you prefer, sign in via the backend and paste the token into the code.

Security
- This is a demo; do not ship your JWT secrets in production or use default credentials.


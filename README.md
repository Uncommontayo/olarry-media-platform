# O'larry

This repository now keeps the React + Vite frontend inside the `frontend/` directory.

## Quick start
1. cd frontend
2. npm install
3. npm run dev (opens at http://localhost:5174 by default)

## Structure
- frontend/ — React app, Vite config, screenshots, Playwright E2E stub

The backend API is hosted separately; update `API_PROXY_TARGET` in `frontend/vite.config.js` if you point to a different backend.

## Deploying to Azure Static Web Apps
1. In the Azure Portal, open your Static Web App → Settings → Deployment token; copy the token.
2. In GitHub: repo Settings → Secrets and variables → Actions → New repository secret.
	- Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
	- Value: paste the token
3. Push to `main` (or re-run the "Deploy Azure Static Web Apps" workflow) to deploy.
4. The workflow builds from `frontend/` and uses `VITE_API_BASE` pointing to the Azure Functions API.

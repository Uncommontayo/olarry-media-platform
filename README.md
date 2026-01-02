# O'larry media platform

Full-stack workspace with a Vite + React frontend in `frontend/` and an Azure Functions backend in `backend/` for media upload, listing, likes, deletes, and lightweight AI captions against Azure Blob Storage.

## Structure
- [backend/](backend/function_app.py) — Azure Functions HTTP APIs (`upload_media`, `list_media`, `like_media`, `delete_media`, `ai_caption`).
- [frontend/](frontend/README.md) — React app with proxy for `/api` calls, screenshots, and a Playwright E2E stub.

## Backend quick start
1. From repo root: `python -m venv .venv` and activate it.
2. Install deps: `cd backend && python -m pip install -r requirements.txt` (or VS Code task `pip install (functions)`).
3. Configure secrets in `backend/local.settings.json` (or env vars). Minimal example:

   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "python",
       "STORAGE_CONNECTION_STRING": "<your-connection-string>"
     }
   }
   ```

4. Start locally: from repo root run `func host start` (or task `func: host start`).
   - Local base URL: `http://localhost:7071/api/<route>`.

## Backend API
- `POST /api/upload_media` — binary body; query params `caption`, `username`; returns `{ name }`.
- `GET /api/list_media` — lists posts with SAS-backed `url`, caption, username, likes, uploaded_at.
- `POST /api/like_media?name=<blob>` — increments likes; returns `{ likes }`.
- `DELETE /api/delete_media?name=<blob>` — deletes a blob; returns `{ deleted }`.
- `GET /api/ai_caption?name=<blob>` — returns `{ caption }`.

## Frontend quick start
1. `cd frontend && npm install`.
2. Update `API_PROXY_TARGET` in [frontend/vite.config.js](frontend/vite.config.js) if your backend URL differs (defaults to the deployed Azure Functions host). Dev server proxies `/api` to that target.
3. `npm run dev` (opens at http://localhost:5174 by default).

## Notes
- CORS is permissive in the backend for development; lock down allowed origins for production.
- SAS tokens issued by `list_media` expire after 2 hours.
- Keep `STORAGE_CONNECTION_STRING` and any production secrets out of source control.

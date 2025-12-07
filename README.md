# Task Manager (MERN)

A full-stack Task Manager that supports CRUD operations with status filtering, counts, and delete confirmation.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (Vite), Material UI, Axios

## Setup
1. Clone the repo and install dependencies.

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Configure environment variables.

- Copy `backend/.env.example` to `backend/.env` and adjust `MONGODB_URI`/`PORT` as needed.

3. Run the development servers (in two terminals).

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

- Frontend runs on `http://localhost:3000` (via Vite).
- Backend defaults to `http://localhost:5000`.

### Optional: Configure API URL for the frontend
Set `VITE_API_URL` in `frontend/.env` if your backend is not on `http://localhost:5000`.

```
VITE_API_URL=http://localhost:5000
```

## API Routes
- `POST /api/tasks` — create a task
- `GET /api/tasks` — list tasks (supports `?status=Pending|Completed`)
- `PUT /api/tasks/:id` — update task fields or status
- `DELETE /api/tasks/:id` — delete a task
- `GET /health` — health check

## Features
- Add, edit, delete tasks with validation
- Mark tasks completed or pending
- Filter by status and view counts (total/pending/completed)
- Inline confirmation before delete
- Snackbar feedback for CRUD actions

## Screenshot
Add a screenshot of the running app here (e.g., place an image in `docs/screenshot.png` and link it).

## Notes
- Default MongoDB name: `task-manager` (overridable via `MONGODB_URI`).
- Requires Node.js 18+.

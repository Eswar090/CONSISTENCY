# CONSISTENCY API Documentation

All protected endpoints require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <your_token>`

## Authentication

### `POST /api/auth/register`
Registers a new user.
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Response:** JWT Token.

### `POST /api/auth/login`
Authenticates a user.
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** JWT Token.

## Tasks (Daily Planner)

### `GET /api/tasks?date=YYYY-MM-DD`
Fetches tasks for a specific date.

### `POST /api/tasks`
Creates a new task.
- **Body:** `{ "title": "...", "plannedDate": "YYYY-MM-DD", "description": "...", "priority": "..." }`

### `PUT /api/tasks/{id}`
Updates an entire task (including status).

### `DELETE /api/tasks/{id}`
Deletes a task.

## Habits

### `GET /api/habits`
Fetches all active habits for the user.

### `POST /api/habits`
Creates a new habit.
- **Body:** `{ "name": "...", "frequencyType": "DAILY|SELECTED_DAYS", "selectedDays": ["MONDAY", ...] }`

### `POST /api/habits/{id}/log`
Logs a habit completion for a specific date.
- **Body:** `{ "date": "YYYY-MM-DD", "completed": true }`

## Focus Mode

### `GET /api/focus/settings`
Fetches user's pomodoro settings.

### `POST /api/focus/sessions`
Logs a completed focus session.
- **Body:** `{ "durationMinutes": 25, "sessionType": "FOCUS|BREAK", "taskId": 123 (optional) }`

## Goals & Smart Plan

### `GET /api/goals`
Fetches all goals and dynamically calculates their progress.

### `POST /api/goals`
Creates a goal with automatic pace tracking.

### `GET /api/smart-plan?date=YYYY-MM-DD`
Calculates workload and capacity recommendations based on recent productivity.

## AI Productivity Assistant

### `POST /api/ai/chat`
Sends a message to the AI Assistant. The backend automatically injects the user's secure productivity context (Tasks, Habits, Consistency, Smart Plan) into the prompt.
- **Body:** `{ "message": "How am I doing this week?" }`

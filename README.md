# Office Task Manager

Clean, minimal SaaS application for managing office tasks with role-based access.

## Features
- **Auth**: JWT in **HttpOnly cookie**, bcrypt password hashing
- **Roles**: `admin` and `user`
- **Tasks**: admins create/assign/update/delete; users view assigned tasks and mark complete
- **Docs**: Swagger UI at `/api/v1/docs`

## API (v1)
- **Auth**: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`
- **Tasks**: `/api/v1/tasks/*`
- **Users** (admin): `/api/v1/users` (for task assignment)

## Running locally

### Backend
Create `.env` in `server/`:

```bash
PORT=8080
MYSQLHOST=...
MYSQLPORT=3306
MYSQLUSER=...
MYSQLPASSWORD=...
MYSQLDATABASE=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
EDGE_SECRET=... # production only

# Seed initial admin (optional)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me
```

Run:

```bash
cd server
npm install
npm run dev
```

### Frontend
Run:

```bash
cd client
npm install
npm run dev
```

# 🏋️ FitAI - Smart AI Fitness Coach

Your AI-powered fitness companion for planning workouts, tracking progress, and building better habits.

## ✨ What This Project Includes

- 🧠 AI chat flow for fitness support
- 📅 Daily and weekly planning
- 📈 Progress tracking and streaks
- 🥗 Nutrition logging
- 🔐 Authentication and profile management
- 📊 Dashboard visualizations (Recharts)

## 🧱 Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT + bcryptjs
- Testing: Jest + Supertest + mongodb-memory-server

## 📁 Project Structure

```text
FitAI - Smart AI Fitness Coach/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── utils/
└── frontend/
    ├── src/
    └── index.html
```

## ✅ Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string (Atlas or local)

## ⚙️ Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

Optional frontend env (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If `VITE_API_BASE_URL` is not set, the frontend already falls back to `http://localhost:5000/api`.

## 🚀 Setup and Run Commands

Run these commands manually from the project root.

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3) Run backend (development)

```bash
cd ../backend
npm run dev
```

### 4) Run frontend (development)

Open another terminal:

```bash
cd frontend
npm run dev
```

### 5) Open app

- Frontend: `http://localhost:5173`
- Backend Health: `http://localhost:5000/api/health`

## 🧪 Test Commands

Backend tests:

```bash
cd backend
npm test
```

## 🔌 API Endpoint Table (All Routes)

Base URL: `http://localhost:5000/api`

Auth header for protected routes:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Auth | Description | Request Notes |
| --- | --- | --- | --- | --- |
| GET | `/api` | No | API root check | Returns starter message |
| GET | `/api/health` | No | Health check | Returns `{ status: "ok" }` |
| POST | `/api/auth/register` | No | Register a new user | Body: `name`, `email`, `password` |
| POST | `/api/auth/login` | No | Login user | Body: `email`, `password` |
| GET | `/api/auth/me` | Yes | Get current user | Token required |
| GET | `/api/profile` | Yes | Get profile | Token required |
| PUT | `/api/profile` | Yes | Update profile | Body (optional fields): `age`, `weight`, `height`, `goals`, `mode` |
| POST | `/api/progress` | Yes | Create/update today's progress | Body supports: `workoutDone`, `workoutType`, `burnedCalories`, `sleepHours`, `waterLiters`, `mood`, `notes` |
| GET | `/api/progress` | Yes | Get recent progress logs | Query: `limit` (1-60, default 14) |
| GET | `/api/progress/streak` | Yes | Get workout and habit streak stats | No body |
| DELETE | `/api/progress/:id` | Yes | Delete one progress log | Param: MongoDB ObjectId |
| POST | `/api/planner/generate-weekly` | Yes | Generate current week plan | Uses user mode/goals |
| GET | `/api/planner/today` | Yes | Get today's workout from weekly plan | Requires existing weekly plan |
| POST | `/api/chat/send` | Yes | Send a message and get coach reply | Body: `message` (max 1000 chars) |
| GET | `/api/chat/history` | Yes | Get chat history | Query: `limit` (1-200, default 50) |
| DELETE | `/api/chat/clear` | Yes | Clear all chat history | No body |
| POST | `/api/nutrition` | Yes | Create/update today's nutrition totals | Body supports: `mealType`, `calories`, `protein`, `carbs`, `fats`, `notes` |
| GET | `/api/nutrition` | Yes | Get recent nutrition logs | Query: `limit` (1-90, default 30) |

<!-- ## 🖼️ Screenshots and GIFs (Major Pages)

Replace the placeholder URLs below with your real screenshots/GIFs.

### 📊 Dashboard Page

![Dashboard Screenshot](https://placehold.co/1200x700?text=Dashboard+Screenshot)


### 📅 Today Page

![Today Screenshot](https://placehold.co/1200x700?text=Today+Screenshot)


### 📈 Progress Page

![Progress Screenshot](https://placehold.co/1200x700?text=Progress+Screenshot)


### 🧠 Chat Page

![Chat Screenshot](https://placehold.co/1200x700?text=Chat+Screenshot)


### 👤 Profile Page

![Profile Screenshot](https://placehold.co/1200x700?text=Profile+Screenshot)


### 🔐 Login Page

![Login Screenshot](https://placehold.co/1200x700?text=Login+Screenshot)


### 📝 Register Page

![Register Screenshot](https://placehold.co/1200x700?text=Register+Screenshot) -->


## 📦 package.json (Backend)

```json
{
  "name": "fitai-backend",
  "version": "1.0.0",
  "description": "Backend API for FitAI - Smart AI Fitness Coach",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.5.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.4"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "mongodb-memory-server": "^10.1.4",
    "supertest": "^7.1.1",
    "nodemon": "^3.1.0"
  }
}
```

## 📦 package.json (Frontend)

```json
{
  "name": "fitai-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.2",
    "recharts": "^3.8.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}
```

## 🛠️ Additional Useful Commands

Backend production run:

```bash
cd backend
npm start
```

Frontend production build:

```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Open a pull request

## 📄 License

Add your preferred license (MIT recommended) in a `LICENSE` file.

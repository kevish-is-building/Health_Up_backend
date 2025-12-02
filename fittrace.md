# FitTrace — Personal Health & Activity Tracker

## 1. Project Title
FitTrace — Personal Health & Activity Tracker

## 2. Problem Statement
People trying to stay fit often juggle multiple tracking tools (workouts in one place, meals in another, reminders somewhere else). There’s a need for a single web app that lets users create/manage workouts, log nutrition, get a daily random exercise to maintain streaks, track water intake, and view personal progress and leaderboards — all tied together with calendar scheduling and easy quick-add options.

## 3. System Architecture
**High-level flow:**  
Frontend (React.js) → Backend API (Node.js + Express) → ORM (Prisma) → Relational DB (PostgreSQL)

Optional AI microservice (OpenAI) for tutorial generation/summaries.

### Frontend (React.js)
Pages for auth, dashboard, workouts, nutrition, daily-random, leaderboard, profile, calendar.

### Backend (Node.js + Express)
REST API endpoints, authentication (JWT + refresh tokens), and business logic for all features.

### Database
PostgreSQL via Prisma ORM.

### Hosting
Vercel (frontend), Render (backend), NeonDb (database).

## 5. Key Features

### Authentication & Authorization
- Sign up, login, logout
- Email verification
- JWT access + refresh tokens
- OAuth (Google)
- Role-based access (user/admin)

### Workout Management (CRUD)
- Create, read, update, delete workouts
- Difficulty, equipment, instructions, optional tutorial

### Workout Scheduling & Calendar
- Add workouts to calendar
- Recurring schedules
- Reminders

### Nutrition Tracker
- Log meals with food item, meal type, serving size, calories, macros, date/time

### Quick Add Meals
- Predefined one-click items (coffee, milk, rice, banana, etc.)

### Daily Random Exercise (Streak System)
- Random daily exercise with points & difficulty
- Completing maintains streak

### Leaderboards
- Weekly and monthly rankings based on streaks, workouts, nutrition

### User Profile & Analytics
- Progress tracking, workouts, meals, streaks, upcoming events

### Water Drinking Reminder
- Push/email reminders
- Track daily intake

## 6. Tech Stack

### Frontend
- Next.js, React Query/SWR, TailwindCSS, TypeScript

### Backend
- Node.js, Express.js, TypeScript

### ORM
- Prisma

### Database
- PostgreSQL, Redis (cache + job queue)

### Auth
- JWT, OAuth 2.0 (Google), bcrypt

### Media
- AWS S3 / DigitalOcean Spaces

### Background Jobs
- BullMQ / Bee-Queue + Redis

### Notifications
- Web Push, FCM, SendGrid/Mailgun

### AI Enhancements
- Optional OpenAI for descriptions and summaries

### Testing & CI
- Jest, Playwright, GitHub Actions

### Hosting
- Vercel (frontend), Render/Railway (backend), Aiven/AWS RDS (database)

### Monitoring
- Sentry, Prometheus/Grafana

## 7. API Overview

| Endpoint | Method | Description | Access |
|---------|--------|-------------|--------|
| /api/auth/signup | POST | Register new user | Public |
| /api/auth/login | POST | Authenticate user | Public |
| /api/workouts | POST | Create new workout | Authenticated |
| /api/workouts/:id | PUT | Update workout | Authenticated |
| /api/workouts/:id | DELETE | Delete workout | Admin/Owner |
| /api/meals | POST | Log a meal | Authenticated |
| /api/meals/quick-add | POST | Quick add common meal | Authenticated |
| /api/random-exercise/today | GET | Get today’s random exercise | Authenticated |
| /api/leaderboard/weekly | GET | Get weekly leaderboard | Authenticated |
| /api/water/log | POST | Log water intake | Authenticated |

This proposal outlines the full scope of FitTrace, including key modules, architecture, and tech stack for a production-grade implementation using Next.js, Node.js, Express, Prisma, and PostgreSQL.

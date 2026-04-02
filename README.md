# DSA Tracker — Company-wise Interview Prep

A full-stack production-ready web application for tracking DSA problem-solving progress across 200+ tech companies. Built with Next.js 14, Express.js, and MongoDB.

---

## 📁 Folder Structure

```
dsa-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── question.controller.js
│   │   │   └── progress.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Question.js
│   │   │   └── Progress.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── question.routes.js
│   │   │   ├── progress.routes.js
│   │   │   ├── company.routes.js
│   │   │   └── user.routes.js
│   │   ├── utils/
│   │   │   ├── db.js
│   │   │   └── jwt.js
│   │   └── index.js
│   ├── scripts/
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (app)/
    │   │   │   ├── layout.tsx          # Protected app shell
    │   │   │   ├── dashboard/page.tsx
    │   │   │   ├── company/
    │   │   │   │   ├── page.tsx        # Company list
    │   │   │   │   └── [name]/page.tsx # Company questions
    │   │   │   ├── bookmarks/page.tsx
    │   │   │   └── settings/page.tsx
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Providers.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── TopBar.tsx
    │   │   ├── ui/
    │   │   │   └── index.tsx           # Skeleton, ProgressBar, StatsCard, Badges
    │   │   ├── dashboard/
    │   │   │   ├── ActivityHeatmap.tsx
    │   │   │   └── CompanyProgressList.tsx
    │   │   └── questions/
    │   │       └── QuestionRow.tsx
    │   ├── hooks/
    │   │   └── useQueries.ts           # All React Query hooks
    │   ├── lib/
    │   │   ├── api.ts                  # Axios client
    │   │   └── utils.ts
    │   ├── store/
    │   │   └── auth.store.ts           # Zustand auth store
    │   └── types/
    │       └── index.ts
    ├── .env.example
    ├── next.config.js
    ├── tailwind.config.ts
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free M0 tier)

### 1. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **M0 Free** cluster
3. Under **Database Access** → Add a database user with a password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all) for development
5. Click **Connect** → **Drivers** → Copy the connection string
6. Replace `<password>` with your actual password in the URI

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dsa-tracker?retryWrites=true&w=majority
JWT_SECRET=your_minimum_32_character_secret_key_here_make_it_random
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm install

# Seed the database (fetches from GitHub + adds 150+ fallback questions)
npm run seed

# Start dev server
npm run dev
```

The backend will run at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

The frontend will run at `http://localhost:3000`

---

## 🌐 Deployment

### Backend → Render (Free tier)

1. Push your code to GitHub
2. Go to [https://render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo → select the `backend` folder
4. Configure:
   - **Build command:** `npm install`
   - **Start command:** `node src/index.js`
   - **Node version:** 18
5. Add environment variables (same as `.env`):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app`
6. Deploy → note your Render URL (e.g. `https://dsa-tracker-api.onrender.com`)

### Frontend → Vercel

1. Go to [https://vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo → set **Root Directory** to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://dsa-tracker-api.onrender.com/api`
4. Deploy

### Post-deploy seed

After deploying backend to Render, run seed via a one-off job:
- In Render dashboard → your service → **Shell** tab
- Run: `node scripts/seed.js`

Or use Railway instead of Render for easier shell access.

---

## 📘 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

### Auth Routes

#### `POST /auth/register`
Register a new user.

**Body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Response `201`:**
```json
{ "token": "eyJ...", "user": { "id": "...", "name": "Jane Doe", "email": "...", "streak": {...}, "totalSolved": 0 } }
```

---

#### `POST /auth/login`
**Body:** `{ "email": "...", "password": "..." }`

**Response `200`:** Same as register.

---

#### `GET /auth/me`
Returns current user. Requires `Authorization: Bearer <token>`.

---

### Question Routes

#### `GET /questions`
Get paginated questions with optional filters.

| Param | Type | Description |
|-------|------|-------------|
| company | string | Filter by company name |
| difficulty | string | Easy / Medium / Hard |
| search | string | Full-text search |
| page | number | Page number (default: 1) |
| limit | number | Per page (default: 50) |

**Response:**
```json
{
  "questions": [{ "_id": "...", "title": "Two Sum", "link": "...", "difficulty": "Easy", "companies": ["Google"], "userStatus": "solved" }],
  "pagination": { "total": 120, "page": 1, "limit": 50, "pages": 3 }
}
```

---

#### `GET /questions/companies`
Returns list of all companies with question counts.

---

#### `GET /questions/:id`
Get single question by ID.

---

### Progress Routes
All require `Authorization: Bearer <token>`.

#### `POST /progress`
Update question status.

**Body:**
```json
{ "questionId": "...", "status": "solved", "notes": "Used two pointers" }
```
Status values: `"solved"` | `"attempted"` | `"not_attempted"`

---

#### `GET /progress/stats?company=Google`
Returns `{ solved, attempted, total, notAttempted }` — optionally scoped to a company.

---

#### `GET /progress/companies`
Returns progress breakdown for every company.

**Response:**
```json
{ "companies": [{ "company": "Google", "total": 50, "solved": 12, "attempted": 5, "percentage": 24 }] }
```

---

#### `GET /progress/activity`
Last 10 solved/attempted questions with full question data.

---

#### `GET /progress/daily`
Daily solve counts for last 30 days (for heatmap).

---

#### `POST /progress/bookmark`
**Body:** `{ "questionId": "..." }`
Toggles bookmark on/off.

---

#### `GET /progress/bookmarks`
Returns all bookmarked questions with progress attached.

---

### User Routes
All require auth.

#### `PATCH /users/profile`
**Body:** `{ "name": "...", "avatar": "..." }`

#### `PATCH /users/password`
**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## 🗄️ Database Schema

### User
```
id, name, email, password (hashed), avatar, googleId,
streak: { current, longest, lastActivity },
bookmarks: [QuestionId],
totalSolved, createdAt, updatedAt
```

### Question
```
id, title, titleSlug, link, difficulty (Easy|Medium|Hard|Unknown),
companies: [string], tags: [string], frequency, leetcodeId,
createdAt, updatedAt
```

### Progress
```
id, userId, questionId,
status (solved|attempted|not_attempted),
notes, solvedAt, attemptCount,
createdAt, updatedAt
```
Unique index on `(userId, questionId)`.

---

## ✨ Features

- ✅ JWT Authentication (register/login/protected routes)
- ✅ 200+ companies with 2000+ questions (seeded from GitHub)
- ✅ Per-question progress: Solved / Attempted / Not Attempted
- ✅ Notes per question (saved to DB)
- ✅ Bookmark questions
- ✅ Company-wise progress bars
- ✅ Overall completion stats
- ✅ Activity heatmap (last 30 days)
- ✅ Streak tracking (current + longest)
- ✅ Recent activity feed
- ✅ Difficulty filters (Easy / Medium / Hard)
- ✅ Status filters (Solved / Attempted / Unsolved)
- ✅ Full-text search
- ✅ Dark mode (default dark, toggleable)
- ✅ Responsive layout (mobile sidebar)
- ✅ Loading skeletons throughout
- ✅ Toast notifications
- ✅ Rate limiting + helmet security headers
- ✅ Pagination

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT with expiry (7 days default)
- Rate limiting: 200 req/15min general, 20 req/15min on auth routes
- CORS restricted to frontend URL in production
- Helmet sets secure HTTP headers
- Input validation on all endpoints

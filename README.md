# Dashboard — Admin Management Portal

A full-stack React dashboard with JWT authentication, role-based access control, and admin approval workflow. Built with **React + Vite + TypeScript**, **Express.js**, **Neon PostgreSQL**, and **Tailwind CSS**.

## Features

- 🔐 JWT-based authentication (signup, login, persistent sessions)
- 👥 Role-based access control (admin / user)
- ✅ Admin approval workflow for new users
- 📊 Admin dashboard with statistics
- 👤 User management (approve, reject, delete)
- 🎨 Dark theme with glassmorphism UI
- 📱 Fully responsive design
- 📄 Document Q&A — upload PDFs/TXT and ask natural language questions (powered by Groq LLM)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root (or copy from `.env.example`):

```env
DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/neondb?sslmode=require
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

> **Get a free Groq API key** at [console.groq.com](https://console.groq.com) for the Document Q&A feature.

### 3. Seed the database

This creates the `users` table and a default admin account:

```bash
npm run seed
```

Default admin credentials:
- Email: `admin@dashboard.com`
- Password: `Admin@123`

### 4. Run locally

Start the API server and Vite dev server:

```bash
# Terminal 1 — API server
npm run server

# Terminal 2 — Frontend
npm run dev
```

Visit `http://localhost:5173`

## Document Q&A Feature

1. Navigate to **Doc Q&A** in the sidebar
2. Upload a **PDF** or **TXT** file (max 10MB)
3. Wait for processing (status changes from "Processing" → "Ready")
4. Click a document to open the **chat interface**
5. Ask natural language questions — the AI answers from the document content

**Roles:** Users see only their own documents. Admins can toggle to view all documents.

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — Neon connection string
   - `JWT_SECRET` — Random secret string
   - `GROQ_API_KEY` — Groq API key
4. Deploy!

> **Note:** File uploads use server filesystem and don't persist on Vercel's ephemeral functions. For production, consider cloud storage (S3, R2).

The included `vercel.json` handles routing automatically.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS |
| Backend | Express.js |
| Database | Neon PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI / LLM | Groq (Llama 3.3 70B) |
| Deployment | Vercel |

## Project Structure

```
dasshboard/
├── api/                  # Express API
│   ├── index.ts          # App entry
│   ├── db/               # Database (schema, seed, pool)
│   ├── middleware/        # JWT auth middleware
│   ├── routes/            # Auth, user, AI & document routes
│   └── utils/             # JWT helpers
├── src/                  # React frontend
│   ├── components/        # Layout, Sidebar, ProtectedRoute
│   ├── contexts/          # AuthContext
│   ├── lib/               # API fetch wrapper
│   └── pages/             # All page components
├── uploads/              # Uploaded documents (gitignored)
├── vercel.json
├── tailwind.config.js
└── vite.config.ts
```

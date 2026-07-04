# Abhyas — Your Interview Co-Pilot

> Practice like it's real, before it actually is.

Abhyas is an AI-powered mock interview platform. Upload your resume, pick a target role,
and get a realistic, adaptive interview with instant feedback, scoring, and progress tracking.

## Status

🚧 Under active development. See [ROADMAP.md](./ROADMAP.md) for phase-by-phase progress.

Currently shipped:
- [x] Phase 1 — Authentication (signup / login / JWT / protected routes)
- [x] Phase 2 — Resume Upload + Parsing (PDF text extraction, skill/section detection)
- [x] Phase 3 — Dashboard (stats, start-interview flow, interview history)
- [x] Phase 4 — AI Question Generation (Gemini primary, Grok fallback, resume-personalized)
- [x] Phase 5 — Real Interview Flow (interactive Q&A loop, per-answer AI feedback + score, session completion with overall score)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + HttpOnly Cookies |
| AI | Gemini / OpenAI API (pluggable) |
| File Upload | Multer |
| Resume Parsing | pdf-parse |
| Speech | Web Speech API |
| Charts | Chart.js |
| Deployment | Vercel (frontend) + Render (backend) |

## Project Structure

```
Abhyas/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── hooks/
    │   ├── contexts/
    │   └── services/
    └── vite.config.js
```

## Local Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License

MIT

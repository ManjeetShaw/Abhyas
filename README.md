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
- [x] Phase 4 — AI Question Generation (Groq, resume-personalized)
- [x] Phase 5 — Real Interview Flow (interactive Q&A loop, per-answer AI feedback + score, session completion with overall score)
- [x] Phase 6 — Feedback System (4-dimension scoring: clarity, technical accuracy, completeness, confidence)
- [x] Phase 7 — Session Summary + Analytics (strengths, weak areas, recommended topics, score-history chart)
- [x] Phase 8 — Voice Mode (speech-to-text answers, text-to-speech questions, pause/resume)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + HttpOnly Cookies |
| AI | Groq API (Llama 3.3 70B) |
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
Create `backend/.env` with:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key   # free at console.groq.com
```
Then:
```bash
cd backend
npm install
npm run dev
```

### Frontend
By default the frontend talks to `http://localhost:5000/api`. To point it
elsewhere (e.g. a deployed backend), create `frontend/.env` with:
```
VITE_API_URL=https://your-backend-url.com/api
```
Then:
```bash
cd frontend
npm install
npm run dev
```

## License

MIT

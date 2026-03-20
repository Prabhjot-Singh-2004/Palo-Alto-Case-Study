# Skill-Bridge Career Navigator

> AI-powered platform that bridges the gap between academic skills and industry requirements through personalized analysis, learning roadmaps, and career tools.

---

## Candidate Name
**Prabhjot Singh**

---

## Scenario Chosen
**Palo Alto Networks — Skill-Bridge Career Navigator**

Students and early-career professionals frequently struggle to translate their academic achievements into the specific technical requirements demanded by the current job market. This platform analyzes uploaded resumes against aggregated market data to provide actionable, data-backed learning roadmaps, targeted interview preparation, JD matching, ATS scanning, cover letter generation, and career path exploration.

---

## Estimated Time Spent
**~5-6 hours** (including debugging, API integration, and feature extensions beyond the original PRD)

---

## Quick Start

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **Python** 3.8+ — [Download](https://www.python.org/)
- **MongoDB Atlas** account — [Free signup](https://www.mongodb.com/atlas)
- **Google Gemini API key** — [Get free key](https://aistudio.google.com/apikey)

### Run Commands

**Terminal 1 — PDF Parser (Python microservice):**
```bash
cd parser
pip install flask PyPDF2
python app.py
```
Runs on `http://localhost:5001`

**Terminal 2 — Backend (Express.js API):**
```bash
cd backend
npm install
npm run seed      # Seed market data + courses into MongoDB
npm run dev       # Start server
```
Runs on `http://localhost:5000`

**Terminal 3 — Frontend (Next.js):**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`

**Environment Setup:**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skill-bridge?appName=Cluster0
PARSER_SERVICE_URL=http://localhost:5001
LLM_API_KEY=your_gemini_api_key_here
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent
FRONTEND_URL=http://localhost:3000
```

### Test Commands

**Health checks:**
```bash
curl http://localhost:5000/api/health      # Backend
curl http://localhost:5001/health           # Parser
```

**Full flow test (via curl):**
```bash
# 1. Upload resume
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@path/to/resume.pdf" \
  -F "targetRole=SDE 1"

# 2. Run gap analysis (use sessionId from step 1)
curl -X POST http://localhost:5000/api/analysis/gap \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<session-id>"}'

# 3. Generate roadmap
curl http://localhost:5000/api/roadmap/<session-id>

# 4. Start mock interview
curl -X POST http://localhost:5000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<session-id>"}'
```

---

## AI Disclosure

**Did you use an AI assistant (Copilot, ChatGPT, etc.)?**

Yes — used AI assistants for code generation, debugging, and architectural decisions.

**How did you verify the suggestions?**
- Tested every API endpoint with `curl` before wiring to the frontend
- Verified MongoDB documents manually using Node.js scripts
- Checked Gemini API responses directly before integrating into routes
- Built the frontend incrementally, testing each page after creation
- Ran `npm run build` after every major change to catch TypeScript errors
- End-to-end tested the full flow: upload → parse → analyze → roadmap → interview

**Give one example of a suggestion you rejected or changed:**
- The `uuid` package (v13) was recommended for generating session IDs, but it's an ESM-only module that broke the CommonJS `require()` syntax in Express. Instead of downgrading or converting the entire project to ESM modules, I rejected the suggestion and used Node.js built-in `crypto.randomUUID()` which is simpler and has zero dependencies.

---

## Tradeoffs & Prioritization

### What did you cut to stay within the 4–6 hour limit?

| Cut | Reason |
|-----|--------|
| **User authentication** (NextAuth/Clerk) | Session-based architecture with UUID is sufficient for MVP demo |
| **Real-time async processing** | Synchronous processing with 15s timeout works for demo scale |
| **CI/CD pipeline** | Manual deployment; not critical for case study demo |
| **Course content hosting** | Links to external platforms (Udemy, YouTube) instead of hosting videos |
| **Live mentoring features** | Out of scope per PRD |

### What would you build next if you had more time?

1. **User authentication** — Login/signup with NextAuth so users can save progress across sessions
2. **Resume versioning** — Track multiple resume uploads and compare skill growth over time
3. **Company-specific JD database** — Pre-loaded JDs from real companies for one-click matching
4. **Skill progress tracking** — Charts showing skill acquisition over weeks/months
5. **Export to PDF** — Download roadmap, cover letter, and ATS report as formatted PDFs
6. **Rate limiting & caching** — Cache Gemini responses to reduce API costs and improve speed

### Known limitations

| Limitation | Impact |
|------------|--------|
| Gemini free tier quota | ~50 requests/day; heavy usage exhausts quota and triggers fallback mode |
| PDF parsing accuracy | Complex layouts (tables, columns, images) may not parse correctly |
| No persistent user accounts | Sessions are browser-based; clearing state loses all progress |
| Keyword-based fallback | Fallback mode uses simple string matching, not semantic understanding |
| Single-region MongoDB | No geographic distribution; latency varies by user location |
| No resume format validation | Accepts any PDF; image-only PDFs will fail to extract text |
| Mock interview has no scoring | Questions are generated but answers aren't evaluated |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Backend | Express.js 5, Mongoose, Multer |
| Database | MongoDB Atlas |
| PDF Parser | Python, Flask, PyPDF2 |
| AI | Google Gemini 2.5 Flash Lite (free tier) |
| HTTP Client | Axios |

---

## Design Documentation

Full technical documentation including architecture diagrams, database schemas, API endpoints, and project structure is available in [`DESIGN.md`](./DESIGN.md).

---

## Synthetic Dataset

A synthetic dataset file `sample-data.json` is included in the repository root containing:
- 4 job roles with market skill requirements
- 24 curated courses across platforms
- 2 sample resume profiles (synthetic, no real personal data)

---

## Author

**Prabhjot Singh**
- GitHub: [@Prabhjot-Singh-2004](https://github.com/Prabhjot-Singh-2004)

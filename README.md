# Skill-Bridge Career Navigator

> AI-powered platform that bridges the gap between academic skills and industry requirements through personalized analysis, learning roadmaps, and career tools.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5-green)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash%20Lite-purple)](https://ai.google.dev/)

---

## Problem Statement

Students and early-career professionals frequently struggle to translate their academic achievements into the specific technical requirements demanded by the current job market. Skill-Bridge Career Navigator is an AI-powered platform designed to demystify this transition. By analyzing a user's uploaded resume against aggregated market data, the platform provides actionable, data-backed learning roadmaps and targeted interview preparation.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 16)                       │
│                      http://localhost:3000                       │
│             TypeScript + Tailwind CSS + Zustand                  │
│                                                                  │
│  Home │ Gap Analysis │ JD Match │ ATS Scan │ Cover Letter │ ...  │
└──────────────────────────┬───────────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼───────────────────────────────────────┐
│                      Backend (Express.js 5)                      │
│                      http://localhost:5000                       │
├──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│  Resume  │   Gap    │  JD      │  ATS     │  Cover   │  Career   │
│  Upload  │ Analysis │  Match   │  Scan    │  Letter  │  Path     │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴─────┬─────┘
     │          │          │          │          │           │
┌────▼─────┐ ┌──▼──────────▼──────────▼──────────▼───────────▼──────┐
│  Python  │ │              Google Gemini 2.5 Flash Lite            │
│  Parser  │ │              (Free Tier - AI Processing)             │
│  :5001   │ └──────────────────────────────────────────────────────┘
│ (PyPDF2) │
└──────────┘ ┌──────────────────────────────────────────────────────┐
             │                 MongoDB Atlas                         │
             │       (User Profiles · Market Data · Courses)         │
             └──────────────────────────────────────────────────────┘
```

---

## Features

### 1. Resume Upload & PDF Parsing
- Drag-and-drop PDF upload with file validation
- Python microservice (Flask + PyPDF2) extracts text from PDFs
- PDFs processed **in-memory only** — never stored on disk (data privacy)
- Automatic fallback to basic text extraction if parser is unavailable

### 2. Gap Analysis Dashboard
- AI compares your resume skills against real market job requirements
- Visual categorization: **Foundational** / **Frameworks** / **Tools** / **Soft Skills**
- Match rate percentage with matched vs. missing skills count
- Skills displayed as color-coded cards with proficiency levels

### 3. Dynamic Learning Roadmap
- Sequential, week-by-week timeline generated from missing skills
- Curated course links (Udemy, YouTube, Coursera, DataCamp)
- Clickable milestone completion tracking with progress bar
- Estimated total weeks to complete the roadmap

### 4. Mock Interview
- AI generates questions **only from your matched skills** (not missing ones)
- Flashcard-style navigation with prev/next controls
- Difficulty levels: Easy / Medium / Hard with visual indicators
- Hints and expected topics per question
- Question overview panel for quick navigation

### 5. JD Match Analyzer
- Paste **any job description** — no pre-loaded data needed
- AI returns: match score (0-100), matched/missing skills, keyword gaps
- Specific strengths and actionable recommendations
- Missing keywords with suggestions on how to add them to your resume

### 6. ATS Resume Scanner
- **Rule-based checks** (free, no API cost):
  - Email, phone, LinkedIn presence
  - Standard sections (Experience, Education, Skills, Summary)
  - Action verbs usage and quantifiable achievements
  - Resume length validation
  - Clean formatting detection
- **AI-powered deep analysis**:
  - Detailed section-by-section scoring
  - Issue detection with severity levels (High/Medium/Low)
  - Specific fix suggestions per issue
- Combined score from both methods

### 7. Cover Letter Generator
- Paste a job description → AI generates a tailored cover letter
- Matches your resume skills to the JD requirements
- Professional tone with strong opening hook
- Copy to clipboard or download as `.txt` file

### 8. Career Path Explorer
- Shows 2 career tracks: **Individual Contributor** and **Engineering Management**
- Each track has 3-4 levels with role, timeframe, and salary range
- Highlights skills you **already have** vs. skills you **need to learn**
- Career tips from AI for professional growth

### Graceful Degradation (System Reliability)
- **15-second timeout** on all AI API calls
- Every AI feature has a **rule-based fallback** that works without API
- Fallback UI with friendly message: *"Our AI is currently taking a coffee break"*
- "Retry AI Analysis" button for manual retry
- **Target: < 2% fallback rate** in production

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS | UI framework & styling |
| **State Management** | Zustand | Client-side state |
| **Backend** | Express.js 5, Mongoose, Multer | REST API server |
| **Database** | MongoDB Atlas | Data persistence |
| **PDF Parser** | Python, Flask, PyPDF2 | Resume text extraction |
| **AI** | Google Gemini 2.5 Flash Lite | Skill analysis, question generation |
| **HTTP Client** | Axios | API communication |

---

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **MongoDB Atlas** account ([Free signup](https://www.mongodb.com/atlas))
- **Google Gemini API key** ([Get free key](https://aistudio.google.com/apikey))

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Prabhjot-Singh-2004/Palo-Alto-Case-Study.git
cd Palo-Alto-Case-Study
```

### 2. Set Up the PDF Parser

```bash
cd parser
pip install flask PyPDF2
python app.py
```
Runs on `http://localhost:5001`

### 3. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=your mongodb uri
PARSER_SERVICE_URL=http://localhost:5001
LLM_API_KEY=your_gemini_api_key_here
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent
FRONTEND_URL=http://localhost:3000
```

Seed the database with market data and courses:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```
Runs on `http://localhost:5000`

### 4. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`

### 5. Verify All Services

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Frontend | http://localhost:3000 | Home page loads |
| Backend | http://localhost:5000/api/health | `{"status":"ok"}` |
| Parser | http://localhost:5001/health | `{"status":"ok"}` |

---

## API Endpoints

### Resume

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/upload` | Upload PDF resume + target role |
| `GET` | `/api/resume/:sessionId` | Get parsed user profile |

### Gap Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analysis/gap` | Run AI gap analysis (with fallback) |
| `POST` | `/api/analysis/retry` | Retry failed analysis |

### Roadmap

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/roadmap/:sessionId` | Generate learning roadmap |
| `PATCH` | `/api/roadmap/:sessionId/milestone` | Update milestone completion |

### Mock Interview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview/start` | Generate interview questions |

### JD Match

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/jd-match/analyze` | Compare resume against job description |

### ATS Scanner

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ats-scan/analyze` | Run ATS compatibility scan |

### Cover Letter

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cover-letter/generate` | Generate tailored cover letter |

### Career Path

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/career-path/explore` | Explore career progression paths |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Backend health check |

---

## Project Structure

```
skill-bridge/
├── README.md
│
├── frontend/                          # Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Home - Upload & Role Selection
│   │   │   ├── analysis/page.tsx      # Gap Analysis Dashboard
│   │   │   ├── jd-match/page.tsx      # JD Match Analyzer
│   │   │   ├── ats-scanner/page.tsx   # ATS Resume Scanner
│   │   │   ├── cover-letter/page.tsx  # Cover Letter Generator
│   │   │   ├── career-path/page.tsx   # Career Path Explorer
│   │   │   ├── roadmap/page.tsx       # Learning Roadmap
│   │   │   ├── interview/page.tsx     # Mock Interview
│   │   │   └── layout.tsx             # Root layout with Navbar
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Navigation bar
│   │   │   ├── SkillCard.tsx          # Skill display card
│   │   │   ├── Timeline.tsx           # Roadmap timeline
│   │   │   ├── QuestionCard.tsx       # Interview question card
│   │   │   └── FallbackUI.tsx         # Graceful degradation UI
│   │   ├── store/
│   │   │   └── useAppStore.ts         # Zustand state management
│   │   └── lib/
│   │       └── api.ts                 # Axios API client
│   ├── .env.local                     # Frontend environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── tailwind.config.ts
│
├── backend/                           # Express.js 5 API Server
│   ├── server.js                      # Entry point
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js            # Global error handler
│   ├── models/
│   │   ├── UserProfile.js             # User profile schema
│   │   ├── MarketData.js              # Market job requirements
│   │   └── Course.js                  # Course/resource schema
│   ├── routes/
│   │   ├── resume.js                  # Resume upload & parsing
│   │   ├── analysis.js                # Gap analysis with Gemini
│   │   ├── roadmap.js                 # Learning roadmap generation
│   │   ├── interview.js               # Mock interview questions
│   │   ├── jdMatch.js                 # JD matching analysis
│   │   ├── atsScan.js                 # ATS compatibility scan
│   │   ├── coverLetter.js             # Cover letter generation
│   │   └── careerPath.js              # Career path exploration
│   ├── scripts/
│   │   └── seed.js                    # Database seeder
│   ├── .env                           # Backend environment variables
│   ├── .gitignore
│   └── package.json
│
└── parser/                            # Python PDF Parser Microservice
    ├── app.py                         # Flask + PyPDF2 parser
    ├── .gitignore
    └── venv/                          # Python virtual environment
```

---

## Database Schema

### UserProfile Collection

```javascript
{
  sessionId: String,           // Unique session identifier (UUID)
  targetRole: String,          // User's target job role
  rawText: String,             // Extracted resume text
  matchedSkills: [{            // Skills found in resume
    skill: String,
    category: "Foundational" | "Frameworks" | "Tools" | "Soft Skills",
    proficiency: "beginner" | "intermediate" | "advanced"
  }],
  missingSkills: [{            // Skills needed for target role
    skill: String,
    category: "Foundational" | "Frameworks" | "Tools" | "Soft Skills",
    importance: "High" | "Medium" | "Low"
  }],
  gapAnalysisStatus: "pending" | "completed" | "fallback" | "failed",
  createdAt: Date,
  updatedAt: Date
}
```

### MarketData Collection

```javascript
{
  role: String,                // Job role (e.g., "SDE 1", "Data Engineer")
  skills: [{                   // Required skills for this role
    skill: String,
    category: String,
    importance: "High" | "Medium" | "Low",
    frequency: Number          // % of job postings requiring this
  }],
  description: String,
  sampleRequirements: [String],
  updatedAt: Date
}
```

### Course Collection

```javascript
{
  title: String,
  platform: String,           // "Udemy", "YouTube", "Coursera", etc.
  url: String,
  skill: String,              // Which skill this course teaches
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  estimatedWeeks: Number,
  description: String,
  tags: [String]
}
```

---

## User Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Upload PDF │───▶│  Parse Text  │───▶│  Select     │
│  Resume     │    │  (Python)    │    │  Target Role│
└─────────────┘    └──────────────┘    └──────┬──────┘
                                              │
                   ┌──────────────────────────┘
                   │
                   ▼
            ┌──────────────┐
            │ Gap Analysis │─── Matched Skills ──▶ Mock Interview
            │ (Gemini AI)  │─── Missing Skills ──▶ Roadmap
            └──────┬───────┘
                   │
        ┌──────────┼──────────┬──────────┬──────────┐
        ▼          ▼          ▼          ▼          ▼
   ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │ JD      │ │ ATS    │ │ Cover  │ │ Career │ │Learning│
   │ Match   │ │ Scan   │ │ Letter │ │ Path   │ │Roadmap │
   └─────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

---

## Seed Data

The `npm run seed` command populates MongoDB with:

- **4 job roles** with market skill requirements:
  - SDE 1 (17 skills)
  - Full Stack Developer (15 skills)
  - Data Engineer (15 skills)
  - Cloud Architect (15 skills)

- **30+ courses** across platforms:
  - Udemy, YouTube, Coursera, DataCamp, freeCodeCamp, Pluralsight
  - Covering: JavaScript, TypeScript, React, Node.js, Python, SQL, Docker, AWS, and more

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/skill-bridge` |
| `PARSER_SERVICE_URL` | Python parser service URL | `http://localhost:5001` |
| `LLM_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `LLM_API_URL` | Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Key Design Decisions

### 1. Microservice for PDF Parsing
PDF parsing is handled by a separate Python service to:
- Leverage PyPDF2's robust PDF extraction
- Keep PDF processing isolated from the Node.js backend
- Enable independent scaling and deployment

### 2. Gemini AI with Fallback
All AI features have rule-based fallbacks:
- **Graceful degradation** ensures the app works even if the AI API is down
- Fallback uses keyword matching against MongoDB market data
- Users see a friendly message instead of errors

### 3. In-Memory PDF Processing
Resumes are never stored on disk:
- PDF buffer is sent to the parser service
- Only extracted text is stored in MongoDB
- Original PDF is discarded after parsing (data privacy)

### 4. Zustand for State Management
- Lightweight alternative to Redux
- No boilerplate, simple API
- Perfect for managing session state across pages

### 5. Session-Based Architecture
- No user authentication required for MVP
- Each resume upload creates a unique session (UUID)
- All subsequent operations use the sessionId

---

## Success Metrics (KPIs)

| Metric | Definition | Target |
|--------|-----------|--------|
| Roadmap Completion Rate | % of users who mark at least 1 milestone complete within 7 days | > 40% |
| Parsing Accuracy Rate | Number of manual edits to matched skills after parsing | < 3 edits |
| Graceful Degradation Rate | % of sessions showing fallback UI | < 2% |
| AI Response Time | Time for gap analysis to return results | < 15 seconds |

---

## License

This project is built for the Palo Alto case study interview.

---

## Author

**Prabhjot Singh**
- GitHub: [@Prabhjot-Singh-2004](https://github.com/Prabhjot-Singh-2004)

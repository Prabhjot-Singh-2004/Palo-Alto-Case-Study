# Skill-Bridge Career Navigator — Design Documentation

> Comprehensive technical documentation for the Skill-Bridge Career Navigator platform.

---

## Problem Statement

Students and early-career professionals frequently struggle to translate their academic achievements into the specific technical requirements demanded by the current job market. Skill-Bridge Career Navigator is an AI-powered platform designed to demystify this transition. By analyzing a user's uploaded resume against aggregated market data, the platform provides actionable, data-backed learning roadmaps and targeted interview preparation.

---

## Objectives for MVP

1. Deliver a clear, personalized path from current capabilities to a target role (e.g., SDE 1, Data Engineer).
2. Successfully parse and extract skills from unstructured PDF resumes.
3. Leverage AI to accurately map skill gaps and generate relevant practice questions, while maintaining system resilience if external LLM APIs fail.

---

## User Personas

| Persona | Description | Primary Goal | Pain Point |
|---------|-------------|-------------|------------|
| **Priya (Recent Grad)** | CS graduate aiming for SDE 1. Strong fundamentals, lacks framework experience. | Know exactly what technologies to learn next. | Overwhelmed by "required" skills on job boards. |
| **David (Career Switcher)** | Transitioning from IT support to Cloud Architecture. | Identify transferable skills and fastest certification route. | Doesn't know how current experience maps to new target. |
| **Sarah (Technical Mentor)** | Senior engineer volunteering to help juniors. | Provide data-backed learning plans, not anecdotal advice. | Spending too much time manually reviewing resumes. |

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

## Features

### Core (from Problem Statement)

#### 1. Resume Upload & PDF Parsing
- Drag-and-drop PDF upload with file validation
- Python microservice (Flask + PyPDF2) extracts text from PDFs
- PDFs processed **in-memory only** — never stored on disk (data privacy)
- Automatic fallback to basic text extraction if parser is unavailable

#### 2. Gap Analysis Dashboard
- AI compares your resume skills against real market job requirements
- Visual categorization: **Foundational** / **Frameworks** / **Tools** / **Soft Skills**
- Match rate percentage with matched vs. missing skills count
- Skills displayed as color-coded cards with proficiency levels

#### 3. Dynamic Learning Roadmap
- Sequential, week-by-week timeline generated from missing skills
- Curated course links (Udemy, YouTube, Coursera, DataCamp)
- Clickable milestone completion tracking with progress bar
- Estimated total weeks to complete the roadmap

#### 4. Mock Interview
- AI generates questions **only from your matched skills** (not missing ones)
- Flashcard-style navigation with prev/next controls
- Difficulty levels: Easy / Medium / Hard with visual indicators
- Hints and expected topics per question
- Question overview panel for quick navigation

#### 5. Graceful Degradation
- **15-second timeout** on all AI API calls
- Every AI feature has a **rule-based fallback** that works without API
- Fallback UI with friendly message: *"Our AI is currently taking a coffee break"*
- "Retry AI Analysis" button for manual retry

### Extended (bonus features)

#### 6. JD Match Analyzer
- Paste **any job description** — no pre-loaded data needed
- AI returns: match score (0-100), matched/missing skills, keyword gaps
- Specific strengths and actionable recommendations
- Missing keywords with suggestions on how to add them to your resume

#### 7. ATS Resume Scanner
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

#### 8. Cover Letter Generator
- Paste a job description → AI generates a tailored cover letter
- Matches your resume skills to the JD requirements
- Professional tone with strong opening hook
- Copy to clipboard or download as `.txt` file

#### 9. Career Path Explorer
- Shows 2 career tracks: **Individual Contributor** and **Engineering Management**
- Each track has 3-4 levels with role, timeframe, and salary range
- Highlights skills you **already have** vs. skills you **need to learn**
- Career tips from AI for professional growth

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/upload` | Upload PDF + target role |
| `GET` | `/api/resume/:sessionId` | Get parsed profile |
| `POST` | `/api/analysis/gap` | AI gap analysis |
| `POST` | `/api/analysis/retry` | Retry failed analysis |
| `GET` | `/api/roadmap/:sessionId` | Generate learning roadmap |
| `PATCH` | `/api/roadmap/:sessionId/milestone` | Update milestone |
| `POST` | `/api/interview/start` | Generate interview questions |
| `POST` | `/api/jd-match/analyze` | Compare resume vs JD |
| `POST` | `/api/ats-scan/analyze` | ATS compatibility scan |
| `POST` | `/api/cover-letter/generate` | Generate cover letter |
| `POST` | `/api/career-path/explore` | Career path exploration |
| `GET` | `/api/health` | Health check |

---

## Database Schema

### UserProfile Collection

```javascript
{
  sessionId: String,           // Unique session identifier (UUID)
  targetRole: String,          // User's target job role
  rawText: String,             // Extracted resume text
  matchedSkills: [{
    skill: String,
    category: "Foundational" | "Frameworks" | "Tools" | "Soft Skills",
    proficiency: "beginner" | "intermediate" | "advanced"
  }],
  missingSkills: [{
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
  role: String,
  skills: [{
    skill: String,
    category: String,
    importance: "High" | "Medium" | "Low",
    frequency: Number
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
  platform: String,
  url: String,
  skill: String,
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

## Project Structure

```
skill-bridge/
├── README.md
├── DESIGN.md                          # This file
├── sample-data.json                   # Synthetic dataset
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
│   │   │   ├── Navbar.tsx
│   │   │   ├── SkillCard.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   └── FallbackUI.tsx
│   │   ├── store/
│   │   │   └── useAppStore.ts         # Zustand state management
│   │   └── lib/
│   │       └── api.ts                 # Axios API client
│   ├── .env.example
│   └── package.json
│
├── backend/                           # Express.js 5 API Server
│   ├── server.js                      # Entry point
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── UserProfile.js
│   │   ├── MarketData.js
│   │   └── Course.js
│   ├── routes/
│   │   ├── resume.js
│   │   ├── analysis.js
│   │   ├── roadmap.js
│   │   ├── interview.js
│   │   ├── jdMatch.js
│   │   ├── atsScan.js
│   │   ├── coverLetter.js
│   │   └── careerPath.js
│   ├── scripts/
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
│
└── parser/                            # Python PDF Parser
    └── app.py
```

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

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `your_mongodb_uri` |
| `PARSER_SERVICE_URL` | Python parser service URL | `http://localhost:5001` |
| `LLM_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `LLM_API_URL` | Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## Seed Data

The `npm run seed` command populates MongoDB with:

- **4 job roles** with market skill requirements (SDE 1, Full Stack Developer, Data Engineer, Cloud Architect)
- **30+ courses** across platforms (Udemy, YouTube, Coursera, DataCamp, freeCodeCamp, Pluralsight)

A standalone `sample-data.json` file is also included in the repository root for reference.

---


## Author

**Prabhjot Singh**
- GitHub: [@Prabhjot-Singh-2004](https://github.com/Prabhjot-Singh-2004)

import { create } from 'zustand';

interface Skill {
  skill: string;
  category: string;
  importance?: string;
  proficiency?: string;
}

interface Milestone {
  skill: string;
  category: string;
  importance: string;
  startWeek: number;
  endWeek: number;
  resources: Array<{ title: string; platform: string; url: string; difficulty: string; estimatedWeeks: number; description: string }>;
  completed: boolean;
}

interface Question {
  id: number;
  skill: string;
  difficulty: string;
  question: string;
  hints: string[];
  expectedTopics: string[];
}

interface JDMatchResult {
  matchScore: number;
  summary: string;
  matchedSkills: Array<{ skill: string; relevance: string }>;
  missingSkills: Array<{ skill: string; importance: string }>;
  keywordMatches: Array<{ keyword: string; found: boolean }>;
  missingKeywords: Array<{ keyword: string; suggestion: string }>;
  strengths: string[];
  recommendations: string[];
}

interface ATSSection {
  score: number;
  max: number;
  status: string;
  details: string;
}

interface ATSResult {
  overallScore: number;
  atsCompatibility: string;
  ruleBasedChecks: Array<{ name: string; passed: boolean; details: string }>;
  aiAnalysis: {
    sections: Record<string, ATSSection>;
    issues: Array<{ severity: string; category: string; issue: string; fix: string }>;
    strengths: string[];
    recommendations: string[];
  } | null;
}

interface CareerLevel {
  role: string;
  timeframe: string;
  salaryRange: string;
  requiredSkills: string[];
  userHasSkills: string[];
  skillsToLearn: string[];
  description: string;
}

interface CareerPath {
  track: string;
  levels: CareerLevel[];
}

interface AppState {
  // Session
  sessionId: string | null;
  targetRole: string;
  rawText: string;

  // Gap Analysis
  matchedSkills: Skill[];
  missingSkills: Skill[];
  analysisStatus: 'idle' | 'loading' | 'completed' | 'fallback' | 'error';
  fallbackMessage: string | null;

  // Roadmap
  milestones: Milestone[];
  totalWeeks: number;
  roadmapStatus: 'idle' | 'loading' | 'completed' | 'error';

  // Interview
  questions: Question[];
  currentQuestionIndex: number;
  showHint: boolean;
  interviewStatus: 'idle' | 'loading' | 'completed' | 'error';

  // JD Match
  jdMatchResult: JDMatchResult | null;
  jdMatchStatus: 'idle' | 'loading' | 'completed' | 'fallback' | 'error';

  // ATS Scan
  atsResult: ATSResult | null;
  atsStatus: 'idle' | 'loading' | 'completed' | 'fallback' | 'error';

  // Cover Letter
  coverLetter: string | null;
  coverLetterStatus: 'idle' | 'loading' | 'completed' | 'fallback' | 'error';

  // Career Path
  careerPaths: CareerPath[];
  careerTips: string[];
  careerCurrentLevel: string;
  careerStatus: 'idle' | 'loading' | 'completed' | 'fallback' | 'error';

  // Actions
  setSession: (sessionId: string, targetRole: string, rawText: string) => void;
  setGapAnalysis: (matched: Skill[], missing: Skill[], status: 'completed' | 'fallback', message?: string) => void;
  setAnalysisLoading: () => void;
  setAnalysisError: () => void;
  setRoadmap: (milestones: Milestone[], totalWeeks: number) => void;
  setRoadmapLoading: () => void;
  setRoadmapError: () => void;
  toggleMilestone: (index: number) => void;
  setInterview: (questions: Question[]) => void;
  setInterviewLoading: () => void;
  setInterviewError: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  toggleHint: () => void;
  reset: () => void;

  // JD Match actions
  setJDMatchLoading: () => void;
  setJDMatchError: () => void;
  setJDMatchResult: (result: JDMatchResult, status: 'completed' | 'fallback') => void;

  // ATS Scan actions
  setATSLoading: () => void;
  setATSError: () => void;
  setATSResult: (result: ATSResult, status: 'completed' | 'fallback') => void;

  // Cover Letter actions
  setCoverLetterLoading: () => void;
  setCoverLetterError: () => void;
  setCoverLetterResult: (letter: string, status: 'completed' | 'fallback') => void;

  // Career Path actions
  setCareerPathLoading: () => void;
  setCareerPathError: () => void;
  setCareerPathResult: (paths: CareerPath[], tips: string[], level: string, status: 'completed' | 'fallback') => void;
}

export const useAppStore = create<AppState>((set) => ({
  sessionId: null,
  targetRole: '',
  rawText: '',

  matchedSkills: [],
  missingSkills: [],
  analysisStatus: 'idle',
  fallbackMessage: null,

  milestones: [],
  totalWeeks: 0,
  roadmapStatus: 'idle',

  questions: [],
  currentQuestionIndex: 0,
  showHint: false,
  interviewStatus: 'idle',

  jdMatchResult: null,
  jdMatchStatus: 'idle',

  atsResult: null,
  atsStatus: 'idle',

  coverLetter: null,
  coverLetterStatus: 'idle',

  careerPaths: [],
  careerTips: [],
  careerCurrentLevel: '',
  careerStatus: 'idle',

  setSession: (sessionId, targetRole, rawText) =>
    set({ sessionId, targetRole, rawText, analysisStatus: 'idle', matchedSkills: [], missingSkills: [], milestones: [], questions: [] }),

  setAnalysisLoading: () => set({ analysisStatus: 'loading' }),
  setAnalysisError: () => set({ analysisStatus: 'error' }),

  setGapAnalysis: (matched, missing, status, message) =>
    set({
      matchedSkills: matched,
      missingSkills: missing,
      analysisStatus: status,
      fallbackMessage: message || null,
    }),

  setRoadmapLoading: () => set({ roadmapStatus: 'loading' }),
  setRoadmapError: () => set({ roadmapStatus: 'error' }),

  setRoadmap: (milestones, totalWeeks) =>
    set({ milestones, totalWeeks, roadmapStatus: 'completed' }),

  toggleMilestone: (index) =>
    set((state) => ({
      milestones: state.milestones.map((m, i) =>
        i === index ? { ...m, completed: !m.completed } : m
      ),
    })),

  setInterviewLoading: () => set({ interviewStatus: 'loading', currentQuestionIndex: 0, showHint: false }),
  setInterviewError: () => set({ interviewStatus: 'error' }),

  setInterview: (questions) =>
    set({ questions, interviewStatus: 'completed', currentQuestionIndex: 0, showHint: false }),

  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1),
      showHint: false,
    })),

  prevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      showHint: false,
    })),

  toggleHint: () => set((state) => ({ showHint: !state.showHint })),

  // JD Match
  setJDMatchLoading: () => set({ jdMatchStatus: 'loading', jdMatchResult: null }),
  setJDMatchError: () => set({ jdMatchStatus: 'error' }),
  setJDMatchResult: (result, status) => set({ jdMatchResult: result, jdMatchStatus: status }),

  // ATS Scan
  setATSLoading: () => set({ atsStatus: 'loading', atsResult: null }),
  setATSError: () => set({ atsStatus: 'error' }),
  setATSResult: (result, status) => set({ atsResult: result, atsStatus: status }),

  // Cover Letter
  setCoverLetterLoading: () => set({ coverLetterStatus: 'loading', coverLetter: null }),
  setCoverLetterError: () => set({ coverLetterStatus: 'error' }),
  setCoverLetterResult: (letter, status) => set({ coverLetter: letter, coverLetterStatus: status }),

  // Career Path
  setCareerPathLoading: () => set({ careerStatus: 'loading', careerPaths: [], careerTips: [] }),
  setCareerPathError: () => set({ careerStatus: 'error' }),
  setCareerPathResult: (paths, tips, level, status) =>
    set({ careerPaths: paths, careerTips: tips, careerCurrentLevel: level, careerStatus: status }),

  reset: () =>
    set({
      sessionId: null,
      targetRole: '',
      rawText: '',
      matchedSkills: [],
      missingSkills: [],
      analysisStatus: 'idle',
      fallbackMessage: null,
      milestones: [],
      totalWeeks: 0,
      roadmapStatus: 'idle',
      questions: [],
      currentQuestionIndex: 0,
      showHint: false,
      interviewStatus: 'idle',
      jdMatchResult: null,
      jdMatchStatus: 'idle',
      atsResult: null,
      atsStatus: 'idle',
      coverLetter: null,
      coverLetterStatus: 'idle',
      careerPaths: [],
      careerTips: [],
      careerCurrentLevel: '',
      careerStatus: 'idle',
    }),
}));

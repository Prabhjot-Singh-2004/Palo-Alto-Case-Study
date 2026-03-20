import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export interface ResumeUploadResponse {
  success: boolean;
  data: {
    sessionId: string;
    targetRole: string;
    rawText: string;
    parsedAt: string;
  };
}

export interface GapAnalysisResponse {
  success: boolean;
  fallback?: boolean;
  data: {
    sessionId: string;
    targetRole: string;
    matchedSkills: Array<{ skill: string; category: string; proficiency: string }>;
    missingSkills: Array<{ skill: string; category: string; importance: string }>;
    status: 'completed' | 'fallback';
    message?: string;
  };
}

export interface RoadmapResponse {
  success: boolean;
  data: {
    sessionId: string;
    targetRole: string;
    totalWeeks: number;
    milestones: Array<{
      skill: string;
      category: string;
      importance: string;
      startWeek: number;
      endWeek: number;
      resources: Array<{ title: string; platform: string; url: string; difficulty: string; estimatedWeeks: number; description: string }>;
      completed: boolean;
    }>;
  };
}

export interface InterviewResponse {
  success: boolean;
  fallback?: boolean;
  data: {
    sessionId: string;
    questions: Array<{
      id: number;
      skill: string;
      difficulty: string;
      question: string;
      hints: string[];
      expectedTopics: string[];
    }>;
    message?: string;
  };
}

export const resumeApi = {
  upload: async (file: File, targetRole: string): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    const { data } = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getProfile: async (sessionId: string) => {
    const { data } = await api.get(`/resume/${sessionId}`);
    return data;
  },
};

export const analysisApi = {
  gapAnalysis: async (sessionId: string): Promise<GapAnalysisResponse> => {
    const { data } = await api.post('/analysis/gap', { sessionId });
    return data;
  },

  retry: async (sessionId: string): Promise<GapAnalysisResponse> => {
    const { data } = await api.post('/analysis/retry', { sessionId });
    return data;
  },
};

export const roadmapApi = {
  getRoadmap: async (sessionId: string): Promise<RoadmapResponse> => {
    const { data } = await api.get(`/roadmap/${sessionId}`);
    return data;
  },
};

export const interviewApi = {
  start: async (sessionId: string): Promise<InterviewResponse> => {
    const { data } = await api.post('/interview/start', { sessionId });
    return data;
  },
};

export const jdMatchApi = {
  analyze: async (sessionId: string, jobDescription: string) => {
    const { data } = await api.post('/jd-match/analyze', { sessionId, jobDescription });
    return data;
  },
};

export const atsScanApi = {
  analyze: async (sessionId: string) => {
    const { data } = await api.post('/ats-scan/analyze', { sessionId });
    return data;
  },
};

export const coverLetterApi = {
  generate: async (sessionId: string, jobDescription: string) => {
    const { data } = await api.post('/cover-letter/generate', { sessionId, jobDescription });
    return data;
  },
};

export const careerPathApi = {
  explore: async (sessionId: string) => {
    const { data } = await api.post('/career-path/explore', { sessionId });
    return data;
  },
};

export default api;

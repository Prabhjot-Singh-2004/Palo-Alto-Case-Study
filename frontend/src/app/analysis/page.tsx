'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { analysisApi, roadmapApi } from '@/lib/api';
import SkillCard from '@/components/SkillCard';
import FallbackUI from '@/components/FallbackUI';
import toast, { Toaster } from 'react-hot-toast';

export default function AnalysisPage() {
  const router = useRouter();
  const {
    sessionId,
    targetRole,
    rawText,
    matchedSkills,
    missingSkills,
    analysisStatus,
    fallbackMessage,
    setGapAnalysis,
    setAnalysisLoading,
    setAnalysisError,
    setRoadmap,
    setRoadmapLoading,
    setRoadmapError,
  } = useAppStore();

  const [retrying, setRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<'matched' | 'missing'>('missing');

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    if (analysisStatus === 'idle') {
      runAnalysis();
    }
  }, [sessionId]);

  const runAnalysis = async () => {
    if (!sessionId) return;
    setAnalysisLoading();
    try {
      const response = await analysisApi.gapAnalysis(sessionId);
      setGapAnalysis(
        response.data.matchedSkills,
        response.data.missingSkills,
        response.data.status,
        response.data.message
      );
    } catch {
      setAnalysisError();
      toast.error('Analysis failed. Please try again.');
    }
  };

  const handleRetry = async () => {
    if (!sessionId) return;
    setRetrying(true);
    try {
      const response = await analysisApi.gapAnalysis(sessionId);
      setGapAnalysis(
        response.data.matchedSkills,
        response.data.missingSkills,
        response.data.status,
        response.data.message
      );
      toast.success('AI analysis complete!');
    } catch {
      toast.error('Retry failed. Basic results are still available.');
    } finally {
      setRetrying(false);
    }
  };

  const handleViewRoadmap = async () => {
    if (!sessionId) return;
    setRoadmapLoading();
    try {
      const response = await roadmapApi.getRoadmap(sessionId);
      setRoadmap(response.data.milestones, response.data.totalWeeks);
      router.push('/roadmap');
    } catch {
      setRoadmapError();
      toast.error('Failed to generate roadmap. Please complete gap analysis first.');
    }
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gap Analysis Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Target Role: <span className="font-medium text-indigo-600">{targetRole}</span>
        </p>
      </div>

      {/* Loading State */}
      {analysisStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Analyzing your skills...</p>
          <p className="text-sm text-gray-400 mt-1">Comparing your resume against market data</p>
        </div>
      )}

      {/* Error State */}
      {analysisStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Analysis failed</p>
          <button
            onClick={runAnalysis}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Fallback or Completed */}
      {(analysisStatus === 'fallback' || analysisStatus === 'completed') && (
        <>
          {analysisStatus === 'fallback' && fallbackMessage && (
            <FallbackUI message={fallbackMessage} onRetry={handleRetry} retrying={retrying} />
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">{matchedSkills.length}</p>
              <p className="text-sm text-gray-500 mt-1">Skills Matched</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-amber-600">{missingSkills.length}</p>
              <p className="text-sm text-gray-500 mt-1">Skills to Learn</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {matchedSkills.length + missingSkills.length > 0
                  ? Math.round(
                      (matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100
                    )
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Match Rate</p>
            </div>
          </div>

          {/* Parsed Text Preview */}
          {rawText && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Parsed Resume Text</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{rawText.substring(0, 500)}...</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'matched'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Matched Skills ({matchedSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('missing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'missing'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Missing Skills ({missingSkills.length})
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'matched'
              ? matchedSkills.map((skill, i) => (
                  <SkillCard key={i} {...skill} type="matched" />
                ))
              : missingSkills.map((skill, i) => (
                  <SkillCard key={i} {...skill} importance={skill.importance || 'Medium'} type="missing" />
                ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleViewRoadmap}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Generate Learning Roadmap
            </button>
            <button
              onClick={() => router.push('/interview')}
              className="flex-1 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
            >
              Start Mock Interview
            </button>
          </div>
        </>
      )}
    </div>
  );
}

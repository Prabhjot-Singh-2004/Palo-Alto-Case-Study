'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { jdMatchApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function JDMatchPage() {
  const router = useRouter();
  const {
    sessionId,
    targetRole,
    jdMatchResult,
    jdMatchStatus,
    setJDMatchLoading,
    setJDMatchError,
    setJDMatchResult,
  } = useAppStore();

  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    if (!sessionId) router.push('/');
  }, [sessionId]);

  const handleAnalyze = async () => {
    if (!sessionId || !jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }
    setJDMatchLoading();
    try {
      const response = await jdMatchApi.analyze(sessionId, jobDescription);
      setJDMatchResult(response.data, response.fallback ? 'fallback' : 'completed');
    } catch {
      setJDMatchError();
      toast.error('Analysis failed. Please try again.');
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
  const relevanceColor: Record<string, string> = {
    High: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-gray-100 text-gray-800',
  };
  const importanceColor: Record<string, string> = {
    Critical: 'bg-red-100 text-red-800',
    Important: 'bg-orange-100 text-orange-800',
    'Nice-to-have': 'bg-blue-100 text-blue-800',
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">JD Match Analyzer</h1>
        <p className="text-gray-500 mt-1">
          Paste any job description to see how well your resume matches
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">{jobDescription.length} characters</p>
          <button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || jdMatchStatus === 'loading'}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {jdMatchStatus === 'loading' ? 'Analyzing...' : 'Analyze Match'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {jdMatchStatus === 'loading' && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Comparing your resume to the JD...</p>
        </div>
      )}

      {/* Results */}
      {jdMatchStatus !== 'idle' && jdMatchStatus !== 'loading' && jdMatchResult && (
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${scoreBg(jdMatchResult.matchScore)} mb-3`}>
              <span className={`text-3xl font-bold ${scoreColor(jdMatchResult.matchScore)}`}>
                {jdMatchResult.matchScore}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Match Score</h3>
            <p className="text-sm text-gray-500 mt-1">{jdMatchResult.summary}</p>
          </div>

          {/* Strengths & Recommendations */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-green-500">✓</span> Strengths
              </h3>
              <ul className="space-y-2">
                {jdMatchResult.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-amber-500">!</span> Recommendations
              </h3>
              <ul className="space-y-2">
                {jdMatchResult.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Matched Skills */}
          {jdMatchResult.matchedSkills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Matched Skills ({jdMatchResult.matchedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {jdMatchResult.matchedSkills.map((s, i) => (
                  <span
                    key={i}
                    className={`text-sm px-3 py-1.5 rounded-full font-medium ${relevanceColor[s.relevance] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {s.skill}
                    <span className="ml-1 text-xs opacity-70">({s.relevance})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {jdMatchResult.missingSkills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Missing Skills ({jdMatchResult.missingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {jdMatchResult.missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className={`text-sm px-3 py-1.5 rounded-full font-medium ${importanceColor[s.importance] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {s.skill}
                    <span className="ml-1 text-xs opacity-70">({s.importance})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {jdMatchResult.missingKeywords?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">
                Keywords Missing from Your Resume
              </h3>
              <div className="space-y-2">
                {jdMatchResult.missingKeywords.map((k, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-red-500 font-mono text-sm">&quot;{k.keyword}&quot;</span>
                    <span className="text-xs text-gray-500">→ {k.suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

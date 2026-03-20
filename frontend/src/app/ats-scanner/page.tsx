'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { atsScanApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ATSScannerPage() {
  const router = useRouter();
  const {
    sessionId,
    targetRole,
    atsResult,
    atsStatus,
    setATSLoading,
    setATSError,
    setATSResult,
  } = useAppStore();

  useEffect(() => {
    if (!sessionId) router.push('/');
  }, [sessionId]);

  const handleScan = async () => {
    if (!sessionId) return;
    setATSLoading();
    try {
      const response = await atsScanApi.analyze(sessionId);
      setATSResult(response.data, response.fallback ? 'fallback' : 'completed');
    } catch {
      setATSError();
      toast.error('ATS scan failed. Please try again.');
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
  const severityColor: Record<string, string> = {
    High: 'border-red-300 bg-red-50',
    Medium: 'border-yellow-300 bg-yellow-50',
    Low: 'border-gray-300 bg-gray-50',
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ATS Resume Scanner</h1>
        <p className="text-gray-500 mt-1">
          Check your resume for ATS compatibility issues
        </p>
      </div>

      {/* Scan Button */}
      {atsStatus === 'idle' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Scan</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We&apos;ll check your resume for formatting issues, missing sections, keyword density,
            and ATS compatibility using both rule-based checks and AI analysis.
          </p>
          <button
            onClick={handleScan}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700"
          >
            Scan My Resume
          </button>
        </div>
      )}

      {/* Loading */}
      {atsStatus === 'loading' && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Scanning your resume...</p>
          <p className="text-sm text-gray-400 mt-1">Running rule-based + AI checks</p>
        </div>
      )}

      {/* Error */}
      {atsStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">ATS scan failed</p>
          <button
            onClick={handleScan}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {(atsStatus === 'completed' || atsStatus === 'fallback') && atsResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-6">
              <div className={`flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-full ${scoreBg(atsResult.overallScore)}`}>
                <span className={`text-4xl font-bold ${scoreColor(atsResult.overallScore)}`}>
                  {atsResult.overallScore}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ATS Compatibility: {atsResult.atsCompatibility}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {atsResult.overallScore >= 80
                    ? 'Your resume is well-optimized for ATS systems.'
                    : atsResult.overallScore >= 60
                      ? 'Your resume has some ATS issues that could be improved.'
                      : 'Your resume has significant ATS issues that may prevent it from being parsed correctly.'}
                </p>
                {atsStatus === 'fallback' && (
                  <p className="text-xs text-amber-600 mt-2">Showing rule-based checks only (AI analysis unavailable)</p>
                )}
              </div>
            </div>
          </div>

          {/* Rule-Based Checks */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Basic Checks</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {atsResult.ruleBasedChecks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    check.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <span className={`text-lg ${check.passed ? 'text-green-500' : 'text-red-500'}`}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${check.passed ? 'text-green-800' : 'text-red-800'}`}>
                      {check.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {check.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Sections */}
          {atsResult.aiAnalysis?.sections && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
              <div className="space-y-3">
                {Object.entries(atsResult.aiAnalysis.sections).map(([key, section]) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          section.status === 'pass' ? 'bg-green-500' : section.status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(section.score / section.max) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-700">
                      {section.score}/{section.max}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Issues */}
          {atsResult.aiAnalysis?.issues && atsResult.aiAnalysis.issues.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Issues Found</h3>
              <div className="space-y-3">
                {atsResult.aiAnalysis.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-l-4 ${severityColor[issue.severity]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        issue.severity === 'High' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {issue.severity}
                      </span>
                      <span className="text-xs text-gray-500">{issue.category}</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{issue.issue}</p>
                    <p className="text-xs text-gray-500 mt-1">Fix: {issue.fix}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {atsResult.aiAnalysis?.recommendations && atsResult.aiAnalysis.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {atsResult.aiAnalysis.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rescan */}
          <div className="text-center">
            <button
              onClick={handleScan}
              className="px-6 py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 text-sm"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

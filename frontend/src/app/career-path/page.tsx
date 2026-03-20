'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { careerPathApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CareerPathPage() {
  const router = useRouter();
  const {
    sessionId,
    targetRole,
    careerPaths,
    careerTips,
    careerCurrentLevel,
    careerStatus,
    setCareerPathLoading,
    setCareerPathError,
    setCareerPathResult,
  } = useAppStore();

  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }
    if (careerStatus === 'idle') {
      fetchCareerPaths();
    }
  }, [sessionId]);

  useEffect(() => {
    if (careerPaths.length > 0) setActiveTrack(0);
  }, [careerPaths]);

  const fetchCareerPaths = async () => {
    if (!sessionId) return;
    setCareerPathLoading();
    try {
      const response = await careerPathApi.explore(sessionId);
      setCareerPathResult(
        response.data.paths,
        response.data.tips || [],
        response.data.currentLevel || 'Junior',
        response.fallback ? 'fallback' : 'completed'
      );
    } catch {
      setCareerPathError();
      toast.error('Failed to load career paths');
    }
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Career Path Explorer</h1>
        <p className="text-gray-500 mt-1">
          See where your skills can take you — from <span className="font-medium text-indigo-600">{targetRole}</span> and beyond
        </p>
      </div>

      {/* Loading */}
      {careerStatus === 'loading' && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Mapping your career paths...</p>
        </div>
      )}

      {/* Error */}
      {careerStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load career paths</p>
          <button
            onClick={fetchCareerPaths}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {(careerStatus === 'completed' || careerStatus === 'fallback') && careerPaths.length > 0 && (
        <>
          {/* Current Level Badge */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {careerCurrentLevel?.charAt(0) || 'J'}
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">
                Current Level: <span className="font-bold">{careerCurrentLevel || 'Junior'}</span>
              </p>
              <p className="text-xs text-indigo-600">Based on your resume analysis</p>
            </div>
          </div>

          {/* Track Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {careerPaths.map((path, i) => (
              <button
                key={i}
                onClick={() => setActiveTrack(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTrack === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {path.track}
              </button>
            ))}
          </div>

          {/* Career Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400" />

            <div className="space-y-6">
              {careerPaths[activeTrack]?.levels.map((level, index) => (
                <div key={index} className="relative pl-20">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-5 w-7 h-7 rounded-full border-3 flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-600 border-indigo-300'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{level.role}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              {level.timeframe}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {level.salaryRange}
                            </span>
                          </div>
                        </div>
                        {index === 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                            Current Target
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{level.description}</p>

                      {/* Skills Grid */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* User Has */}
                        {level.userHasSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">
                              You Have ({level.userHasSkills.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {level.userHasSkills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Need to Learn */}
                        {level.skillsToLearn.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">
                              Need to Learn ({level.skillsToLearn.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {level.skillsToLearn.map((skill, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* All Required Skills */}
                      {level.requiredSkills.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400 mb-1.5">All required skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {level.requiredSkills.map((skill, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-0.5 rounded ${
                                  level.userHasSkills.includes(skill)
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-gray-50 text-gray-500'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {careerTips.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Career Tips
              </h3>
              <ul className="space-y-2">
                {careerTips.map((tip, i) => (
                  <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

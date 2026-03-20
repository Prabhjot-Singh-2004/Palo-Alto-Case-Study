'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { roadmapApi } from '@/lib/api';
import Timeline from '@/components/Timeline';
import toast, { Toaster } from 'react-hot-toast';

export default function RoadmapPage() {
  const router = useRouter();
  const {
    sessionId,
    targetRole,
    milestones,
    totalWeeks,
    roadmapStatus,
    setRoadmap,
    setRoadmapLoading,
    setRoadmapError,
    toggleMilestone,
  } = useAppStore();

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    if (roadmapStatus === 'idle') {
      fetchRoadmap();
    }
  }, [sessionId]);

  const fetchRoadmap = async () => {
    if (!sessionId) return;
    setRoadmapLoading();
    try {
      const response = await roadmapApi.getRoadmap(sessionId);
      setRoadmap(response.data.milestones, response.data.totalWeeks);
    } catch {
      setRoadmapError();
      toast.error('Failed to load roadmap');
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  if (!sessionId) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Learning Roadmap</h1>
        <p className="text-gray-500 mt-1">
          Target Role: <span className="font-medium text-indigo-600">{targetRole}</span>
        </p>
      </div>

      {/* Loading */}
      {roadmapStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Building your roadmap...</p>
        </div>
      )}

      {/* Error */}
      {roadmapStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Could not generate roadmap</p>
          <p className="text-sm text-red-600 mt-1">Please complete gap analysis first.</p>
          <button
            onClick={() => router.push('/analysis')}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Go to Gap Analysis
          </button>
        </div>
      )}

      {/* Completed */}
      {roadmapStatus === 'completed' && (
        <>
          {/* Progress Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                <p className="text-sm text-gray-500">
                  {completedCount} of {milestones.length} milestones completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{progressPercent}%</p>
                <p className="text-xs text-gray-500">{totalWeeks} weeks estimated</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <Timeline milestones={milestones} onToggle={toggleMilestone} />

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push('/analysis')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Back to Analysis
            </button>
            <button
              onClick={() => router.push('/interview')}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Practice with Mock Interview
            </button>
          </div>
        </>
      )}
    </div>
  );
}

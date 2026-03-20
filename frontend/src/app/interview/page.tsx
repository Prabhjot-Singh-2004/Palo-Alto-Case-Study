'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { interviewApi } from '@/lib/api';
import QuestionCard from '@/components/QuestionCard';
import FallbackUI from '@/components/FallbackUI';
import toast, { Toaster } from 'react-hot-toast';

export default function InterviewPage() {
  const router = useRouter();
  const {
    sessionId,
    matchedSkills,
    questions,
    currentQuestionIndex,
    showHint,
    interviewStatus,
    fallbackMessage,
    setInterview,
    setInterviewLoading,
    setInterviewError,
    nextQuestion,
    prevQuestion,
    toggleHint,
  } = useAppStore();

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    if (interviewStatus === 'idle') {
      startInterview();
    }
  }, [sessionId]);

  const startInterview = async () => {
    if (!sessionId) return;
    setInterviewLoading();
    try {
      const response = await interviewApi.start(sessionId);
      setInterview(response.data.questions);
      if (response.fallback) {
        toast('Using basic questions - AI is temporarily unavailable', { icon: '⚠️' });
      }
    } catch {
      setInterviewError();
      toast.error('Failed to generate interview questions');
    }
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
        <p className="text-gray-500 mt-1">
          Practice questions based on your matched skills only
        </p>
      </div>

      {/* Matched Skills Info */}
      {matchedSkills.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-800">
            <span className="font-medium">Focus areas:</span>{' '}
            {matchedSkills.map((s) => s.skill).join(', ')}
          </p>
        </div>
      )}

      {/* Loading */}
      {interviewStatus === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Generating interview questions...</p>
          <p className="text-sm text-gray-400 mt-1">Tailoring to your skill set</p>
        </div>
      )}

      {/* Error */}
      {interviewStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Failed to generate questions</p>
          <button
            onClick={startInterview}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Questions */}
      {interviewStatus === 'completed' && questions.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {questions.length} questions generated
            </p>
            <button
              onClick={startInterview}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Regenerate Questions
            </button>
          </div>

          <QuestionCard
            question={questions[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            total={questions.length}
            showHint={showHint}
            onToggleHint={toggleHint}
            onNext={nextQuestion}
            onPrev={prevQuestion}
          />

          {/* All Questions Overview */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">All Questions</h3>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => {
                    useAppStore.getState().currentQuestionIndex !== i &&
                      useAppStore.setState({ currentQuestionIndex: i, showHint: false });
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                    i === currentQuestionIndex
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      Q{i + 1}. {q.question.substring(0, 60)}...
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{q.skill}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Back */}
          <div className="mt-8">
            <button
              onClick={() => router.push('/analysis')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Back to Analysis
            </button>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

interface QuestionCardProps {
  question: {
    id: number;
    skill: string;
    difficulty: string;
    question: string;
    hints: string[];
    expectedTopics: string[];
  };
  currentIndex: number;
  total: number;
  showHint: boolean;
  onToggleHint: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800',
};

export default function QuestionCard({
  question,
  currentIndex,
  total,
  showHint,
  onToggleHint,
  onNext,
  onPrev,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              Question {currentIndex + 1} of {total}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[question.difficulty]}`}>
              {question.difficulty}
            </span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium">
            {question.skill}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-lg text-gray-900 leading-relaxed">{question.question}</p>

        {/* Hint toggle */}
        <div className="mt-6">
          <button
            onClick={onToggleHint}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
            <svg className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showHint && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">Hints:</p>
              <ul className="space-y-1">
                {question.hints.map((hint, i) => (
                  <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Expected Topics */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Key Topics to Cover:</p>
          <div className="flex flex-wrap gap-2">
            {question.expectedTopics.map((topic, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === currentIndex ? 'bg-indigo-600' : i < currentIndex ? 'bg-indigo-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

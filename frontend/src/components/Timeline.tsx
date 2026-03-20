'use client';

interface TimelineProps {
  milestones: Array<{
    skill: string;
    category: string;
    importance: string;
    startWeek: number;
    endWeek: number;
    resources: Array<{ title: string; platform: string; url: string; difficulty: string; estimatedWeeks: number; description: string }>;
    completed: boolean;
  }>;
  onToggle: (index: number) => void;
}

const importanceColors: Record<string, string> = {
  High: 'border-red-400 bg-red-50',
  Medium: 'border-yellow-400 bg-yellow-50',
  Low: 'border-gray-300 bg-gray-50',
};

const importanceDotColors: Record<string, string> = {
  High: 'bg-red-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-gray-400',
};

export default function Timeline({ milestones, onToggle }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative pl-16">
            {/* Timeline dot */}
            <button
              onClick={() => onToggle(index)}
              className={`absolute left-4 w-5 h-5 rounded-full border-2 transition-all z-10 flex items-center justify-center ${
                milestone.completed
                  ? 'bg-green-500 border-green-500'
                  : `${importanceDotColors[milestone.importance]} border-transparent`
              }`}
            >
              {milestone.completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* Card */}
            <div
              className={`bg-white rounded-xl border-l-4 border border-gray-200 shadow-sm overflow-hidden transition-all ${
                importanceColors[milestone.importance]
              } ${milestone.completed ? 'opacity-60' : ''}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold text-gray-900 ${milestone.completed ? 'line-through' : ''}`}>
                      {milestone.skill}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Week {milestone.startWeek}{milestone.startWeek !== milestone.endWeek ? ` - ${milestone.endWeek}` : ''} 
                      {' '} ({milestone.endWeek - milestone.startWeek + 1} week{milestone.endWeek - milestone.startWeek + 1 > 1 ? 's' : ''})
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    milestone.importance === 'High' ? 'bg-red-100 text-red-700' :
                    milestone.importance === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {milestone.importance}
                  </span>
                </div>

                {/* Resources */}
                {milestone.resources.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resources</p>
                    {milestone.resources.map((resource, rIdx) => (
                      <a
                        key={rIdx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-indigo-600 text-xs font-bold">
                            {resource.platform?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 truncate">
                            {resource.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{resource.platform}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{resource.difficulty}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{resource.estimatedWeeks}w</span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

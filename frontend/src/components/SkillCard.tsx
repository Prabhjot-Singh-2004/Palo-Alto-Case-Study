'use client';

interface SkillCardProps {
  skill: string;
  category: string;
  importance?: string;
  proficiency?: string;
  type: 'matched' | 'missing';
}

const categoryColors: Record<string, string> = {
  Foundational: 'bg-blue-100 text-blue-800',
  Frameworks: 'bg-purple-100 text-purple-800',
  Tools: 'bg-green-100 text-green-800',
  'Soft Skills': 'bg-orange-100 text-orange-800',
};

const importanceColors: Record<string, string> = {
  High: 'border-red-300 bg-red-50',
  Medium: 'border-yellow-300 bg-yellow-50',
  Low: 'border-gray-300 bg-gray-50',
};

export default function SkillCard({ skill, category, importance, proficiency, type }: SkillCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all hover:shadow-md ${
        type === 'matched'
          ? 'border-green-200 bg-white'
          : importanceColors[importance || 'Medium'] || 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-gray-900">{skill}</h4>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
              {category}
            </span>
            {type === 'matched' && proficiency && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium capitalize">
                {proficiency}
              </span>
            )}
            {type === 'missing' && importance && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                importance === 'High' ? 'bg-red-100 text-red-800' :
                importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {importance} Priority
              </span>
            )}
          </div>
        </div>
        <div className="text-2xl">
          {type === 'matched' ? '✅' : '📌'}
        </div>
      </div>
    </div>
  );
}

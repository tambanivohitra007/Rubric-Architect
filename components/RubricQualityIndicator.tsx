import React, { useState, useMemo } from 'react';
import { RubricData } from '../types';
import { CheckCircle2, Circle, ChevronDown, AlertCircle } from 'lucide-react';

interface Props {
  data: RubricData;
}

interface ChecklistItem {
  id: string;
  label: string;
  check: (data: RubricData) => boolean;
  priority: 'required' | 'recommended';
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'rubricType',
    label: 'Rubric type selected',
    check: (data) => !!data.rubricType,
    priority: 'required'
  },
  {
    id: 'courseName',
    label: 'Course name provided',
    check: (data) => !!data.courseName?.trim(),
    priority: 'required'
  },
  {
    id: 'outcomes',
    label: 'At least 3 learning outcomes',
    check: (data) => data.outcomes.length >= 3,
    priority: 'recommended'
  },
  {
    id: 'criteria',
    label: 'At least 3 criteria',
    check: (data) => data.criteria.length >= 3,
    priority: 'recommended'
  },
  {
    id: 'weights',
    label: 'Weights assigned (if criteria > 1)',
    check: (data) => {
      if (data.criteria.length <= 1) return true;
      const hasWeights = data.criteria.every(c => c.weight !== undefined && c.weight > 0);
      if (!hasWeights) return false;
      const totalWeight = data.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
      return Math.abs(totalWeight - 100) < 0.01;
    },
    priority: 'recommended'
  },
  {
    id: 'studentInstructions',
    label: 'Student instructions provided',
    check: (data) => !!data.studentInstructions?.trim(),
    priority: 'recommended'
  },
  {
    id: 'graderInstructions',
    label: 'Grader instructions provided',
    check: (data) => !!data.graderInstructions?.trim(),
    priority: 'recommended'
  },
  {
    id: 'descriptors',
    label: 'All descriptors filled',
    check: (data) => {
      if (data.rows.length === 0) return false;
      return data.rows.every(row =>
        row.levels.every(level => level.description?.trim())
      );
    },
    priority: 'required'
  }
];

const RubricQualityIndicator: React.FC<Props> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { completedItems, score, requiredMet, totalRequired } = useMemo(() => {
    const results = CHECKLIST_ITEMS.map(item => ({
      ...item,
      completed: item.check(data)
    }));

    const completed = results.filter(r => r.completed).length;
    const requiredItems = results.filter(r => r.priority === 'required');
    const requiredComplete = requiredItems.filter(r => r.completed).length;

    return {
      completedItems: results,
      score: Math.round((completed / CHECKLIST_ITEMS.length) * 100),
      requiredMet: requiredComplete === requiredItems.length,
      totalRequired: requiredItems.length
    };
  }, [data]);

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-red-400';
  };

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Circular Progress */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                className={getProgressColor()}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor()}`}>
              {score}%
            </span>
          </div>

          <div className="text-left">
            <p className="font-medium text-slate-800">Rubric Quality Score</p>
            <p className="text-xs text-slate-500">
              {completedItems.filter(i => i.completed).length} of {CHECKLIST_ITEMS.length} best practices met
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!requiredMet && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
              <AlertCircle className="w-3 h-3" />
              Missing required
            </span>
          )}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            {completedItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  item.completed ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? 'text-green-800' : 'text-slate-600'}`}>
                  {item.label}
                </span>
                {item.priority === 'required' && !item.completed && (
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-red-500 font-medium">
                    Required
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400 text-center">
            Higher scores indicate rubrics that follow pedagogical best practices.
          </p>
        </div>
      )}
    </div>
  );
};

export default RubricQualityIndicator;

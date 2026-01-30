import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { RubricData } from '../types';
import { getRubricByShareId } from '../services/firestoreService';

export function SharedRubricPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [rubric, setRubric] = useState<RubricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      loadSharedRubric(shareId);
    }
  }, [shareId]);

  const loadSharedRubric = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRubricByShareId(id);
      if (data) {
        setRubric(data);
      } else {
        setError('This rubric is not available or the link may have expired.');
      }
    } catch (err) {
      console.error('Error loading shared rubric:', err);
      setError('Failed to load rubric.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading rubric...</p>
        </div>
      </div>
    );
  }

  if (error || !rubric) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-slate-900 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="RubricArchitect" className="w-8 h-8 rounded-lg" />
              <h1 className="text-xl font-bold text-white">RubricArchitect</h1>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Rubric Not Found
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="no-print bg-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="RubricArchitect" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-white">RubricArchitect</h1>
          </Link>
          <div className="text-slate-400 text-sm">
            Shared Rubric (Read-only)
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{rubric.topic}</h1>
          {rubric.courseName && (
            <p className="text-slate-600">{rubric.courseName}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              {rubric.rubricType}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
              {rubric.criteria.length} criteria
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
              {rubric.scale.length} levels
            </span>
          </div>
        </div>

        {/* Outcomes */}
        {rubric.outcomes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Learning Outcomes</h2>
            <ul className="space-y-2">
              {rubric.outcomes.map((outcome, index) => (
                <li key={outcome.id} className="flex gap-3 text-slate-700">
                  <span className="text-teal-600 font-medium">{index + 1}.</span>
                  {outcome.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rubric Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 font-semibold text-slate-900 min-w-[200px]">
                    Criteria
                  </th>
                  {rubric.scale.map((level, index) => (
                    <th
                      key={index}
                      className="text-left p-4 font-semibold text-slate-900 min-w-[180px]"
                    >
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rubric.rows.map((row, rowIndex) => {
                  const criterion = rubric.criteria.find(c => c.id === row.criterionId);
                  return (
                    <tr
                      key={row.id}
                      className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="p-4 border-r border-slate-200">
                        <div className="font-medium text-slate-900">
                          {criterion?.title || 'Criterion'}
                        </div>
                        {criterion?.description && (
                          <div className="text-sm text-slate-600 mt-1">
                            {criterion.description}
                          </div>
                        )}
                      </td>
                      {row.levels.map((level, levelIndex) => (
                        <td key={level.id} className="p-4 text-slate-700 text-sm align-top">
                          {level.description}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>Created with RubricArchitect</p>
        </div>
      </main>
    </div>
  );
}

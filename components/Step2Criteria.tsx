import React, { useState, useEffect, useCallback } from 'react';
import { Criterion, RubricData } from '../types';
import { generateCriteriaSuggestions } from '../services/geminiService';
import { Wand2, Plus, X, Loader2, CheckCircle2, Percent, AlertTriangle } from 'lucide-react';

interface Props {
  data: RubricData;
  updateData: (data: Partial<RubricData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Criteria: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(data.criteria.length > 0);
  const [showWeights, setShowWeights] = useState(data.criteria.some(c => c.weight !== undefined));

  // Calculate total weight
  const totalWeight = data.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01 || data.criteria.length === 0;

  // Distribute weights equally among criteria
  const distributeWeightsEqually = useCallback(() => {
    if (data.criteria.length === 0) return;
    const equalWeight = Math.floor(100 / data.criteria.length);
    const remainder = 100 - (equalWeight * data.criteria.length);

    const updated = data.criteria.map((c, idx) => ({
      ...c,
      weight: equalWeight + (idx === 0 ? remainder : 0)
    }));
    updateData({ criteria: updated });
  }, [data.criteria.length, updateData]);

  // Auto-distribute when enabling weights or when criteria count changes
  useEffect(() => {
    if (showWeights && data.criteria.length > 0) {
      const hasWeights = data.criteria.every(c => c.weight !== undefined && c.weight > 0);
      if (!hasWeights) {
        distributeWeightsEqually();
      }
    }
  }, [showWeights, data.criteria.length]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const suggestions = await generateCriteriaSuggestions(
        data.topic, 
        data.courseName, 
        data.outcomes,
        data.contextMaterial,
        data.attachedFile || null,
        data.rubricType,
        data.scale
      );
      updateData({ criteria: suggestions });
      setHasGenerated(true);
    } catch (e) {
      setError('Failed to generate criteria. Please check your API key or file size and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCriterion = () => {
    const newCrit: Criterion = {
      id: Date.now().toString(),
      title: 'New Criterion',
      description: 'Description of assessment...',
      weight: showWeights ? 0 : undefined
    };
    updateData({ criteria: [...data.criteria, newCrit] });
  };

  const removeCriterion = (id: string) => {
    updateData({ criteria: data.criteria.filter(c => c.id !== id) });
  };

  const updateCriterion = (id: string, field: keyof Criterion, value: string) => {
    const updated = data.criteria.map(c => c.id === id ? { ...c, [field]: value } : c);
    updateData({ criteria: updated });
  };

  const updateCriterionWeight = (id: string, weight: number) => {
    const clampedWeight = Math.max(0, Math.min(100, weight));
    const updated = data.criteria.map(c => c.id === id ? { ...c, weight: clampedWeight } : c);
    updateData({ criteria: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Establish Criteria</h2>
        <p className="text-slate-500">What specific dimensions will you assess?</p>
      </div>

      {!hasGenerated && data.criteria.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <Wand2 className="w-8 h-8 text-teal-600" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-slate-800">AI Assistance Ready</h3>
            <p className="text-slate-500 mt-1">
              We will analyze your outcomes {data.attachedFile ? 'and uploaded materials' : ''} to suggest assessment criteria suited for a <strong>{data.rubricType}</strong> rubric.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium shadow-md shadow-teal-200 hover:bg-teal-700 disabled:opacity-70 transition-all flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isLoading ? 'Analyzing Materials...' : 'Generate Criteria Suggestions'}
          </button>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
             <div className="mt-0.5 bg-blue-100 p-1 rounded-full text-blue-600">
                <CheckCircle2 className="w-4 h-4" />
             </div>
             <div className="text-sm text-blue-800">
                <p className="font-medium">Review & Refine</p>
                <p className="opacity-80">Edit the titles and descriptions below to match your specific needs. You can regenerate criteria if needed.</p>
             </div>
          </div>

          {/* Weighting Toggle */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Percent className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Criterion Weighting</p>
                  <p className="text-xs text-slate-500">Assign percentage weights to each criterion</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWeights}
                  onChange={(e) => setShowWeights(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {showWeights && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Total:</span>
                    <span className={`text-sm font-bold ${isWeightValid ? 'text-green-600' : 'text-amber-600'}`}>
                      {totalWeight.toFixed(0)}%
                    </span>
                    {!isWeightValid && (
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Must equal 100%
                      </span>
                    )}
                  </div>
                  <button
                    onClick={distributeWeightsEqually}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                  >
                    Distribute Equally
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.criteria.map((crit) => (
              <div key={crit.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-teal-300 transition-colors group relative">
                <button
                  onClick={() => removeCriterion(crit.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                  title="Remove Criterion"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-3 pr-8">
                    <input
                      type="text"
                      value={crit.title}
                      onChange={(e) => updateCriterion(crit.id, 'title', e.target.value)}
                      className="w-full font-semibold text-lg text-slate-800 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                      placeholder="Criterion Title"
                    />
                    <textarea
                      value={crit.description}
                      onChange={(e) => updateCriterion(crit.id, 'description', e.target.value)}
                      className="w-full text-sm text-slate-600 border-none p-0 focus:ring-0 resize-none bg-transparent placeholder:text-slate-300"
                      placeholder="Describe what is being assessed..."
                      rows={2}
                    />
                  </div>

                  {showWeights && (
                    <div className="flex flex-col items-center justify-center border-l border-slate-100 pl-4 min-w-[80px]">
                      <label className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Weight</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={crit.weight ?? 0}
                          onChange={(e) => updateCriterionWeight(crit.id, parseFloat(e.target.value) || 0)}
                          className="w-16 text-center py-1.5 text-sm font-medium border border-slate-200 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={addCriterion}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/30 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Manually
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
             <button
               onClick={handleGenerate}
               disabled={isLoading}
               className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1 font-medium disabled:opacity-50"
             >
               <Wand2 className="w-4 h-4" />
               Regenerate Suggestions
             </button>
             <div className="text-xs text-slate-400">
               {data.criteria.length} criteria selected
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={data.criteria.length === 0}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium shadow-md shadow-teal-200 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next: Define Levels
        </button>
      </div>
    </div>
  );
};

export default Step2Criteria;
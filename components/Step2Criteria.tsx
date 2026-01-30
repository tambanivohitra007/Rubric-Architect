import React, { useState } from 'react';
import { Criterion, RubricData } from '../types';
import { generateCriteriaSuggestions } from '../services/geminiService';
import { Wand2, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';

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
      description: 'Description of assessment...'
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Establish Criteria</h2>
        <p className="text-slate-500">What specific dimensions will you assess?</p>
      </div>

      {!hasGenerated && data.criteria.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <Wand2 className="w-8 h-8 text-indigo-600" />
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
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center gap-2"
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

          <div className="grid grid-cols-1 gap-4">
            {data.criteria.map((crit) => (
              <div key={crit.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors group relative">
                <button
                  onClick={() => removeCriterion(crit.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                  title="Remove Criterion"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="space-y-3 pr-8">
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
              </div>
            ))}
            
            <button
              onClick={addCriterion}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Manually
            </button>
          </div>

          <div className="flex justify-between items-center pt-4">
             <button
               onClick={handleGenerate}
               disabled={isLoading}
               className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium disabled:opacity-50"
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
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next: Define Levels
        </button>
      </div>
    </div>
  );
};

export default Step2Criteria;
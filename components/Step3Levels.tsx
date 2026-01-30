import React, { useState, useEffect } from 'react';
import { RubricData, RubricRow } from '../types';
import { generateRubricRows } from '../services/geminiService';
import { Wand2, Loader2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  data: RubricData;
  updateData: (data: Partial<RubricData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3Levels: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const hasRows = data.rows.length > 0;

  const handleGenerateLevels = async () => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await generateRubricRows(
        data.topic, 
        data.courseName, 
        data.criteria, 
        data.scale,
        data.contextMaterial,
        data.attachedFile || null
      );
      updateData({ rows });
    } catch (e) {
      setError('Failed to generate levels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCellDescription = (rowId: string, levelIndex: number, newDesc: string) => {
    const updatedRows = data.rows.map(row => {
      if (row.id === rowId) {
        const newLevels = [...row.levels];
        newLevels[levelIndex] = { ...newLevels[levelIndex], description: newDesc };
        return { ...row, levels: newLevels };
      }
      return row;
    });
    updateData({ rows: updatedRows });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Performance Levels</h2>
          <p className="text-slate-500">Define what success looks like at each stage.</p>
        </div>
        
        {!hasRows || isLoading ? null : (
          <button
            onClick={handleGenerateLevels}
            className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate All
          </button>
        )}
      </div>

      {!hasRows ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center min-h-[400px]">
           <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Wand2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Populate the Grid</h3>
          <p className="text-slate-500 max-w-md mb-8">
            AI will write unique descriptions for each performance level ({data.scale.join(', ')}) 
            for all {data.criteria.length} of your criteria, taking into account any course materials provided.
          </p>
          
          <button
            onClick={handleGenerateLevels}
            disabled={isLoading}
            className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center gap-3 transform hover:-translate-y-0.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isLoading ? 'Generating Descriptions...' : 'Generate Rubric Content'}
          </button>
          
          {error && (
            <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-indigo-800 font-medium">Refining rubric...</p>
              </div>
            </div>
          )}
          
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-4 border-b-2 border-slate-200 w-1/5 bg-slate-50 sticky top-0 z-10 font-bold text-slate-700">Criteria</th>
                {data.scale.map((level, i) => (
                  <th key={i} className="p-4 border-b-2 border-slate-200 bg-slate-50 sticky top-0 z-10 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((row) => {
                const criterion = data.criteria.find(c => c.id === row.criterionId);
                return (
                  <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top border-r border-slate-100 bg-white">
                      <div className="font-bold text-slate-800 mb-1">{criterion?.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{criterion?.description}</div>
                    </td>
                    {row.levels.map((level, idx) => (
                      <td key={level.id} className="p-3 align-top border-r border-slate-100 last:border-r-0 relative">
                        <textarea
                          className="w-full h-full min-h-[120px] text-sm text-slate-600 bg-transparent border border-transparent hover:border-indigo-100 focus:border-indigo-400 focus:bg-white rounded-md p-2 resize-none outline-none transition-all"
                          value={level.description}
                          onChange={(e) => updateCellDescription(row.id, idx, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasRows}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Next: Review & Export
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step3Levels;

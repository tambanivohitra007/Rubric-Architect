import React, { useState } from 'react';
import { RubricData } from '../types';
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
        data.attachedFile || null,
        data.rubricType
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

  const isHolistic = data.rubricType === 'Holistic';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="flex justify-between items-end pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">
            {isHolistic ? 'Holistic Descriptions' : 'Performance Levels'}
          </h2>
          <p className="text-slate-500">
            {isHolistic 
              ? 'Define the overall quality for each score.' 
              : 'Define what success looks like at each stage.'}
          </p>
        </div>
        
        {!hasRows || isLoading ? null : (
          <button
            onClick={handleGenerateLevels}
            className="text-sm px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate All
          </button>
        )}
      </div>

      {!hasRows ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 text-center min-h-[400px]">
           <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <Wand2 className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Populate the Grid</h3>
          <p className="text-slate-500 max-w-md mb-8">
            AI will write {isHolistic ? 'comprehensive' : 'unique'} descriptions for {isHolistic ? 'each score level' : `each performance level for your ${data.criteria.length} criteria`}, 
            based on the {data.rubricType} style.
          </p>
          
          <button
            onClick={handleGenerateLevels}
            disabled={isLoading}
            className="px-8 py-3.5 bg-teal-600 text-white rounded-lg font-semibold shadow-lg shadow-teal-200 hover:bg-teal-700 disabled:opacity-70 transition-all flex items-center gap-3 transform hover:-translate-y-0.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isLoading ? 'Generating...' : 'Generate Content'}
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
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-teal-800 font-medium">Refining rubric...</p>
              </div>
            </div>
          )}
          
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-4 border-b-2 border-slate-200 w-1/5 bg-slate-50 sticky top-0 z-10 font-bold text-slate-700">
                  {isHolistic ? 'Overall Score' : 'Criteria'}
                </th>
                {isHolistic ? (
                  <th className="p-4 border-b-2 border-slate-200 bg-slate-50 sticky top-0 z-10 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                    Description
                  </th>
                ) : (
                  data.scale.map((level, i) => (
                    <th key={i} className="p-4 border-b-2 border-slate-200 bg-slate-50 sticky top-0 z-10 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                      {level}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* For Holistic, we might have just one row in data.rows, but we want to render it transpose-style:
                  Rows = Levels. 
                  Wait, RubricRow structure is {criterionId, levels[]}.
                  So we normally render 1 row per criterion.
                  For Holistic, we have 1 row with N levels.
                  We can just render that 1 row, but maybe vertically is better for holistic?
                  Let's stick to horizontal for now to keep code simple, OR check rubricType.
                  
                  Actually, holistic is usually: 
                  Score 5 | Description
                  Score 4 | Description
                  
                  This is essentially transposing the single row.
              */}
              {isHolistic ? (
                // Transposed view for Holistic: Show levels as rows
                data.rows[0]?.levels.map((level, idx) => (
                   <tr key={level.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 align-top border-r border-slate-100 bg-white font-bold text-slate-800">
                        {level.title}
                      </td>
                      <td className="p-3 align-top">
                        <textarea
                          className="w-full h-full min-h-[120px] text-sm text-slate-600 bg-transparent border border-transparent hover:border-teal-100 focus:border-teal-400 focus:bg-white rounded-md p-2 resize-none outline-none transition-all"
                          value={level.description}
                          onChange={(e) => updateCellDescription(data.rows[0].id, idx, e.target.value)}
                        />
                      </td>
                   </tr>
                ))
              ) : (
                // Standard Grid
                data.rows.map((row) => {
                  const criterion = data.criteria.find(c => c.id === row.criterionId);
                  return (
                    <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 align-top border-r border-slate-100 bg-white">
                        <div className="font-bold text-slate-800 mb-1">{criterion?.title || 'Criterion'}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{criterion?.description}</div>
                      </td>
                      {row.levels.map((level, idx) => (
                        <td key={level.id} className="p-3 align-top border-r border-slate-100 last:border-r-0 relative">
                          <textarea
                            className="w-full h-full min-h-[120px] text-sm text-slate-600 bg-transparent border border-transparent hover:border-teal-100 focus:border-teal-400 focus:bg-white rounded-md p-2 resize-none outline-none transition-all"
                            value={level.description}
                            onChange={(e) => updateCellDescription(row.id, idx, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
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
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium shadow-md shadow-teal-200 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Next: Review & Export
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Step3Levels;

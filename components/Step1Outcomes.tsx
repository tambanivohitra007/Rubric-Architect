import React, { useState, useRef, useEffect } from 'react';
import { RubricData, RubricType } from '../types';
import { Plus, Trash2, BookOpen, School, Target, Upload, FileText, Settings2, Sliders, Hash, LayoutTemplate } from 'lucide-react';

interface Props {
  data: RubricData;
  updateData: (data: Partial<RubricData>) => void;
  onNext: () => void;
}

const RUBRIC_TYPES: { type: RubricType; label: string; description: string }[] = [
  { type: 'Analytic', label: 'Analytic', description: 'Detailed grid (High detail, projects, presentations)' },
  { type: 'Holistic', label: 'Holistic', description: 'Single overall scale (Low detail, exams, quick grading)' },
  { type: 'SinglePoint', label: 'Single-point', description: 'Center standard with feedback columns (Medium detail, learning focused)' },
  { type: 'Developmental', label: 'Developmental', description: 'Focuses on skill progression (Novice to Expert)' },
  { type: 'Checklist', label: 'Checklist', description: 'Binary requirements (Yes/No, Met/Not Met)' },
  { type: 'CriterionReferenced', label: 'Criterion-referenced', description: 'Measured against fixed standards (OBE & accreditation)' },
  { type: 'NormReferenced', label: 'Norm-referenced', description: 'Comparative ranking (Variable)' },
  { type: 'TaskSpecific', label: 'Task-specific', description: 'Tailored to one specific assignment (High detail)' },
];

const SCORING_PRESETS: Record<string, Record<number, string[]>> = {
  Standard: {
    3: ['Weak', 'Average', 'Strong'],
    4: ['Emerging', 'Developing', 'Proficient', 'Exemplary'],
    5: ['Unsatisfactory', 'Poor', 'Satisfactory', 'Good', 'Excellent'],
  },
  Percentage: {
    3: ['< 60%', '60-80%', '80-100%'],
    4: ['< 60%', '60-75%', '76-89%', '90-100%'],
    5: ['< 60%', '60-69%', '70-79%', '80-89%', '90-100%'],
  },
  Points: {
    3: ['1 pt', '2 pts', '3 pts'],
    4: ['1 pt', '2 pts', '3 pts', '4 pts'],
    5: ['1 pt', '2 pts', '3 pts', '4 pts', '5 pts'],
  },
  Letter: {
    3: ['C', 'B', 'A'],
    4: ['D', 'C', 'B', 'A'],
    5: ['F', 'D', 'C', 'B', 'A'],
  }
};

const TEMPLATES = [
  {
    id: 'essay',
    label: 'Essay / Paper',
    icon: BookOpen,
    data: {
      topic: 'Argumentative Essay',
      rubricType: 'Analytic' as RubricType,
      outcomes: [
        'Construct a clear, arguable thesis statement.',
        'Support arguments with relevant evidence and analysis.',
        'Organize ideas logically with clear transitions.',
        'Apply standard grammar, mechanics, and citation style.'
      ]
    }
  },
  {
    id: 'presentation',
    label: 'Presentation',
    icon: Target,
    data: {
      topic: 'Oral Presentation',
      rubricType: 'Analytic' as RubricType,
      outcomes: [
        'Deliver content with clarity, confidence, and appropriate pacing.',
        'Design effective visual aids to support key points.',
        'Respond effectively and accurately to audience questions.',
        'Structure the presentation within the allotted time.'
      ]
    }
  },
  {
    id: 'lab',
    label: 'Lab Report',
    icon: Settings2,
    data: {
      topic: 'Scientific Lab Report',
      rubricType: 'Analytic' as RubricType,
      outcomes: [
        'Formulate a clear, testable hypothesis.',
        'Record and analyze experimental data accurately.',
        'Interpret results in the context of scientific theory.',
        'Adhere to safety protocols and methodology standards.'
      ]
    }
  },
  {
    id: 'checklist',
    label: 'Quick Checklist',
    icon: Sliders,
    data: {
      topic: 'Requirement Check',
      rubricType: 'Checklist' as RubricType,
      outcomes: [
        'Submit all required file formats.',
        'Meet the minimum word count.',
        'Include a bibliography/reference page.',
        'Follow formatting guidelines (margins, font, spacing).'
      ]
    }
  }
];

const Step1Outcomes: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [newOutcome, setNewOutcome] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scale State
  const [scaleStrategy, setScaleStrategy] = useState('Standard');
  const [scaleLevels, setScaleLevels] = useState(4);

  // Sync internal state with data.scale on mount if it matches a preset, else Custom
  useEffect(() => {
    // This is a simple heuristic; in a real app we might store strategy in RubricData
    if (data.rubricType === 'Checklist' || data.rubricType === 'SinglePoint') return;
    
    // Attempt to match current scale to a preset to set UI state
    // If not matched, we just leave it as is or set to 'Custom'
  }, []);

  const handleTypeChange = (type: RubricType) => {
    let newScale = data.scale;
    let strategy = 'Standard';
    let levels = 4;
    
    // Set default scales based on type
    if (type === 'SinglePoint') {
      newScale = ['Concerns / Areas for Improvement', 'Target Standard', 'Evidence of Exceeding'];
    } else if (type === 'Checklist') {
      newScale = ['Not Met', 'Met'];
    } else if (type === 'Holistic') {
      newScale = SCORING_PRESETS['Standard'][5]; // Default to 5 levels for holistic
      levels = 5;
    } else if (type === 'Developmental') {
      newScale = ['Emerging', 'Developing', 'Proficient', 'Advanced', 'Mastery'];
      levels = 5;
    } else {
       // Reset to standard if switching back from fixed types
       if (data.scale.length <= 3 && !['Analytic', 'TaskSpecific', 'CriterionReferenced', 'NormReferenced'].includes(data.rubricType)) {
           newScale = SCORING_PRESETS['Standard'][4];
       }
    }

    setScaleStrategy(strategy);
    setScaleLevels(levels);
    updateData({ rubricType: type, scale: newScale });
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      updateData({
        topic: template.data.topic,
        rubricType: template.data.rubricType,
        outcomes: template.data.outcomes.map(text => ({ id: Date.now().toString() + Math.random(), text })),
        // If template implies a scale change, handle it, but for now mostly Analytic which keeps defaults
      });
      // Also trigger type change logic to ensure scale is correct for the new type
      handleTypeChange(template.data.rubricType);
    }
  };

  const handleScalePresetChange = (strategy: string, levels: number) => {
    if (SCORING_PRESETS[strategy]?.[levels]) {
      updateData({ scale: SCORING_PRESETS[strategy][levels] });
      setScaleStrategy(strategy);
      setScaleLevels(levels);
    }
  };

  const updateScaleLabel = (index: number, value: string) => {
    const newScale = [...data.scale];
    newScale[index] = value;
    updateData({ scale: newScale });
  };

  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    const updated = [
      ...data.outcomes,
      { id: Date.now().toString(), text: newOutcome.trim() }
    ];
    updateData({ outcomes: updated });
    setNewOutcome('');
  };

  const removeOutcome = (id: string) => {
    updateData({ outcomes: data.outcomes.filter(o => o.id !== id) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOutcome();
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const isPdf = file.type === 'application/pdf';
      const isText = file.type.startsWith('text/') || 
                     file.name.endsWith('.md') || 
                     file.name.endsWith('.txt') || 
                     file.name.endsWith('.csv') ||
                     file.name.endsWith('.json');

      if (isPdf) {
        const base64Data = result.split(',')[1]; 
        updateData({ 
          attachedFile: { name: file.name, mimeType: file.type, data: base64Data }
        });
      } else if (isText) {
         const textReader = new FileReader();
         textReader.onload = (ev) => {
            const textContent = ev.target?.result as string;
            const separator = data.contextMaterial ? "\n\n--- Imported Content ---\n" : "";
            updateData({ contextMaterial: (data.contextMaterial + separator + textContent).trim() });
         };
         textReader.readAsText(file);
      } else {
         const base64Data = result.split(',')[1];
         updateData({ 
           attachedFile: { name: file.name, mimeType: file.type || 'application/octet-stream', data: base64Data }
         });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeFile = () => updateData({ attachedFile: null });

  const isFormValid = data.topic.trim() && data.courseName.trim() && data.outcomes.length > 0;
  const isScaleEditable = !['SinglePoint', 'Checklist', 'Developmental'].includes(data.rubricType);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Course Context & Configuration</h2>
        <p className="text-slate-500">Start from scratch or choose a template to begin.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Templates */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-teal-600" />
            Quick Start Templates
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all text-center gap-2 group"
              >
                <div className="p-2 bg-slate-100 rounded-full group-hover:bg-teal-100 transition-colors">
                  <t.icon className="w-5 h-5 text-slate-500 group-hover:text-teal-600" />
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-teal-800">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 my-2"></div>

        {/* Course & Topic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <School className="w-4 h-4 text-teal-600" />
              Course Name / Code
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="e.g. HIST302: Modern European History"
              value={data.courseName}
              onChange={(e) => updateData({ courseName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              Assignment Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="e.g. Research Term Paper"
              value={data.topic}
              onChange={(e) => updateData({ topic: e.target.value })}
            />
          </div>
        </div>

        {/* Rubric Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-teal-600" />
            Rubric Type
          </label>
          <select 
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            value={data.rubricType}
            onChange={(e) => handleTypeChange(e.target.value as RubricType)}
          >
            {RUBRIC_TYPES.map(t => (
              <option key={t.type} value={t.type}>{t.label} — {t.description}</option>
            ))}
          </select>
        </div>

        {/* Scoring Scale Config */}
        {isScaleEditable && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  Scoring Scale
                </label>
                <div className="flex gap-2">
                  <select 
                     className="px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white outline-none"
                     value={scaleStrategy}
                     onChange={(e) => handleScalePresetChange(e.target.value, scaleLevels)}
                  >
                     <option value="Standard">Standard Labels</option>
                     <option value="Percentage">Percentage Ranges</option>
                     <option value="Points">Points</option>
                     <option value="Letter">Letter Grades</option>
                  </select>
                  <select 
                     className="px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white outline-none"
                     value={scaleLevels}
                     onChange={(e) => handleScalePresetChange(scaleStrategy, parseInt(e.target.value))}
                  >
                     <option value="3">3 Levels</option>
                     <option value="4">4 Levels</option>
                     <option value="5">5 Levels</option>
                  </select>
                </div>
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2">
                {data.scale.map((level, idx) => (
                  <div key={idx} className="flex-1 min-w-[100px]">
                    <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider text-center">Level {idx + 1}</div>
                    <input 
                      type="text" 
                      value={level}
                      onChange={(e) => updateScaleLabel(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm text-center bg-white border border-slate-300 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                ))}
             </div>
          </div>
        )}
        
        {!isScaleEditable && (
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 flex gap-2 items-center">
             <Hash className="w-4 h-4" />
             Scoring scale is fixed for <strong>{data.rubricType}</strong> rubrics.
           </div>
        )}

        {/* Materials */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Course Materials
          </label>
          <textarea 
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all min-h-[100px] text-sm font-mono"
            placeholder="Paste assignment instructions, syllabus details, or reading material text here..."
            value={data.contextMaterial}
            onChange={(e) => updateData({ contextMaterial: e.target.value })}
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !data.attachedFile && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group
              ${isDragging 
                ? 'border-teal-500 bg-teal-50 scale-[1.01]' 
                : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'
              }
              ${data.attachedFile ? 'bg-white cursor-default hover:bg-white hover:border-slate-300' : 'bg-white'}
            `}
          >
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               accept=".pdf,.txt,.md,.csv,.json" 
               className="hidden" 
             />

             {!data.attachedFile ? (
               <div className="flex flex-col items-center gap-2 pointer-events-none">
                 <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-teal-200' : 'bg-slate-100 group-hover:bg-teal-50'}`}>
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`} />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                   <p className="text-xs text-slate-500 mt-1">PDF, TXT, MD supported</p>
                 </div>
               </div>
             ) : (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-teal-100 shadow-sm w-full" onClick={(e) => e.stopPropagation()}>
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-teal-100 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium text-slate-800 truncate" title={data.attachedFile.name}>{data.attachedFile.name}</p>
                        <p className="text-xs text-slate-500 uppercase">{data.attachedFile.mimeType.split('/').pop() || 'FILE'}</p>
                      </div>
                   </div>
                   <button 
                     onClick={removeFile} 
                     className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             )}
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-600" />
            Learning Outcomes
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="e.g. Students can critically analyze primary sources..."
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={addOutcome}
              disabled={!newOutcome.trim()}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 mt-4">
            {data.outcomes.map((outcome) => (
              <div key={outcome.id} className="flex items-start gap-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100 group">
                <div className="mt-1 w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                <span className="flex-1 text-slate-700 text-sm">{outcome.text}</span>
                <button
                  onClick={() => removeOutcome(outcome.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {data.outcomes.length === 0 && (
              <p className="text-sm text-slate-400 italic p-2 text-center border border-dashed border-slate-300 rounded-lg">
                Add at least one learning outcome.
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium shadow-md shadow-teal-200 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next: Generate Criteria
        </button>
      </div>
    </div>
  );
};

export default Step1Outcomes;
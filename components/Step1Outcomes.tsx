import React, { useState, useRef } from 'react';
import { RubricData } from '../types';
import { Plus, Trash2, BookOpen, School, Target, Upload, FileText, X } from 'lucide-react';

interface Props {
  data: RubricData;
  updateData: (data: Partial<RubricData>) => void;
  onNext: () => void;
}

const Step1Outcomes: React.FC<Props> = ({ data, updateData, onNext }) => {
  const [newOutcome, setNewOutcome] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Basic detection for PDF vs Text vs Other
      const isPdf = file.type === 'application/pdf';
      const isText = file.type.startsWith('text/') || 
                     file.name.endsWith('.md') || 
                     file.name.endsWith('.txt') || 
                     file.name.endsWith('.csv') ||
                     file.name.endsWith('.json');

      if (isPdf) {
        // Handle PDF as base64 for API
        const base64Data = result.split(',')[1]; // Strip data URL prefix
        updateData({ 
          attachedFile: {
            name: file.name,
            mimeType: file.type,
            data: base64Data
          }
        });
      } else if (isText) {
         // Read text content and append to context material
         const textReader = new FileReader();
         textReader.onload = (ev) => {
            const textContent = ev.target?.result as string;
            // Append with a newline if there is existing content
            const separator = data.contextMaterial ? "\n\n--- Imported Content ---\n" : "";
            updateData({ contextMaterial: (data.contextMaterial + separator + textContent).trim() });
         };
         textReader.readAsText(file);
      } else {
         // Fallback for other binary types (images etc) if Gemini supports them, treat as attachment
         const base64Data = result.split(',')[1];
         updateData({ 
           attachedFile: {
             name: file.name,
             mimeType: file.type || 'application/octet-stream',
             data: base64Data
           }
         });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    updateData({ attachedFile: null });
  };

  const isFormValid = data.topic.trim() && data.courseName.trim() && data.outcomes.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Course Context</h2>
        <p className="text-slate-500">Define the university course, assignment, and materials.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-600" />
              Course Name / Code
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. HIST302: Modern European History"
              value={data.courseName}
              onChange={(e) => updateData({ courseName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Assignment Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. Research Term Paper"
              value={data.topic}
              onChange={(e) => updateData({ topic: e.target.value })}
            />
          </div>
        </div>

        {/* Materials Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Course Materials & Context
          </label>
          <p className="text-xs text-slate-500">
            Paste text below, or upload a file (PDF, Text).
          </p>
          
          <textarea 
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[120px] text-sm font-mono bg-slate-50"
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
                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
              }
              ${data.attachedFile ? 'bg-white cursor-default hover:bg-white hover:border-slate-300' : ''}
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
                 <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-indigo-200' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                   <p className="text-xs text-slate-500 mt-1">PDF, TXT, MD</p>
                 </div>
               </div>
             ) : (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm w-full" onClick={(e) => e.stopPropagation()}>
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-indigo-100 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium text-slate-800 truncate" title={data.attachedFile.name}>{data.attachedFile.name}</p>
                        <p className="text-xs text-slate-500 uppercase">{data.attachedFile.mimeType.split('/').pop() || 'FILE'}</p>
                      </div>
                   </div>
                   <button 
                     onClick={removeFile} 
                     className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                     title="Remove file"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Learning Outcomes
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
              <div key={outcome.id} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 group">
                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
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
                Add at least one learning outcome to proceed.
              </p>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next: Generate Criteria
        </button>
      </div>
    </div>
  );
};

export default Step1Outcomes;
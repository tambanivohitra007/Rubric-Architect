import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';

export function EmptyLibrary() {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16">
      <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <FolderOpen className="w-10 h-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        No rubrics yet
      </h2>
      <p className="text-slate-600 mb-8 max-w-sm mx-auto">
        Start building your first rubric and it will appear here in your library.
      </p>
      <button
        onClick={() => navigate('/builder')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Create Your First Rubric
      </button>
    </div>
  );
}

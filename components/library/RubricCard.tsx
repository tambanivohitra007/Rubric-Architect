import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Share2, MoreVertical, Eye, Calendar, Grid3X3 } from 'lucide-react';
import { RubricData } from '../../types';

interface Props {
  rubric: RubricData;
  onDelete: (id: string) => void;
  onShare: (rubric: RubricData) => void;
}

export function RubricCard({ rubric, onDelete, onShare }: Props) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    navigate(`/builder/${rubric.id}`);
  };

  const handleDelete = async () => {
    if (!rubric.id) return;

    const confirmed = window.confirm('Are you sure you want to delete this rubric? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(rubric.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewShared = () => {
    if (rubric.shareId && rubric.isPublic) {
      window.open(`/shared/${rubric.shareId}`, '_blank');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate text-lg">
              {rubric.topic || 'Untitled Rubric'}
            </h3>
            {rubric.courseName && (
              <p className="text-sm text-slate-500 truncate">{rubric.courseName}</p>
            )}
          </div>

          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <button
                    onClick={() => {
                      handleEdit();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onShare(rubric);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  {rubric.isPublic && rubric.shareId && (
                    <button
                      onClick={() => {
                        handleViewShared();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Shared
                    </button>
                  )}
                  <hr className="my-1 border-slate-200" />
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
            <Grid3X3 className="w-3 h-3" />
            {rubric.rubricType}
          </span>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
            {rubric.criteria.length} criteria
          </span>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
            {rubric.scale.length} levels
          </span>
          {rubric.isPublic && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
              <Share2 className="w-3 h-3" />
              Shared
            </span>
          )}
        </div>

        <div className="flex items-center text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          Updated {formatDate(rubric.updatedAt)}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 rounded-b-xl">
        <button
          onClick={handleEdit}
          disabled={isDeleting}
          className="w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
        >
          Open Rubric
        </button>
      </div>
    </div>
  );
}

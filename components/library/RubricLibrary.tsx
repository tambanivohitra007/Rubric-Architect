import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { RubricData, RubricType, LibraryFilters } from '../../types';
import { useRubric } from '../../hooks/useRubric';
import { RubricCard } from './RubricCard';
import { EmptyLibrary } from './EmptyLibrary';
import { ShareModal } from '../shared/ShareModal';

const RUBRIC_TYPES: (RubricType | 'all')[] = [
  'all',
  'Analytic',
  'Holistic',
  'SinglePoint',
  'Developmental',
  'Checklist',
  'CriterionReferenced',
  'NormReferenced',
  'TaskSpecific',
];

export function RubricLibrary() {
  const navigate = useNavigate();
  const { fetchUserRubrics, removeRubric, loading, error } = useRubric();

  const [rubrics, setRubrics] = useState<RubricData[]>([]);
  const [filters, setFilters] = useState<LibraryFilters>({
    searchQuery: '',
    rubricType: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [shareModalRubric, setShareModalRubric] = useState<RubricData | null>(null);

  useEffect(() => {
    loadRubrics();
  }, []);

  const loadRubrics = async () => {
    const data = await fetchUserRubrics();
    setRubrics(data);
  };

  const handleDelete = async (id: string) => {
    const success = await removeRubric(id);
    if (success) {
      setRubrics(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleShareUpdate = (rubricId: string, shareId: string | null, isPublic: boolean) => {
    setRubrics(prev =>
      prev.map(r =>
        r.id === rubricId
          ? { ...r, shareId: shareId || undefined, isPublic }
          : r
      )
    );
  };

  const filteredRubrics = useMemo(() => {
    let result = [...rubrics];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        r =>
          r.topic.toLowerCase().includes(query) ||
          r.courseName.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filters.rubricType !== 'all') {
      result = result.filter(r => r.rubricType === filters.rubricType);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'topic':
          comparison = a.topic.localeCompare(b.topic);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [rubrics, filters]);

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (loading && rubrics.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your rubrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Library</h1>
          <p className="text-slate-600">
            {rubrics.length} rubric{rubrics.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button
          onClick={() => navigate('/builder')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Rubric
        </button>
      </div>

      {rubrics.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rubrics..."
                  value={filters.searchQuery}
                  onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || filters.rubricType !== 'all'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={filters.sortBy}
                  onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="updatedAt">Last Modified</option>
                  <option value="createdAt">Date Created</option>
                  <option value="topic">Title</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {filters.sortOrder === 'asc' ? (
                    <SortAsc className="w-5 h-5 text-slate-600" />
                  ) : (
                    <SortDesc className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rubric Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {RUBRIC_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters(prev => ({ ...prev, rubricType: type }))}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filters.rubricType === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'all' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {filteredRubrics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No rubrics match your search criteria.</p>
              <button
                onClick={() => setFilters({ searchQuery: '', rubricType: 'all', sortBy: 'updatedAt', sortOrder: 'desc' })}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRubrics.map(rubric => (
                <RubricCard
                  key={rubric.id}
                  rubric={rubric}
                  onDelete={handleDelete}
                  onShare={setShareModalRubric}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Share Modal */}
      {shareModalRubric && shareModalRubric.id && (
        <ShareModal
          rubricId={shareModalRubric.id}
          shareId={shareModalRubric.shareId}
          isPublic={shareModalRubric.isPublic || false}
          onClose={() => setShareModalRubric(null)}
          onUpdate={(shareId, isPublic) => {
            if (shareModalRubric.id) {
              handleShareUpdate(shareModalRubric.id, shareId, isPublic);
            }
            setShareModalRubric(null);
          }}
        />
      )}
    </div>
  );
}

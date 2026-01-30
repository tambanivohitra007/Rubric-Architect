import React, { useState } from 'react';
import { X, Link2, Copy, Check, Globe, Lock, Loader2, ExternalLink } from 'lucide-react';
import { useRubric } from '../../hooks/useRubric';

interface Props {
  rubricId: string;
  shareId?: string;
  isPublic: boolean;
  onClose: () => void;
  onUpdate: (shareId: string | null, isPublic: boolean) => void;
}

export function ShareModal({ rubricId, shareId, isPublic, onClose, onUpdate }: Props) {
  const { toggleSharing, loading } = useRubric();
  const [copied, setCopied] = useState(false);
  const [localIsPublic, setLocalIsPublic] = useState(isPublic);
  const [localShareId, setLocalShareId] = useState(shareId);

  const shareUrl = localShareId
    ? `${window.location.origin}/shared/${localShareId}`
    : null;

  const handleToggleSharing = async () => {
    const newPublicState = !localIsPublic;

    if (newPublicState) {
      // Enable sharing
      const newShareId = await toggleSharing(rubricId, true);
      if (newShareId) {
        setLocalShareId(newShareId);
        setLocalIsPublic(true);
        onUpdate(newShareId, true);
      }
    } else {
      // Disable sharing
      await toggleSharing(rubricId, false);
      setLocalIsPublic(false);
      onUpdate(null, false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Share Rubric</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {localIsPublic ? (
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
              ) : (
                <div className="bg-slate-200 p-2 rounded-lg">
                  <Lock className="w-5 h-5 text-slate-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">
                  {localIsPublic ? 'Public Link' : 'Private'}
                </p>
                <p className="text-sm text-slate-600">
                  {localIsPublic
                    ? 'Anyone with the link can view'
                    : 'Only you can access this rubric'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSharing}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localIsPublic ? 'bg-purple-600' : 'bg-slate-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localIsPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Share Link */}
          {localIsPublic && shareUrl && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Share Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                  <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{shareUrl}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleOpenLink}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Anyone with this link will be able to view your rubric (read-only).
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { RubricData } from '../types';
import { Download, Printer, FileText, Check, ArrowLeft, Loader2, FileJson, Save, Share2 } from 'lucide-react';
import { useRubric } from '../hooks/useRubric';
import { useAuth } from '../hooks/useAuth';
import { ShareModal } from './shared/ShareModal';

interface Props {
  data: RubricData;
  updateData?: (data: Partial<RubricData>) => void;
  onBack: () => void;
  onSaveSuccess?: (savedId: string) => void;
}

const Step4Review: React.FC<Props> = ({ data, updateData, onBack, onSaveSuccess }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const { saveRubric } = useRubric();
  const { isAuthenticated } = useAuth();

  const handleSave = async () => {
    if (!isAuthenticated) {
      setSaveMessage({ type: 'error', text: 'Please sign in to save rubrics' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const savedId = await saveRubric(data);
      if (savedId) {
        setSaveMessage({ type: 'success', text: data.id ? 'Rubric updated!' : 'Rubric saved!' });
        if (onSaveSuccess) {
          onSaveSuccess(savedId);
        }
        if (updateData) {
          updateData({ id: savedId });
        }
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save rubric' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleJSONExport = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${data.topic.replace(/\s+/g, '_')}_rubric.json`;
    link.click();
  };

  const handleWordExport = () => {
    const element = document.getElementById('rubric-content');
    if (!element) return;

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
         "xmlns:w='urn:schemas-microsoft-com:office:word' "+
         "xmlns='http://www.w3.org/TR/REC-html40'>"+
         "<head><meta charset='utf-8'><title>Rubric Export</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + element.innerHTML + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${data.topic.replace(/\s+/g, '_')}_rubric.docx`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePDFExport = async () => {
    const element = document.getElementById('rubric-content');
    if (!element || typeof (window as any).html2pdf === 'undefined') {
        alert("PDF export library not ready. Please try Print -> Save as PDF.");
        return;
    }

    setIsExporting(true);
    const opt = {
      margin:       0.4,
      filename:     `${data.topic.replace(/\s+/g, '_')}_rubric.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    try {
        await (window as any).html2pdf().set(opt).from(element).save();
    } catch (e) {
        console.error("PDF Export failed", e);
    } finally {
        setIsExporting(false);
    }
  };

  const handleShareUpdate = (shareId: string | null, isPublic: boolean) => {
    if (updateData) {
      updateData({ shareId: shareId || undefined, isPublic });
    }
  };

  const isHolistic = data.rubricType === 'Holistic';

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

      {/* Toolbar */}
      <div className="no-print bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Top row: Back button and Save/Share */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to Editing</span>
            <span className="xs:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${
                saveMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {saveMessage.text}
              </span>
            )}

            {isAuthenticated && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isSaving ? 'Saving...' : (data.id ? 'Update' : 'Save')}</span>
                </button>

                {data.id && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      data.isPublic
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{data.isPublic ? 'Shared' : 'Share'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom row: Export buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 mr-1">Export:</span>

          <button
            onClick={handleJSONExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors text-xs sm:text-sm"
            title="Export raw data"
          >
            <FileJson className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            JSON
          </button>

          <button
            onClick={handleWordExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors text-xs sm:text-sm"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Word
          </button>

          <button
            onClick={handlePDFExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors text-xs sm:text-sm disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            PDF
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 font-medium transition-colors text-xs sm:text-sm"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Rubric Content */}
      <div id="rubric-content" className="rubric-container bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-0 print:p-0">
        {/* Header */}
        <div className="mb-6 sm:mb-8 border-b border-slate-100 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 sm:mb-2 break-words">{data.topic}</h1>
              <p className="text-base sm:text-lg text-slate-600">{data.courseName}</p>
            </div>
            <div className="bg-slate-100 px-2.5 sm:px-3 py-1 rounded text-xs sm:text-sm text-slate-600 font-medium uppercase tracking-wide self-start whitespace-nowrap">
              {data.rubricType}
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Learning Outcomes</h3>
            <ul className="space-y-1">
              {data.outcomes.map(o => (
                <li key={o.id} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                  <span className="break-words">{o.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rubric Table - Scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="p-2 sm:p-3 border-b-2 border-slate-800 w-1/5 font-bold text-slate-900 bg-white text-xs sm:text-sm">
                  {isHolistic ? 'Score' : 'Criteria'}
                </th>
                {isHolistic ? (
                  <th className="p-2 sm:p-3 border-b-2 border-slate-800 font-bold text-slate-900 bg-white text-xs sm:text-sm">Description</th>
                ) : (
                  data.scale.map((level, i) => (
                    <th key={i} className="p-2 sm:p-3 border-b-2 border-slate-800 font-bold text-slate-900 text-center bg-slate-50 text-xs sm:text-sm">
                      {level}
                      {data.rubricType !== 'Checklist' && (
                        <div className="text-[10px] sm:text-xs font-normal text-slate-500 mt-0.5 sm:mt-1">{(i + 1)} pts</div>
                      )}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {isHolistic ? (
                // Render transposed for Holistic
                data.rows[0]?.levels.map((level) => (
                  <tr key={level.id} className="break-inside-avoid">
                    <td className="p-2 sm:p-4 border-b border-slate-200 bg-slate-50 font-bold align-top text-xs sm:text-sm">
                      {level.title} ({level.score} pts)
                    </td>
                    <td className="p-2 sm:p-4 border-b border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white">
                      {level.description}
                    </td>
                  </tr>
                ))
              ) : (
                // Standard Grid
                data.rows.map((row) => {
                  const criterion = data.criteria.find(c => c.id === row.criterionId);
                  return (
                    <tr key={row.id} className="break-inside-avoid">
                      <td className="p-2 sm:p-4 border-b border-slate-200 bg-slate-50/50">
                        <div className="font-bold text-slate-800 text-xs sm:text-sm mb-0.5 sm:mb-1">{criterion?.title || 'Criterion'}</div>
                        <div className="text-[10px] sm:text-xs text-slate-500">{criterion?.description}</div>
                      </td>
                      {row.levels.map((level) => (
                        <td key={level.id} className="p-2 sm:p-4 border-b border-slate-200 border-l border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed align-top bg-white">
                          {level.description}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] sm:text-xs text-slate-400 italic">Created with RubricArchitect</p>
        </div>
      </div>

      {showShareModal && data.id && (
        <ShareModal
          rubricId={data.id}
          shareId={data.shareId}
          isPublic={data.isPublic || false}
          onClose={() => setShowShareModal(false)}
          onUpdate={handleShareUpdate}
        />
      )}
    </div>
  );
};

export default Step4Review;

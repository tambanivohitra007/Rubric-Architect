import React, { useState } from 'react';
import { RubricData } from '../types';
import { Download, Printer, FileText, Check, ArrowLeft, Loader2, FileJson } from 'lucide-react';

interface Props {
  data: RubricData;
  onBack: () => void;
}

const Step4Review: React.FC<Props> = ({ data, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);

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
    fileDownload.download = `${data.topic.replace(/\s+/g, '_')}_rubric.doc`;
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

  const isHolistic = data.rubricType === 'Holistic';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="no-print flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Editing
        </button>
        
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleJSONExport}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors text-sm"
            title="Export raw data"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          
          <button
            onClick={handleWordExport}
            className="flex items-center gap-2 px-3 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            Word
          </button>

          <button
            onClick={handlePDFExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md shadow-indigo-200 transition-colors text-sm disabled:opacity-70"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 font-medium transition-colors text-sm"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div id="rubric-content" className="rubric-container bg-white p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-0 print:p-0">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <div className="flex justify-between items-start">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{data.topic}</h1>
                <p className="text-lg text-slate-600">{data.courseName}</p>
             </div>
             <div className="bg-slate-100 px-3 py-1 rounded text-sm text-slate-600 font-medium uppercase tracking-wide">
               {data.rubricType} Rubric
             </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Learning Outcomes</h3>
            <ul className="space-y-1">
              {data.outcomes.map(o => (
                <li key={o.id} className="text-sm text-slate-700 flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {o.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 border-b-2 border-slate-800 w-1/5 font-bold text-slate-900 bg-white">
                {isHolistic ? 'Score' : 'Criteria'}
              </th>
              {isHolistic ? (
                <th className="p-3 border-b-2 border-slate-800 font-bold text-slate-900 bg-white">Description</th>
              ) : (
                data.scale.map((level, i) => (
                  <th key={i} className="p-3 border-b-2 border-slate-800 font-bold text-slate-900 text-center bg-slate-50">
                    {level}
                    {data.rubricType !== 'Checklist' && (
                        <div className="text-xs font-normal text-slate-500 mt-1">{(i + 1)} pts</div>
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
                     <td className="p-4 border-b border-slate-200 bg-slate-50 font-bold align-top">
                        {level.title} ({level.score} pts)
                     </td>
                     <td className="p-4 border-b border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white">
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
                    <td className="p-4 border-b border-slate-200 bg-slate-50/50">
                      <div className="font-bold text-slate-800 text-sm mb-1">{criterion?.title || 'Criterion'}</div>
                      <div className="text-xs text-slate-500">{criterion?.description}</div>
                    </td>
                    {row.levels.map((level) => (
                      <td key={level.id} className="p-4 border-b border-slate-200 border-l border-slate-100 text-sm text-slate-700 leading-relaxed align-top bg-white">
                        {level.description}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 italic">Created with RubricArchitect</p>
        </div>
      </div>
    </div>
  );
};

export default Step4Review;

import React, { useState } from 'react';
import { EstimateData, EstimateCalculationResult } from '../types/estimate';
import {
  Copy,
  Check,
  Send,
  Printer,
  BookmarkPlus,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface WhatsAppPreviewProps {
  data: EstimateData;
  calculationResult: EstimateCalculationResult;
  onBackToEdit: () => void;
  onSaveEstimate: () => void;
  onViewChecklist: () => void;
  isSaved?: boolean;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  data,
  calculationResult,
  onBackToEdit,
  onSaveEstimate,
  onViewChecklist,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(calculationResult.whatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = calculationResult.whatsAppText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getCleanWhatsAppPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const cleanPhone = getCleanWhatsAppPhone(data.phoneNumber);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(calculationResult.whatsAppText)}`
    : `https://wa.me/?text=${encodeURIComponent(calculationResult.whatsAppText)}`;

  const handlePrint = () => {
    window.print();
  };

  // Helper to format WhatsApp markdown into styled React nodes for the preview
  const renderFormattedWhatsAppText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (!line) {
        return <div key={idx} className="h-3" />;
      }

      // Check if line contains double line separator
      if (line.includes('══════════════════════')) {
        return (
          <div key={idx} className="text-slate-400 font-mono text-center tracking-wider text-xs select-none">
            ══════════════════════
          </div>
        );
      }

      // Format WhatsApp bolding *bold* and italic *(italic)*
      const parts = line.split(/(\*[^*]+\*|\_[^_]+\_)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          const content = part.slice(1, -1);
          return (
            <span key={pIdx} className="font-bold text-slate-900 bg-emerald-100/40 px-0.5 rounded">
              {content}
            </span>
          );
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          const content = part.slice(1, -1);
          return (
            <span key={pIdx} className="italic text-slate-700">
              {content}
            </span>
          );
        }
        return <span key={pIdx}>{part}</span>;
      });

      return (
        <div key={idx} className="leading-relaxed text-slate-800 break-words">
          {formattedLine}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Audit Alert */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Details</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit Checklist</span>
          </button>

          <button
            type="button"
            onClick={onSaveEstimate}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
              isSaved
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>{isSaved ? 'Saved' : 'Save Bill'}</span>
          </button>
        </div>
      </div>

      {calculationResult.validationWarnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Notice from Calculation Rules</span>
          </div>
          {calculationResult.validationWarnings.map((warn, i) => (
            <div key={i} className="pl-5 text-amber-800">
              • {warn}
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Chat Container Simulation */}
      <div className="bg-[#efeae2] rounded-3xl p-3 sm:p-5 border border-slate-300/80 shadow-md relative overflow-hidden">
        {/* WhatsApp App-like Header */}
        <div className="bg-[#005e54] text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-800/80 border border-white/20 flex items-center justify-center font-bold text-xs uppercase tracking-wide">
              PS
            </div>
            <div>
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Papersquare Publishing</span>
                <span className="text-[10px] text-emerald-200 font-normal">Official Estimate</span>
              </div>
              <div className="text-[10px] text-emerald-100/90 font-mono">
                {data.authorName ? `${data.authorName} · ` : ''}
                {data.phoneNumber || '+91 9072380587'}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-emerald-100 bg-white/10 px-2.5 py-1 rounded-md">
            {data.estimateNumber || 'EST-NV01'}
          </div>
        </div>

        {/* The Message Bubble */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/60 max-w-xl mx-auto font-mono text-xs sm:text-[13px] relative">
          <div className="space-y-0.5 selection:bg-emerald-100">
            {renderFormattedWhatsAppText(calculationResult.whatsAppText)}
          </div>

          <div className="flex items-center justify-end gap-1 mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
            <span>Ready to send</span>
            <span className="text-emerald-600 font-bold">✓✓</span>
          </div>
        </div>
      </div>

      {/* Raw Text Output Accordion / Direct Copy Area */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Raw WhatsApp Markdown Output</span>
          </span>
          <span className="text-[11px] text-slate-600 font-mono">
            {calculationResult.whatsAppText.length} characters
          </span>
        </div>
        <textarea
          readOnly
          value={calculationResult.whatsAppText}
          rows={6}
          className="w-full p-3 font-mono text-xs bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none resize-y selection:bg-emerald-200"
        />
      </div>

      {/* Fixed Sticky Action Bar at bottom */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              copied
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Bill'}</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all text-center"
          >
            <Send className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

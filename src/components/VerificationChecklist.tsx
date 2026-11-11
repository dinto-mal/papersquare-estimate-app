import React from 'react';
import { EstimateData, EstimateCalculationResult } from '../types/estimate';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface VerificationChecklistProps {
  data: EstimateData;
  calculationResult: EstimateCalculationResult;
  onBackToEdit: () => void;
  onViewWhatsApp: () => void;
}

export const VerificationChecklist: React.FC<VerificationChecklistProps> = ({
  data,
  calculationResult,
  onBackToEdit,
  onViewWhatsApp,
}) => {
  const { checklistStatus } = calculationResult;

  const checklistItems = [
    {
      id: 'estimateNo',
      label: 'Estimate number is correct',
      passed: checklistStatus.estimateNoValid,
      detail: data.estimateNumber ? `Value: ${data.estimateNumber}` : 'Missing estimate number',
    },
    {
      id: 'date',
      label: 'Date is correct (DD-MM-YYYY format)',
      passed: checklistStatus.dateValid,
      detail: data.date ? `Value: ${data.date}` : 'Invalid or missing date format',
    },
    {
      id: 'author',
      label: 'Author name and phone number are correct',
      passed: checklistStatus.authorValid && checklistStatus.phoneValid,
      detail: `${data.authorName || 'Missing author'} · ${data.phoneNumber || 'Missing phone'}`,
    },
    {
      id: 'book',
      label: 'Book title and language are correct',
      passed: checklistStatus.bookTitleValid && checklistStatus.languageValid,
      detail: `${data.bookTitle || 'Missing title'} · ${data.language || 'Language'}`,
    },
    {
      id: 'pages',
      label: 'Page count is confirmed',
      passed: checklistStatus.pagesValid,
      detail: data.totalPages ? `${data.totalPages} pages` : 'Zero or invalid page count',
    },
    {
      id: 'layout',
      label: 'Correct layout rate is used',
      passed: checklistStatus.layoutValid,
      detail: `${data.layoutType} layout: ₹${calculationResult.preProduction.layoutRatePerPage}/page`,
    },
    {
      id: 'coverDesign',
      label: 'Cover design is charged ₹1,000 (Fixed)',
      passed: checklistStatus.coverDesignValid,
      detail: 'Fixed rate card: ₹1,000',
    },
    {
      id: 'isbn',
      label: 'ISBN is charged ₹1,000 (Fixed)',
      passed: checklistStatus.isbnValid,
      detail: 'Fixed rate card: ₹1,000',
    },
    {
      id: 'proofreading',
      label: 'Proofreading is included only when requested',
      passed: checklistStatus.proofreadingValid,
      detail: data.proofreading
        ? `Requested: ${data.totalPages || 0} × ₹15 = ₹${calculationResult.preProduction.proofreadingTotal}`
        : 'Not requested: Omitted from breakdown & included line as required',
    },
    {
      id: 'includedServices',
      label: 'Included-services line lists only actual services',
      passed: true,
      detail: calculationResult.preProduction.includedServicesText,
    },
    {
      id: 'printingSlab',
      label: 'Correct printing slab is applied',
      passed: checklistStatus.printingSlabsValid,
      detail: calculationResult.productionOptions.map((o) => `${o.quantity} copies (${o.slabDescription})`).join(', '),
    },
    {
      id: 'printingCalc',
      label: 'Printing calculation is correct',
      passed: true,
      detail: calculationResult.productionOptions.map((o) => o.perCopyFormula).join(' | '),
    },
    {
      id: 'printingTotal',
      label: 'Printing total is correct',
      passed: true,
      detail: calculationResult.productionOptions.map((o) => `₹${o.printingTotal.toLocaleString('en-IN')}`).join(', '),
    },
    {
      id: 'preProdTotal',
      label: 'Pre-production total is correct',
      passed: true,
      detail: `Cover + Layout + ISBN${data.proofreading ? ' + Proofreading' : ''} = ₹${calculationResult.preProduction.preProductionTotal.toLocaleString('en-IN')}`,
    },
    {
      id: 'grandTotal',
      label: 'Grand total is correct (Pre-production + Printing)',
      passed: checklistStatus.arithmeticValid,
      detail: calculationResult.productionOptions.map((o) => `₹${o.grandTotal.toLocaleString('en-IN')}`).join(', '),
    },
    {
      id: 'perCopyRate',
      label: 'Per-copy rate is correct (Grand Total ÷ Copies, excluding delivery)',
      passed: true,
      detail: calculationResult.productionOptions.map((o) => `₹${o.perCopyRate.toFixed(2)}/copy`).join(', '),
    },
    {
      id: 'deliveryCharge',
      label: 'Delivery charge is addressed',
      passed: checklistStatus.deliveryHandled,
      detail: data.deliveryProvided
        ? `Provided: ₹${calculationResult.deliveryCharge.toLocaleString('en-IN')} added to payable total`
        : 'Not provided: "Delivery charge extra." displayed',
    },
    {
      id: 'whatsAppFormat',
      label: 'WhatsApp formatting is correct (*bold* & short separators)',
      passed: checklistStatus.whatsAppFormatted,
      detail: 'Double line ══════════════════════ and bold headings formatted',
    },
    {
      id: 'footer',
      label: 'Official Papersquare footer is present',
      passed: checklistStatus.footerCorrect,
      detail: 'Papersquare Self Publishing Co. Thrissur • Kottayam | +91 9072380587',
    },
  ];

  const totalPassed = checklistItems.filter((item) => item.passed).length;
  const allPassed = totalPassed === checklistItems.length;

  return (
    <div className="space-y-4 pb-24">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              allPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Pre-Flight Verification Checklist
            </h2>
            <div className="text-xs text-slate-500">
              Section 15 Master Workflow Compliance Audit
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
              allPassed ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {totalPassed} / {checklistItems.length} Passed
          </span>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs divide-y divide-slate-100">
        {checklistItems.map((item, idx) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {item.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {idx + 1}. {item.label}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium shrink-0 ${
                    item.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {item.passed ? 'PASS' : 'ACTION'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Back to Form
          </button>

          <button
            type="button"
            onClick={onViewWhatsApp}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition"
          >
            <span>Proceed to WhatsApp Bill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

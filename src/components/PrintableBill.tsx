import React from 'react';
import { EstimateData, EstimateCalculationResult } from '../types/estimate';
import { formatCurrency, RATE_CARD } from '../utils/calculator';
import { Printer, X } from 'lucide-react';

interface PrintableBillProps {
  data: EstimateData;
  calculationResult: EstimateCalculationResult;
  onClose?: () => void;
}

export const PrintableBill: React.FC<PrintableBillProps> = ({
  data,
  calculationResult,
  onClose,
}) => {
  const pages = typeof data.totalPages === 'number' ? data.totalPages : 0;
  const { preProduction, productionOptions, deliveryCharge, deliveryProvided } = calculationResult;

  return (
    <div className="bg-white p-6 sm:p-10 max-w-3xl mx-auto rounded-3xl border border-slate-200 shadow-xl font-sans text-slate-900 printable-document">
      {/* Top action controls (hidden in print) */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Official Quote / Estimate Preview
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save as PDF</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Official Header */}
      <div className="text-center pb-6 border-b-2 border-slate-900">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase font-display">
          PAPERSQUARE
        </h1>
        <p className="text-sm font-medium tracking-wide text-slate-600 uppercase mt-0.5">
          Self Publishing Co.
        </p>
        <div className="mt-4 py-1.5 px-6 inline-block bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-widest rounded-md">
          Official Estimate Bill
        </div>
      </div>

      {/* Meta Bar */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 font-mono text-xs">
        <div>
          <span className="text-slate-500">Estimate No:</span>{' '}
          <strong className="text-slate-900 font-bold">{data.estimateNumber || 'EST-NV01'}</strong>
        </div>
        <div className="text-right">
          <span className="text-slate-500">Date:</span>{' '}
          <strong className="text-slate-900 font-bold">{data.date}</strong>
        </div>
      </div>

      {/* Author & Book Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-slate-200 text-xs">
        <div className="space-y-1.5">
          <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
            Author Details
          </div>
          <div className="text-sm font-bold text-slate-900">{data.authorName || 'Not specified'}</div>
          <div className="font-mono text-slate-600">{data.phoneNumber || 'Phone not provided'}</div>
        </div>

        <div className="space-y-1.5">
          <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
            Book Details
          </div>
          <div className="text-sm font-bold text-slate-900">{data.bookTitle || 'Untitled'}</div>
          <div className="text-slate-600">
            Language: <span className="font-medium text-slate-900">{data.language}</span> ·{' '}
            Pages: <span className="font-mono font-medium text-slate-900">{pages}</span> ·{' '}
            Layout: <span className="font-medium text-slate-900">{data.layoutType}</span>
          </div>
        </div>
      </div>

      {/* Pre-production Cost Section */}
      <div className="py-5 border-b border-slate-200 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-slate-900 text-xs">
            Pre-Production Cost
          </span>
          <span className="font-mono text-slate-500">Official Rate Card</span>
        </div>

        <div className="space-y-2 font-mono">
          <div className="flex justify-between py-1">
            <span className="text-slate-700">Cover Design (Fixed)</span>
            <span className="font-semibold text-slate-900">{formatCurrency(preProduction.coverDesign)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-700">
              Inner-page Layout ({pages} × ₹{preProduction.layoutRatePerPage})
            </span>
            <span className="font-semibold text-slate-900">{formatCurrency(preProduction.layoutTotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-700">ISBN (Fixed)</span>
            <span className="font-semibold text-slate-900">{formatCurrency(preProduction.isbn)}</span>
          </div>
          {preProduction.proofreadingIncluded && (
            <div className="flex justify-between py-1 bg-amber-50/50 px-2 rounded">
              <span className="text-slate-700">
                Proofreading ({pages} × ₹{preProduction.proofreadingRatePerPage})
              </span>
              <span className="font-semibold text-slate-900">{formatCurrency(preProduction.proofreadingTotal)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold">
            <span>Pre-production Total</span>
            <span className="text-slate-900">{formatCurrency(preProduction.preProductionTotal)}</span>
          </div>
          <div className="text-[11px] italic text-slate-600 font-sans">
            {preProduction.includedServicesText}
          </div>
        </div>
      </div>

      {/* Production Options */}
      <div className="py-5 border-b border-slate-200 text-xs space-y-4">
        <div className="font-bold uppercase tracking-wider text-slate-900 text-xs">
          Production Options & Printing Calculation
        </div>

        <div className="space-y-3">
          {productionOptions.map((opt, idx) => (
            <div
              key={opt.quantity}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-2"
            >
              <div className="flex items-center justify-between font-sans border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900">
                  Option {idx + 1}: {opt.quantity} Copies
                </span>
                <span className="text-emerald-700 font-bold font-mono text-sm">
                  {formatCurrency(opt.grandTotal)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400">Calculation:</span>{' '}
                  <span className="font-semibold">{opt.perCopyFormula}</span>
                </div>
                <div>
                  <span className="text-slate-400">Printing Total:</span>{' '}
                  <span className="font-semibold">{formatCurrency(opt.printingTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Pre-production Total:</span>{' '}
                  <span className="font-semibold">{formatCurrency(opt.preProductionTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Per Copy Rate:</span>{' '}
                  <span className="font-bold text-emerald-800 font-mono">{formatCurrency(opt.perCopyRate, true)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Section */}
      <div className="py-4 border-b border-slate-200 text-xs font-mono">
        {deliveryProvided && deliveryCharge > 0 ? (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Delivery Charge:</span>
              <span className="font-bold text-slate-900">{formatCurrency(deliveryCharge)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-800 pt-1">
              <span>Payable Total (Option 1):</span>
              <span>{formatCurrency(productionOptions[0]?.grandTotal + deliveryCharge)}</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-600 italic">Delivery charge extra.</div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 text-center text-xs space-y-1">
        <div className="font-bold text-slate-900">{RATE_CARD.footer.company}</div>
        <div className="text-slate-600 font-mono">
          {RATE_CARD.footer.locations} | {RATE_CARD.footer.phone}
        </div>
        <div className="text-[10px] text-slate-400 pt-2">
          This estimate is generated in accordance with Papersquare Self Publishing Co. Master Workflow Instructions.
        </div>
      </div>
    </div>
  );
};

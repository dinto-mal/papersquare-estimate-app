import React, { useState } from 'react';
import {
  OFFICIAL_PRINTING_SLABS,
  RATE_CARD,
  formatCurrency,
  findPrintingSlab,
} from '../utils/calculator';
import {
  BookOpen,
  Calculator,
  Check,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

interface RateCardModalProps {
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const RateCardModal: React.FC<RateCardModalProps> = ({
  onClose,
  isStandaloneTab = false,
}) => {
  const [testPages, setTestPages] = useState<number>(100);
  const [testQty, setTestQty] = useState<number>(100);
  const [testLayout, setTestLayout] = useState<'Paragraph' | 'Poetry'>('Paragraph');
  const [testProofreading, setTestProofreading] = useState<boolean>(true);

  // Playground calculation
  const layoutRate = testLayout === 'Poetry' ? RATE_CARD.layoutPoetryPerPage : RATE_CARD.layoutParagraphPerPage;
  const layoutCost = testPages * layoutRate;
  const proofreadingCost = testProofreading ? testPages * RATE_CARD.proofreadingPerPage : 0;
  const preProdTotal = RATE_CARD.coverDesign + layoutCost + RATE_CARD.isbn + proofreadingCost;

  const slab = findPrintingSlab(testQty);
  const perCopyPrintingCost = slab ? (testPages * slab.perPageRate) + slab.baseCharge : 0;
  const printingTotal = perCopyPrintingCost * testQty;
  const grandTotal = preProdTotal + printingTotal;
  const perCopyRate = testQty > 0 ? grandTotal / testQty : 0;

  return (
    <div className={`space-y-5 ${isStandaloneTab ? 'pb-24' : ''}`}>
      {/* Header if modal */}
      {!isStandaloneTab && onClose && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-slate-900">
              Official Rate Card & Master Rules
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Intro Rule Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-amber-900">
          <Info className="w-4 h-4 text-amber-700" />
          <span>Papersquare Self Publishing Co. — Master Instruction</span>
        </div>
        <p className="leading-relaxed">
          "All calculations must follow the official rate card below. Never invent missing information or printing rates."
        </p>
      </div>

      {/* SECTION 3: Official Pre-production Rate Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900">
            3. Official Pre-Production Rate Card
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Fixed & Per-Page Rates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2 pr-4">Service</th>
                <th className="py-2 px-4 text-right">Official Rate</th>
                <th className="py-2 pl-4">Rule / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-slate-900">Cover Design</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹1,000 fixed</td>
                <td className="py-2.5 pl-4 font-sans text-slate-600">One cover design per book</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-slate-900">Inner-page Layout — Poetry</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹15 per page</td>
                <td className="py-2.5 pl-4 font-sans text-slate-600">Total pages × ₹15</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-slate-900">Inner-page Layout — Paragraph</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹20 per page</td>
                <td className="py-2.5 pl-4 font-sans text-slate-600">Total pages × ₹20</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-slate-900">ISBN Registration</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹1,000 fixed</td>
                <td className="py-2.5 pl-4 font-sans text-slate-600">Fixed official charge</td>
              </tr>
              <tr className="bg-amber-50/40">
                <td className="py-2.5 pr-4 font-sans font-medium text-slate-900">Proofreading</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹15 per page</td>
                <td className="py-2.5 pl-4 font-sans text-slate-600">
                  <strong>Only when requested.</strong> If No, omitted completely from bill.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="font-bold text-slate-800">Section 4 — Included Services Line Rule:</div>
          <p className="text-slate-600 italic">
            *Pre-production Total: ₹5,500*
            <br />
            *(Incl. Cover Design, Inner-page Layout, ISBN, Proofreading)*
          </p>
          <p className="text-[11px] text-slate-500">
            Rule: Use the abbreviation "Incl.", brackets, italic formatting. List only services actually included. No separate panel or box.
          </p>
        </div>
      </div>

      {/* SECTION 5: Official Production / Printing Rate Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900">
            5. Official Production / Printing Rate Card
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Quantity Slabs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2 pr-3">Quantity Slab</th>
                <th className="py-2 px-3">Per-Copy Formula</th>
                <th className="py-2 pl-3">Sample (100 pgs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {OFFICIAL_PRINTING_SLABS.map((slab) => {
                const sampleCost = (100 * slab.perPageRate) + slab.baseCharge;
                return (
                  <tr key={slab.name}>
                    <td className="py-2.5 pr-3 font-sans font-bold text-slate-900 whitespace-nowrap">
                      {slab.name}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {slab.formulaDisplay}
                    </td>
                    <td className="py-2.5 pl-3 text-emerald-700 font-medium whitespace-nowrap">
                      ₹{sampleCost}/copy
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quantity Warning Rule (Section 5) */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Important Quantity Rules</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-800">
            <li>1–10 copies use the 1–10 formula.</li>
            <li>50 copies use the 50-copy formula.</li>
            <li>100 and 150 copies use the 100–150 formula.</li>
            <li>200 and 250 copies use the 200–250 formula.</li>
            <li>300 copies use the 300-copy formula.</li>
            <li>
              <strong>Do not automatically apply a rate to quantities outside these ranges.</strong> For example, 350, 400 or 500 copies require confirmation of the production rate.
            </li>
            <li>Do not assume the 300-copy rate continues for larger quantities.</li>
          </ul>
        </div>
      </div>

      {/* Interactive Quick Rate Simulator */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Interactive Rate Card Calculator
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Live Simulator</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Pages</label>
            <input
              type="number"
              min="1"
              value={testPages}
              onChange={(e) => setTestPages(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Copies</label>
            <input
              type="number"
              min="1"
              value={testQty}
              onChange={(e) => setTestQty(Math.max(1, parseInt(e.target.value, 10) || 0))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Layout</label>
            <select
              value={testLayout}
              onChange={(e) => setTestLayout(e.target.value as 'Paragraph' | 'Poetry')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            >
              <option value="Paragraph">Paragraph (₹20)</option>
              <option value="Poetry">Poetry (₹15)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Proofreading</label>
            <select
              value={testProofreading ? 'yes' : 'no'}
              onChange={(e) => setTestProofreading(e.target.value === 'yes')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
            >
              <option value="yes">Yes (₹15/pg)</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Simulator Results */}
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <div className="text-[10px] text-slate-400 font-sans">Pre-production</div>
            <div className="font-bold text-white">{formatCurrency(preProdTotal)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-sans">Printing Total</div>
            <div className="font-bold text-white">
              {slab ? formatCurrency(printingTotal) : 'Rate Unverified'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-sans">Grand Total</div>
            <div className="font-bold text-amber-300">
              {slab ? formatCurrency(grandTotal) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-sans">Per-Copy Rate</div>
            <div className="font-bold text-emerald-400">
              {slab ? formatCurrency(perCopyRate, true) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

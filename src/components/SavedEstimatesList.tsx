import React, { useState } from 'react';
import { EstimateData } from '../types/estimate';
import {
  calculatePreProduction,
  calculateProductionOption,
  formatCurrency,
} from '../utils/calculator';
import {
  Search,
  BookOpen,
  Calendar,
  User,
  Trash2,
  Copy,
  ChevronRight,
  PlusCircle,
  FileText,
} from 'lucide-react';

interface SavedEstimatesListProps {
  estimates: EstimateData[];
  onSelectEstimate: (estimate: EstimateData) => void;
  onDeleteEstimate: (id: string) => void;
  onDuplicateEstimate: (estimate: EstimateData) => void;
  onCreateNew: () => void;
}

export const SavedEstimatesList: React.FC<SavedEstimatesListProps> = ({
  estimates,
  onSelectEstimate,
  onDeleteEstimate,
  onDuplicateEstimate,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = estimates.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.estimateNumber || '').toLowerCase().includes(q) ||
      (item.authorName || '').toLowerCase().includes(q) ||
      (item.bookTitle || '').toLowerCase().includes(q) ||
      (item.language || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Bar with Search & New */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search author, book, estimate #..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-white text-xs sm:text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">No Estimates Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No estimates matched your search criteria.'
              : 'You have not saved any estimate bills yet. Create one or load a worked example!'}
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Create First Estimate
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const pages = typeof item.totalPages === 'number' ? item.totalPages : 0;
            const preProd = calculatePreProduction(pages, item.layoutType, item.proofreading);
            const firstQty = item.quantities[0] || 100;
            const opt = calculateProductionOption(firstQty, pages, preProd.preProductionTotal, 0);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => onSelectEstimate(item)}
                    className="flex-1 cursor-pointer min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800">
                        {item.estimateNumber || 'EST-NV01'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{item.date}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
                      {item.bookTitle || 'Untitled Book'}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span>{item.authorName || 'Author'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pages} pgs ({item.layoutType})</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.quantities.join(', ')} copies</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400 font-sans">Grand Total</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {formatCurrency(opt.grandTotal)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-slate-500 italic">
                    {preProd.includedServicesText}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicateEstimate(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="Duplicate as new estimate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEstimate(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete estimate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectEstimate(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  EstimateData,
  LayoutType,
  EstimateCalculationResult,
} from '../types/estimate';
import {
  OFFICIAL_PRINTING_SLABS,
  STANDARD_QUANTITY_OPTIONS,
  formatCurrency,
  findPrintingSlab,
  WORKED_EXAMPLES,
  generateEstimateNumber,
  getTodayDateString,
} from '../utils/calculator';
import {
  BookOpen,
  User,
  Phone,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Truck,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  BookMarked,
  HelpCircle,
} from 'lucide-react';

interface EstimateFormProps {
  data: EstimateData;
  onChange: (data: EstimateData) => void;
  calculationResult: EstimateCalculationResult;
  onViewWhatsApp: () => void;
  onReset: () => void;
  onLoadExample: (exampleData: EstimateData) => void;
  onOpenRateCard: () => void;
}

export const EstimateForm: React.FC<EstimateFormProps> = ({
  data,
  onChange,
  calculationResult,
  onViewWhatsApp,
  onReset,
  onLoadExample,
  onOpenRateCard,
}) => {
  const [customQtyInput, setCustomQtyInput] = useState<string>('');
  const [showExamplePicker, setShowExamplePicker] = useState<boolean>(false);

  const updateField = <K extends keyof EstimateData>(field: K, value: EstimateData[K]) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handlePageChange = (val: string) => {
    if (val === '') {
      updateField('totalPages', '');
    } else {
      const num = parseInt(val, 10);
      updateField('totalPages', isNaN(num) ? '' : Math.max(0, num));
    }
  };

  const handleDeliveryAmountChange = (val: string) => {
    if (val === '') {
      updateField('deliveryCharge', '');
    } else {
      const num = parseFloat(val);
      updateField('deliveryCharge', isNaN(num) ? '' : Math.max(0, num));
    }
  };

  const toggleQuantity = (qty: number) => {
    const current = [...data.quantities];
    const index = current.indexOf(qty);
    if (index >= 0) {
      if (current.length > 1) {
        current.splice(index, 1);
        updateField('quantities', current);
      }
    } else {
      current.push(qty);
      current.sort((a, b) => a - b);
      updateField('quantities', current);
    }
  };

  const addCustomQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(customQtyInput.trim(), 10);
    if (!isNaN(qty) && qty > 0) {
      if (!data.quantities.includes(qty)) {
        const next = [...data.quantities, qty].sort((a, b) => a - b);
        updateField('quantities', next);
      }
      setCustomQtyInput('');
    }
  };

  const removeQuantity = (qty: number) => {
    if (data.quantities.length > 1) {
      updateField('quantities', data.quantities.filter((q) => q !== qty));
    }
  };

  const pages = typeof data.totalPages === 'number' ? data.totalPages : 0;

  return (
    <div className="space-y-5 pb-24">
      {/* Top Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs">
          <button
            type="button"
            onClick={() => setShowExamplePicker(!showExamplePicker)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors shrink-0"
          >
            <BookMarked className="w-3.5 h-3.5 text-slate-600" />
            <span>Load Example ({WORKED_EXAMPLES.length})</span>
          </button>
          <button
            type="button"
            onClick={onOpenRateCard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-medium transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Official Rates</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg transition-colors shrink-0"
          title="Clear form and generate new estimate ID"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Blank</span>
        </button>
      </div>

      {/* Example Picker Dropdown if open */}
      {showExamplePicker && (
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 bg-amber-50/30 shadow-sm space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Official Master Instructions Examples</span>
            <button
              onClick={() => setShowExamplePicker(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WORKED_EXAMPLES.map((ex) => (
              <button
                key={ex.data.id}
                type="button"
                onClick={() => {
                  onLoadExample(ex.data);
                  setShowExamplePicker(false);
                }}
                className="text-left p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                  {ex.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {ex.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: Estimate & Date Identification */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
              1
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Estimate Information
            </h2>
          </div>
          <span className="text-[11px] text-slate-600 font-mono">DD-MM-YYYY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimate Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.estimateNumber}
                onChange={(e) => updateField('estimateNumber', e.target.value)}
                placeholder="e.g. EST-NV01"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => updateField('estimateNumber', generateEstimateNumber())}
                className="absolute right-2 top-2 px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition"
                title="Generate fresh ID"
              >
                Auto
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Never invent; keep user-specified number as per rule 8.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date (DD-MM-YYYY) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.date}
                onChange={(e) => updateField('date', e.target.value)}
                placeholder="11-11-2026"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => updateField('date', getTodayDateString())}
                className="absolute right-2 top-2 px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition"
              >
                Today
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Strict DD-MM-YYYY format required by Papersquare.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Author Details */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
            2
          </span>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Author Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Author Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={data.authorName}
                onChange={(e) => updateField('authorName', e.target.value)}
                placeholder="e.g. Luke Thomas / Rajalaksdhmi"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number (WhatsApp)
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={data.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                placeholder="e.g. +91 99861 73132"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Used for 1-tap WhatsApp direct messaging.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Book Details & Pre-Production */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
            3
          </span>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Book Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={data.bookTitle}
                onChange={(e) => updateField('bookTitle', e.target.value)}
                placeholder="e.g. Pallamma / Untitled stories"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Language <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.language}
              onChange={(e) => updateField('language', e.target.value)}
              placeholder="Malayalam"
              className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {['Malayalam', 'English', 'Tamil', 'Hindi'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => updateField('language', lang)}
                  className={`px-2 py-0.5 text-[11px] rounded transition ${
                    data.language === lang
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Pages <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={data.totalPages}
                onChange={(e) => handlePageChange(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
              <div className="flex gap-1">
                {[80, 100, 150].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateField('totalPages', p)}
                    className="px-2.5 py-2 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    {p}p
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Type Selection: Paragraph vs Poetry */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Inner-page Layout Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField('layoutType', 'Paragraph')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.layoutType === 'Paragraph'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Paragraph</span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    data.layoutType === 'Paragraph'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  ₹20 / page
                </span>
              </div>
              <p
                className={`text-xs mt-1.5 ${
                  data.layoutType === 'Paragraph' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Stories, novels, essays, general prose
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateField('layoutType', 'Poetry')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.layoutType === 'Poetry'
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Poetry</span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    data.layoutType === 'Poetry'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  ₹15 / page
                </span>
              </div>
              <p
                className={`text-xs mt-1.5 ${
                  data.layoutType === 'Poetry' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Poems, anthologies, verse formats
              </p>
            </button>
          </div>
        </div>

        {/* Proofreading Toggle (Section 3: D) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Proofreading Service</span>
                <span className="text-xs font-mono text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                  ₹15 / page
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {data.proofreading
                  ? 'Included: total pages × ₹15 will appear in Pre-production breakdown & included line.'
                  : 'Rule: If not requested, proofreading is omitted completely from breakdown and included line.'}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => updateField('proofreading', false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  !data.proofreading
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => updateField('proofreading', true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  data.proofreading
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yes
              </button>
            </div>
          </div>
        </div>

        {/* Pre-production Live Calculation Callout */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span>Pre-production Total (Fixed + Layout + ISBN{data.proofreading ? ' + Proofreading' : ''})</span>
            <span className="font-mono text-amber-300 font-bold text-sm">
              {formatCurrency(calculationResult.preProduction.preProductionTotal)}
            </span>
          </div>
          <div className="text-[12px] italic text-slate-300">
            {calculationResult.preProduction.includedServicesText}
          </div>
        </div>
      </section>

      {/* SECTION 4: Printing Quantities & Slabs */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
              4
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Printing Quantities Required
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Multiple options supported</span>
        </div>

        <p className="text-xs text-slate-600">
          Select one or more copy quantities to calculate quantity-wise production options (Option 1, Option 2, etc.):
        </p>

        {/* Standard Slabs Quick Chips */}
        <div className="flex flex-wrap gap-2">
          {STANDARD_QUANTITY_OPTIONS.map((qty) => {
            const isSelected = data.quantities.includes(qty);
            const slab = findPrintingSlab(qty);
            return (
              <button
                key={qty}
                type="button"
                onClick={() => toggleQuantity(qty)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{qty} Copies</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Custom Quantity Input with strict slab warning */}
        <form onSubmit={addCustomQuantity} className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Add Another Quantity
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={customQtyInput}
              onChange={(e) => setCustomQtyInput(e.target.value)}
              placeholder="e.g. 5, 10, 150, 250, 300"
              className="flex-1 px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={!customQtyInput}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Selected Quantities List Breakdown */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-700">
            Selected Options for Bill ({data.quantities.length}):
          </div>
          {calculationResult.productionOptions.map((opt, idx) => (
            <div
              key={opt.quantity}
              className={`p-3 rounded-xl border transition ${
                opt.isValidSlab
                  ? 'bg-slate-50/70 border-slate-200/90'
                  : 'bg-amber-50/80 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Option {idx + 1}: {opt.quantity} Copies
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {opt.slabDescription}
                  </span>
                </div>
                {data.quantities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuantity(opt.quantity)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Remove this option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-2 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Formula</div>
                  <div className="text-slate-800 text-[11px] truncate" title={opt.perCopyFormula}>
                    {opt.perCopyFormula}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Printing Total</div>
                  <div className="text-slate-900 font-semibold">{formatCurrency(opt.printingTotal)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Grand Total</div>
                  <div className="text-slate-900 font-bold">{formatCurrency(opt.grandTotal)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Per Copy Rate</div>
                  <div className="text-emerald-700 font-bold">{formatCurrency(opt.perCopyRate, true)}</div>
                </div>
              </div>

              {!opt.isValidSlab && (
                <div className="mt-2 text-xs text-amber-800 flex items-start gap-1.5 bg-amber-100/60 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{opt.warning}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Delivery Charge (Rule 7) */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white text-xs font-bold font-mono">
              5
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Delivery Charge
            </h2>
          </div>
          <Truck className="w-4 h-4 text-slate-400" />
        </div>

        <p className="text-xs text-slate-600">
          Rule 7: Never invent a delivery amount. If customer did not provide amount, show "Delivery charge extra."
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              updateField('deliveryProvided', false);
              updateField('deliveryCharge', '');
            }}
            className={`p-3 rounded-xl border text-left transition ${
              !data.deliveryProvided
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="font-bold text-xs">Not Provided</div>
            <div className={`text-[11px] mt-1 ${!data.deliveryProvided ? 'text-slate-300' : 'text-slate-500'}`}>
              Shows "Delivery charge extra."
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField('deliveryProvided', true)}
            className={`p-3 rounded-xl border text-left transition ${
              data.deliveryProvided
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="font-bold text-xs">Provided by Customer</div>
            <div className={`text-[11px] mt-1 ${data.deliveryProvided ? 'text-slate-300' : 'text-slate-500'}`}>
              Include amount in bill & payable total
            </div>
          </button>
        </div>

        {data.deliveryProvided && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Delivery Charge Amount (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-mono text-slate-500">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={data.deliveryCharge ?? ''}
                onChange={(e) => handleDeliveryAmountChange(e.target.value)}
                placeholder="e.g. 350"
                className="w-full pl-8 pr-3.5 py-2.5 text-sm font-mono font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Per-copy rate continues to exclude delivery unless specifically requested.
            </p>
          </div>
        )}
      </section>

      {/* Floating Bottom Action Thumb Strip */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 truncate">
              {data.bookTitle || 'Book'} · {data.quantities.join(', ')} copies
            </div>
            <div className="text-base font-bold text-slate-900 font-mono tracking-tight">
              {calculationResult.productionOptions[0]
                ? formatCurrency(calculationResult.productionOptions[0].grandTotal)
                : '₹0'}
              {calculationResult.productionOptions.length > 1 && (
                <span className="text-xs text-slate-500 font-normal font-sans ml-1">
                  (Opt 1 of {calculationResult.productionOptions.length})
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onViewWhatsApp}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate WhatsApp Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

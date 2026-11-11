import React, { useState, useEffect } from 'react';
import { EstimateData } from './types/estimate';
import {
  calculateFullEstimate,
  generateEstimateNumber,
  getTodayDateString,
  WORKED_EXAMPLES,
} from './utils/calculator';
import { EstimateForm } from './components/EstimateForm';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import { VerificationChecklist } from './components/VerificationChecklist';
import { RateCardModal } from './components/RateCardModal';
import { SavedEstimatesList } from './components/SavedEstimatesList';
import { PrintableBill } from './components/PrintableBill';
import {
  FileText,
  MessageSquare,
  ShieldCheck,
  BookOpen,
  History,
  Printer,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY_CURRENT = 'papersquare_current_estimate_v1';
const STORAGE_KEY_HISTORY = 'papersquare_saved_estimates_v1';

export default function App() {
  // Initialize with Latest Customer Example from Section 14
  const [estimateData, setEstimateData] = useState<EstimateData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return WORKED_EXAMPLES[3].data; // EST-NV01 Luke Thomas
  });

  const [savedList, setSavedList] = useState<EstimateData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Seed with all worked examples so user has instant test data
    return WORKED_EXAMPLES.map((ex) => ex.data);
  });

  type ActiveTab = 'form' | 'whatsapp' | 'checklist' | 'rates' | 'history';
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [showRateModal, setShowRateModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // Sync current draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(estimateData));
    } catch {
      // ignore
    }
  }, [estimateData]);

  // Sync saved list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(savedList));
    } catch {
      // ignore
    }
  }, [savedList]);

  // Full Calculation Engine
  const calculationResult = calculateFullEstimate(estimateData);

  const handleReset = () => {
    const blank: EstimateData = {
      id: `est-${Date.now()}`,
      estimateNumber: generateEstimateNumber(),
      date: getTodayDateString(),
      authorName: '',
      phoneNumber: '',
      bookTitle: '',
      language: 'Malayalam',
      totalPages: 100,
      layoutType: 'Paragraph',
      proofreading: false,
      quantities: [100, 200],
      deliveryCharge: null,
      deliveryProvided: false,
      createdAt: Date.now(),
    };
    setEstimateData(blank);
    setActiveTab('form');
  };

  const handleLoadExample = (exampleData: EstimateData) => {
    setEstimateData({
      ...exampleData,
      id: `est-${Date.now()}`,
    });
    setActiveTab('form');
  };

  const handleSaveCurrentEstimate = () => {
    const existingIndex = savedList.findIndex((item) => item.id === estimateData.id);
    let updated: EstimateData[];
    if (existingIndex >= 0) {
      updated = [...savedList];
      updated[existingIndex] = { ...estimateData };
    } else {
      updated = [{ ...estimateData, createdAt: Date.now() }, ...savedList];
    }
    setSavedList(updated);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const handleDeleteSavedEstimate = (id: string) => {
    setSavedList(savedList.filter((item) => item.id !== id));
  };

  const handleDuplicateSavedEstimate = (item: EstimateData) => {
    const duplicated: EstimateData = {
      ...item,
      id: `est-${Date.now()}`,
      estimateNumber: generateEstimateNumber(),
      createdAt: Date.now(),
    };
    setEstimateData(duplicated);
    setSavedList([duplicated, ...savedList]);
    setActiveTab('form');
  };

  const handleSelectSavedEstimate = (item: EstimateData) => {
    setEstimateData({ ...item });
    setActiveTab('form');
  };

  const allPassed =
    calculationResult.checklistStatus.authorValid &&
    calculationResult.checklistStatus.bookTitleValid &&
    calculationResult.checklistStatus.pagesValid &&
    calculationResult.checklistStatus.printingSlabsValid;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark & Tag */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              PS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900 font-display">
                  PAPERSQUARE
                </h1>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  ESTIMATE BILL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Self Publishing Co. · Official Calculator
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="Print official invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowRateModal(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Rate Card</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Content Canvas */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-5">
        {activeTab === 'form' && (
          <EstimateForm
            data={estimateData}
            onChange={setEstimateData}
            calculationResult={calculationResult}
            onViewWhatsApp={() => setActiveTab('whatsapp')}
            onReset={handleReset}
            onLoadExample={handleLoadExample}
            onOpenRateCard={() => setShowRateModal(true)}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppPreview
            data={estimateData}
            calculationResult={calculationResult}
            onBackToEdit={() => setActiveTab('form')}
            onSaveEstimate={handleSaveCurrentEstimate}
            onViewChecklist={() => setActiveTab('checklist')}
            isSaved={isSavedFeedback}
          />
        )}

        {activeTab === 'checklist' && (
          <VerificationChecklist
            data={estimateData}
            calculationResult={calculationResult}
            onBackToEdit={() => setActiveTab('form')}
            onViewWhatsApp={() => setActiveTab('whatsapp')}
          />
        )}

        {activeTab === 'rates' && <RateCardModal isStandaloneTab={true} />}

        {activeTab === 'history' && (
          <SavedEstimatesList
            estimates={savedList}
            onSelectEstimate={handleSelectSavedEstimate}
            onDeleteEstimate={handleDeleteSavedEstimate}
            onDuplicateEstimate={handleDuplicateSavedEstimate}
            onCreateNew={handleReset}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Navigation (Mobile Thumb Zone Pattern) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-md">
        <div className="max-w-2xl mx-auto grid grid-cols-5 h-16 items-center px-1">
          {/* Tab 1: Form */}
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'form' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeTab === 'form' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-1 font-medium">Estimate</span>
          </button>

          {/* Tab 2: WhatsApp */}
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
              activeTab === 'whatsapp' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare
              className={`w-5 h-5 ${activeTab === 'whatsapp' ? 'stroke-[2.5] text-emerald-600' : 'stroke-[1.75]'}`}
            />
            <span className="text-[10px] mt-1 font-medium">WhatsApp</span>
            {allPassed && activeTab !== 'whatsapp' && (
              <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Tab 3: Verification Checklist */}
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
              activeTab === 'checklist' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShieldCheck
              className={`w-5 h-5 ${activeTab === 'checklist' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
            />
            <span className="text-[10px] mt-1 font-medium">Checklist</span>
            {!allPassed && (
              <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          {/* Tab 4: Official Rates */}
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'rates' ? 'text-amber-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen
              className={`w-5 h-5 ${activeTab === 'rates' ? 'stroke-[2.5] text-amber-800' : 'stroke-[1.75]'}`}
            />
            <span className="text-[10px] mt-1 font-medium">Rate Card</span>
          </button>

          {/* Tab 5: Saved History */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'history' ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] mt-1 font-medium">History</span>
          </button>
        </div>
      </nav>

      {/* Official Rate Card Popup Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl">
            <RateCardModal onClose={() => setShowRateModal(false)} />
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl my-auto">
            <PrintableBill
              data={estimateData}
              calculationResult={calculationResult}
              onClose={() => setShowPrintModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

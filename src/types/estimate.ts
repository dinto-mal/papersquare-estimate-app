export type LayoutType = 'Paragraph' | 'Poetry';

export interface ProductionOptionCalculation {
  quantity: number;
  perPageRate: number;
  baseCharge: number;
  perCopyFormula: string;
  perCopyPrintingCost: number;
  printingTotal: number;
  preProductionTotal: number;
  grandTotal: number;
  perCopyRate: number;
  isValidSlab: boolean;
  slabDescription: string;
  warning?: string;
  payableWithDelivery?: number;
}

export interface EstimateData {
  id: string;
  estimateNumber: string;
  date: string; // DD-MM-YYYY
  authorName: string;
  phoneNumber: string;
  bookTitle: string;
  language: string;
  totalPages: number | '';
  layoutType: LayoutType;
  proofreading: boolean;
  quantities: number[];
  deliveryCharge: number | '' | null; // null or empty string means not provided
  deliveryProvided: boolean;
  notes?: string;
  createdAt: number;
}

export interface PreProductionBreakdown {
  coverDesign: number;
  layoutRatePerPage: number;
  layoutTotal: number;
  isbn: number;
  proofreadingIncluded: boolean;
  proofreadingRatePerPage: number;
  proofreadingTotal: number;
  preProductionTotal: number;
  includedServicesText: string;
}

export interface EstimateCalculationResult {
  preProduction: PreProductionBreakdown;
  productionOptions: ProductionOptionCalculation[];
  deliveryProvided: boolean;
  deliveryCharge: number;
  whatsAppText: string;
  validationErrors: string[];
  validationWarnings: string[];
  checklistStatus: {
    estimateNoValid: boolean;
    dateValid: boolean;
    authorValid: boolean;
    phoneValid: boolean;
    bookTitleValid: boolean;
    languageValid: boolean;
    pagesValid: boolean;
    layoutValid: boolean;
    coverDesignValid: boolean;
    isbnValid: boolean;
    proofreadingValid: boolean;
    printingSlabsValid: boolean;
    arithmeticValid: boolean;
    deliveryHandled: boolean;
    whatsAppFormatted: boolean;
    footerCorrect: boolean;
  };
}

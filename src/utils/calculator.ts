import {
  EstimateData,
  EstimateCalculationResult,
  PreProductionBreakdown,
  ProductionOptionCalculation,
  LayoutType,
} from '../types/estimate';

export const RATE_CARD = {
  coverDesign: 1000,
  isbn: 1000,
  layoutParagraphPerPage: 20,
  layoutPoetryPerPage: 15,
  proofreadingPerPage: 15,
  footer: {
    company: 'Papersquare Self Publishing Co.',
    locations: 'Thrissur • Kottayam',
    phone: '+91 9072380587',
  },
};

export interface PrintingSlabInfo {
  minQty: number;
  maxQty: number;
  perPageRate: number;
  baseCharge: number;
  formulaDisplay: string;
  name: string;
}

export const OFFICIAL_PRINTING_SLABS: PrintingSlabInfo[] = [
  { minQty: 1, maxQty: 10, perPageRate: 0.50, baseCharge: 160, formulaDisplay: '(Pages × ₹0.50) + ₹160', name: '1–10 copies' },
  { minQty: 50, maxQty: 50, perPageRate: 0.65, baseCharge: 30, formulaDisplay: '(Pages × ₹0.65) + ₹30', name: '50 copies' },
  { minQty: 100, maxQty: 150, perPageRate: 0.60, baseCharge: 17, formulaDisplay: '(Pages × ₹0.60) + ₹17', name: '100–150 copies' },
  { minQty: 200, maxQty: 250, perPageRate: 0.50, baseCharge: 13, formulaDisplay: '(Pages × ₹0.50) + ₹13', name: '200–250 copies' },
  { minQty: 300, maxQty: 300, perPageRate: 0.45, baseCharge: 8, formulaDisplay: '(Pages × ₹0.45) + ₹8', name: '300 copies' },
];

export const STANDARD_QUANTITY_OPTIONS = [50, 100, 150, 200, 250, 300];

export function formatCurrency(amount: number, showDecimalsIfZero = false): string {
  if (isNaN(amount)) return '₹0';
  const hasDecimals = amount % 1 !== 0;
  if (hasDecimals || showDecimalsIfZero) {
    return '₹' + amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatRateDecimal(rate: number): string {
  return rate.toFixed(2);
}

export function getTodayDateString(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

export function generateEstimateNumber(): string {
  const now = new Date();
  const monthNames = ['JA', 'FB', 'MR', 'AP', 'MY', 'JN', 'JL', 'AU', 'SE', 'OC', 'NV', 'DC'];
  const monthCode = monthNames[now.getMonth()];
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `EST-${monthCode}${randomSuffix}`;
}

export function findPrintingSlab(quantity: number): PrintingSlabInfo | null {
  for (const slab of OFFICIAL_PRINTING_SLABS) {
    if (quantity >= slab.minQty && quantity <= slab.maxQty) {
      return slab;
    }
  }
  return null;
}

export function calculatePreProduction(
  totalPages: number,
  layoutType: LayoutType,
  proofreading: boolean
): PreProductionBreakdown {
  const coverDesign = RATE_CARD.coverDesign;
  const isbn = RATE_CARD.isbn;
  const layoutRatePerPage = layoutType === 'Poetry' 
    ? RATE_CARD.layoutPoetryPerPage 
    : RATE_CARD.layoutParagraphPerPage;
  const layoutTotal = (totalPages || 0) * layoutRatePerPage;

  const proofreadingIncluded = proofreading;
  const proofreadingRatePerPage = RATE_CARD.proofreadingPerPage;
  const proofreadingTotal = proofreadingIncluded ? (totalPages || 0) * proofreadingRatePerPage : 0;

  const preProductionTotal = coverDesign + layoutTotal + isbn + proofreadingTotal;

  const services = ['Cover Design', 'Inner-page Layout', 'ISBN'];
  if (proofreadingIncluded) {
    services.push('Proofreading');
  }
  const includedServicesText = `*(Incl. ${services.join(', ')})*`;

  return {
    coverDesign,
    layoutRatePerPage,
    layoutTotal,
    isbn,
    proofreadingIncluded,
    proofreadingRatePerPage,
    proofreadingTotal,
    preProductionTotal,
    includedServicesText,
  };
}

export function calculateProductionOption(
  quantity: number,
  totalPages: number,
  preProductionTotal: number,
  deliveryCharge: number
): ProductionOptionCalculation {
  const slab = findPrintingSlab(quantity);
  const isValidSlab = slab !== null;

  let perPageRate = 0;
  let baseCharge = 0;
  let slabDescription = '';
  let warning: string | undefined;

  if (slab) {
    perPageRate = slab.perPageRate;
    baseCharge = slab.baseCharge;
    slabDescription = slab.name;
  } else {
    warning = `Quantity ${quantity} is outside official slabs (1–10, 50, 100–150, 200–250, 300). Rate confirmation required.`;
    slabDescription = 'Unverified Quantity Slab';
  }

  // Formula: Per copy = (Pages × perPageRate) + baseCharge
  const perCopyPrintingCost = isValidSlab ? (totalPages * perPageRate) + baseCharge : 0;
  const printingTotal = perCopyPrintingCost * quantity;
  const grandTotal = preProductionTotal + printingTotal;
  const perCopyRate = quantity > 0 ? grandTotal / quantity : 0;
  const payableWithDelivery = deliveryCharge > 0 ? grandTotal + deliveryCharge : grandTotal;

  const perCopyFormula = isValidSlab
    ? `(${totalPages} × ₹${formatRateDecimal(perPageRate)} + ₹${baseCharge}) × ${quantity}`
    : `(Custom rate confirmation required for ${quantity} copies)`;

  return {
    quantity,
    perPageRate,
    baseCharge,
    perCopyFormula,
    perCopyPrintingCost,
    printingTotal,
    preProductionTotal,
    grandTotal,
    perCopyRate,
    isValidSlab,
    slabDescription,
    warning,
    payableWithDelivery,
  };
}

export function generateWhatsAppBill(
  data: EstimateData,
  preProduction: PreProductionBreakdown,
  productionOptions: ProductionOptionCalculation[],
  deliveryChargeNum: number
): string {
  const pages = typeof data.totalPages === 'number' ? data.totalPages : 0;
  const lines: string[] = [];

  // Header
  lines.push('PAPERSQUARE');
  lines.push('Self Publishing Co.');
  lines.push('');
  lines.push('══════════════════════');
  lines.push('      *ESTIMATE BILL*');
  lines.push('══════════════════════');
  lines.push('');
  lines.push(`*Estimate No:* ${data.estimateNumber || 'EST-NV01'}`);
  lines.push(`*Date:* ${data.date || getTodayDateString()}`);
  lines.push('');
  lines.push('*AUTHOR DETAILS*');
  lines.push(`Name: ${data.authorName || 'Not specified'}`);
  lines.push(`PH: ${data.phoneNumber || 'Not specified'}`);
  lines.push('');
  lines.push('*BOOK DETAILS*');
  lines.push(`Book: ${data.bookTitle || 'Untitled'}`);
  lines.push(`Language: ${data.language || 'Malayalam'}`);
  lines.push(`Pages: ${pages}`);
  lines.push(`Layout: ${data.layoutType}`);
  lines.push('');
  lines.push('*PRE-PRODUCTION COST*');
  lines.push(`Cover Design (Fixed) ${formatCurrency(preProduction.coverDesign)}`);
  lines.push(`Inner-page Layout (${pages} × ₹${preProduction.layoutRatePerPage}) ${formatCurrency(preProduction.layoutTotal)}`);
  lines.push(`ISBN (Fixed) ${formatCurrency(preProduction.isbn)}`);

  if (preProduction.proofreadingIncluded) {
    lines.push(`Proofreading (${pages} × ₹${preProduction.proofreadingRatePerPage}) ${formatCurrency(preProduction.proofreadingTotal)}`);
  }

  lines.push('');
  lines.push(`*Pre-production Total: ${formatCurrency(preProduction.preProductionTotal)}*`);
  lines.push(preProduction.includedServicesText);

  // Production options
  productionOptions.forEach((opt, idx) => {
    lines.push('');
    lines.push(`*PRODUCTION — OPTION ${idx + 1}*`);
    lines.push(`Quantity: ${opt.quantity} Copies`);
    lines.push(`Calculation: ${opt.perCopyFormula}`);
    lines.push(`Printing Total: ${formatCurrency(opt.printingTotal)}`);
    lines.push(`Pre-production: ${formatCurrency(opt.preProductionTotal)}`);
    lines.push(`*Grand Total: ${formatCurrency(opt.grandTotal)}*`);
    
    // Per copy rate format: e.g. ₹132.00 or ₹90.50
    const perCopyDisplay = opt.perCopyRate % 1 === 0 
      ? formatCurrency(opt.perCopyRate, true) 
      : formatCurrency(opt.perCopyRate, true);
    lines.push(`Per Copy Rate: ${perCopyDisplay}`);
  });

  lines.push('');
  lines.push('══════════════════════');

  // Delivery
  if (data.deliveryProvided && deliveryChargeNum > 0) {
    lines.push(`Delivery Charge: ${formatCurrency(deliveryChargeNum)}`);
    if (productionOptions.length === 1) {
      lines.push(`*Payable Grand Total: ${formatCurrency(productionOptions[0].grandTotal + deliveryChargeNum)}*`);
    } else {
      lines.push('*Revised Payable Grand Totals with Delivery:*');
      productionOptions.forEach((opt, idx) => {
        lines.push(`Option ${idx + 1} (${opt.quantity} Copies): ${formatCurrency(opt.grandTotal + deliveryChargeNum)}`);
      });
    }
  } else {
    lines.push('Delivery charge extra.');
  }

  lines.push('');
  lines.push(RATE_CARD.footer.company);
  lines.push(`${RATE_CARD.footer.locations} | ${RATE_CARD.footer.phone}`);

  return lines.join('\n');
}

export function calculateFullEstimate(data: EstimateData): EstimateCalculationResult {
  const pages = typeof data.totalPages === 'number' && !isNaN(data.totalPages) ? data.totalPages : 0;
  const deliveryChargeNum = typeof data.deliveryCharge === 'number' && !isNaN(data.deliveryCharge) 
    ? data.deliveryCharge 
    : 0;

  const preProduction = calculatePreProduction(pages, data.layoutType, data.proofreading);

  const productionOptions = (data.quantities || []).map((qty) =>
    calculateProductionOption(qty, pages, preProduction.preProductionTotal, deliveryChargeNum)
  );

  const whatsAppText = generateWhatsAppBill(data, preProduction, productionOptions, deliveryChargeNum);

  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  if (!data.authorName.trim()) {
    validationErrors.push('Author name is required.');
  }
  if (!data.bookTitle.trim()) {
    validationErrors.push('Book title is required.');
  }
  if (!pages || pages <= 0) {
    validationErrors.push('Total pages must be greater than 0.');
  }
  if (!data.quantities || data.quantities.length === 0) {
    validationErrors.push('At least one printing quantity option is required.');
  }

  // Check slabs
  productionOptions.forEach((opt) => {
    if (!opt.isValidSlab) {
      validationWarnings.push(`Quantity ${opt.quantity} is outside standard printing rate slabs.`);
    }
  });

  const allSlabsValid = productionOptions.length > 0 && productionOptions.every((opt) => opt.isValidSlab);

  const checklistStatus = {
    estimateNoValid: Boolean(data.estimateNumber && data.estimateNumber.trim().length > 0),
    dateValid: Boolean(data.date && /^\d{2}-\d{2}-\d{4}$/.test(data.date.trim())),
    authorValid: Boolean(data.authorName && data.authorName.trim().length > 0),
    phoneValid: Boolean(data.phoneNumber && data.phoneNumber.trim().length > 0),
    bookTitleValid: Boolean(data.bookTitle && data.bookTitle.trim().length > 0),
    languageValid: Boolean(data.language && data.language.trim().length > 0),
    pagesValid: pages > 0,
    layoutValid: ['Paragraph', 'Poetry'].includes(data.layoutType),
    coverDesignValid: preProduction.coverDesign === 1000,
    isbnValid: preProduction.isbn === 1000,
    proofreadingValid: !data.proofreading || preProduction.proofreadingIncluded,
    printingSlabsValid: allSlabsValid,
    arithmeticValid: productionOptions.every((opt) => opt.grandTotal === opt.preProductionTotal + opt.printingTotal),
    deliveryHandled: !data.deliveryProvided || deliveryChargeNum >= 0,
    whatsAppFormatted: whatsAppText.includes('PAPERSQUARE') && whatsAppText.includes('*ESTIMATE BILL*'),
    footerCorrect: whatsAppText.includes('Papersquare Self Publishing Co.') && whatsAppText.includes('+91 9072380587'),
  };

  return {
    preProduction,
    productionOptions,
    deliveryProvided: Boolean(data.deliveryProvided),
    deliveryCharge: deliveryChargeNum,
    whatsAppText,
    validationErrors,
    validationWarnings,
    checklistStatus,
  };
}

export const WORKED_EXAMPLES: { name: string; description: string; data: EstimateData }[] = [
  {
    name: 'Example 1 — Paragraph with Proofreading',
    description: 'Rajalaksdhmi · Untitled stories · 100 pgs · Paragraph · Proofreading Yes · 100 & 200 copies',
    data: {
      id: 'example-1',
      estimateNumber: 'EST-EX01',
      date: '11-11-2026',
      authorName: 'Rajalaksdhmi',
      phoneNumber: '+91 8888888888',
      bookTitle: 'Untitled stories',
      language: 'Malayalam',
      totalPages: 100,
      layoutType: 'Paragraph',
      proofreading: true,
      quantities: [100, 200],
      deliveryCharge: null,
      deliveryProvided: false,
      notes: 'Worked Example 1 from Master Instructions',
      createdAt: Date.now() - 3600000 * 3,
    },
  },
  {
    name: 'Example 2 — Poetry without Proofreading',
    description: 'Example Author · My Poems · 80 pgs · Poetry · Proofreading No · 50 & 100 copies',
    data: {
      id: 'example-2',
      estimateNumber: 'EST-EX02',
      date: '11-11-2026',
      authorName: 'Example Author',
      phoneNumber: '+91 9876543210',
      bookTitle: 'My Poems',
      language: 'Malayalam',
      totalPages: 80,
      layoutType: 'Poetry',
      proofreading: false,
      quantities: [50, 100],
      deliveryCharge: null,
      deliveryProvided: false,
      notes: 'Worked Example 2 from Master Instructions',
      createdAt: Date.now() - 3600000 * 2,
    },
  },
  {
    name: 'Example 3 — 150-Page Paragraph Book',
    description: 'Example Author · My Stories · 150 pgs · Paragraph · Proofreading Yes · 100 & 200 copies',
    data: {
      id: 'example-3',
      estimateNumber: 'EST-EX03',
      date: '11-11-2026',
      authorName: 'Example Author',
      phoneNumber: '+91 9447123456',
      bookTitle: 'My Stories',
      language: 'Malayalam',
      totalPages: 150,
      layoutType: 'Paragraph',
      proofreading: true,
      quantities: [100, 200],
      deliveryCharge: null,
      deliveryProvided: false,
      notes: 'Worked Example 3 from Master Instructions',
      createdAt: Date.now() - 3600000,
    },
  },
  {
    name: 'Latest Estimate — Luke Thomas (EST-NV01)',
    description: 'Luke Thomas · Pallamma · 100 pgs · Paragraph · Proofreading Yes · 100 copies · Section 14 Master Example',
    data: {
      id: 'example-latest',
      estimateNumber: 'EST-NV01',
      date: '11-11-2026',
      authorName: 'Luke Thomas',
      phoneNumber: '+91 99861 73132',
      bookTitle: 'Pallamma',
      language: 'Malayalam',
      totalPages: 100,
      layoutType: 'Paragraph',
      proofreading: true,
      quantities: [100],
      deliveryCharge: null,
      deliveryProvided: false,
      notes: 'Latest Customer Estimate from Section 14',
      createdAt: Date.now(),
    },
  },
];

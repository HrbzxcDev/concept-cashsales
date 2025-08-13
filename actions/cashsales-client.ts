'use client';

export interface CashSaleDetailLine {
  id: string;
  numbering: string;
  stock: string;
  description: string;
  qty: number;
  uom: string;
  unitPrice: number;
  discount: string | number | null;
  amount: number;
  taxCode: string | null;
  taxAmount: number | null;
  netAmount: number | null;
  glAccount?: string | null;
  stockLocation?: string | null;
  costCentre?: string | null;
  project?: string | null;
  serialNumber?: string | null;
  cashSales?: string | null;
}

export interface CashSaleDetailResponse {
  id: string;
  cashSalesDate: string;
  cashSalesCode: string;
  customer: string;
  customerName?: string | null;
  term?: string | null;
  stockLocation?: string | null;
  currency?: string | null;
  attention?: string | null;
  salesPerson?: string | null;
  depositTo?: string | null;
  referenceNo?: string | null;
  currencyRate?: number | null;
  isChequeNo?: string | boolean | null;
  isPostToAR?: boolean | null;
  isTaxInclusive?: boolean | null;
  isRounding?: boolean | null;
  useMultiPayment?: boolean | null;
  project?: string | null;
  costCentre?: string | null;
  multiPayments?: unknown[];
  details?: CashSaleDetailLine[];
}

export async function fetchCashSaleDetailByCode(
  code: string
): Promise<CashSaleDetailResponse> {
  const baseFindUrl =
    process.env.NEXT_PUBLIC_API_FIND_URL ||
    'https://dev-api.qne.cloud/api/CashSales/Find';

  const url = `${baseFindUrl}?code=${encodeURIComponent(code)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      dbcode: process.env.NEXT_PUBLIC_DB_CODE || ''
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  return (await response.json()) as CashSaleDetailResponse;
}

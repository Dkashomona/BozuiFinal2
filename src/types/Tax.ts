export interface TaxRule {
  id: string;
  country: string;      // "USA", "DRC", "France"
  region?: string;      // "CA", "KY", "Kinshasa"
  rate: number;         // 0.07 = 7%
  exempt?: boolean;
}

export interface TaxBreakdown {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

import { getDocs, collection } from "firebase/firestore";
import type { TaxRule, TaxBreakdown } from "../types/Tax";

/* ---------------------------------------------------------
   1) Fetch dynamic tax rules from Firestore (optional)
---------------------------------------------------------*/
export async function fetchTaxRules(db: any): Promise<TaxRule[]> {
  const snap = await getDocs(collection(db, "taxRules"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TaxRule[];
}

/* ---------------------------------------------------------
   2) Simple Region-Based Tax (used by CartSummary)
---------------------------------------------------------*/

const REGION_TAX_RATES: Record<string, number> = {
  // United States
  KY: 0.06,
  OH: 0.0725,
  NY: 0.08875,
  CA: 0.095,

  // Africa / Europe examples
  DRC: 0.16,
  FR: 0.20,
  BE: 0.21,

  // Default fallback
  default: 0.07,
};

/**
 * Calculate tax using only subtotal + region.
 * Matches how CartSummary is calling it.
 */
export function calculateTax(subtotal: number, region: string): number {
  const rate = REGION_TAX_RATES[region] ?? REGION_TAX_RATES.default;
  return Number((subtotal * rate).toFixed(2));
}

/* ---------------------------------------------------------
   3) FULL Rule-Based Tax Engine (for future upgrade)
---------------------------------------------------------*/
export function calcTax(
  subtotal: number,
  country: string,
  region: string,
  rules: TaxRule[]
): TaxBreakdown {
  const rule = rules.find(
    (r) => r.country === country && (!r.region || r.region === region)
  );

  if (!rule || rule.exempt) {
    return {
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      total: subtotal,
    };
  }

  const taxAmount = Number((subtotal * rule.rate).toFixed(2));

  return {
    subtotal,
    taxRate: rule.rate,
    taxAmount,
    total: subtotal + taxAmount,
  };
}

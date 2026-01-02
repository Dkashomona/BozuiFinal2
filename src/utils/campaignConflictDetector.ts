import { Campaign } from "../models/Campaign";

/* --------------------------------------------------
   CAMPAIGN CONFLICT DETECTOR
-------------------------------------------------- */

export type CampaignWarning = {
  level: "warning" | "error";
  message: string;
  campaigns: string[];
};

export function detectCampaignConflicts(
  campaigns: Campaign[]
): CampaignWarning[] {
  const warnings: CampaignWarning[] = [];

  const itemCampaigns = campaigns.filter((c) => c.scope === "item");
  const cartCampaigns = campaigns.filter((c) => c.scope === "cart");

  /* ❌ Multiple FIRST_PURCHASE */
  const firstPurchase = campaigns.filter(
    (c) => c.type === "FIRST_PURCHASE_DISCOUNT"
  );
  if (firstPurchase.length > 1) {
    warnings.push({
      level: "error",
      message: "Only ONE First Purchase campaign is allowed.",
      campaigns: firstPurchase.map((c) => c.title),
    });
  }

  /* ⚠️ Multiple cart discounts */
  if (cartCampaigns.length > 1) {
    warnings.push({
      level: "warning",
      message:
        "Multiple cart-level campaigns detected. Only the highest priority will apply.",
      campaigns: cartCampaigns.map((c) => c.title),
    });
  }

  /* ⚠️ Same product in multiple item campaigns */
  const productMap: Record<string, string[]> = {};
  itemCampaigns.forEach((c) => {
    c.productIds?.forEach((pid) => {
      productMap[pid] = productMap[pid] || [];
      productMap[pid].push(c.title);
    });
  });

  Object.entries(productMap).forEach(([_, list]) => {
    if (list.length > 1) {
      warnings.push({
        level: "warning",
        message:
          "Product is included in multiple item campaigns. Only highest priority applies.",
        campaigns: list,
      });
    }
  });

  return warnings;
}

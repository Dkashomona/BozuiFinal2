/* =========================================================
   DISCOUNT ENGINE — SINGLE SOURCE OF TRUTH
   ---------------------------------------------------------
   ✔ Item-level: ONE best discount only
   ✔ Cart-level: ONE discount max
   ✔ FIRST_PURCHASE is exclusive
   ✔ Priority-based resolution
   ✔ SAFE for web, mobile, server, Stripe
========================================================= */

export type DiscountResult = {
  hasDiscount: boolean;
  originalPrice: number;
  price: number;
  campaign?: any;
};

/* =========================================================
   ITEM-LEVEL DISCOUNT (PER ITEM)
========================================================= */
export function applyItemDiscount({
  item,
  qty,
  campaigns,
  userData,
}: {
  item: any;
  qty: number;
  campaigns: any[];
  userData?: any;
}): DiscountResult {
  const originalPrice = Number(item?.price ?? 0);

  // Safety
  if (!item || !Array.isArray(campaigns)) {
    return {
      hasDiscount: false,
      originalPrice,
      price: originalPrice,
    };
  }

  /* -------------------------------
     Filter eligible ITEM campaigns
  -------------------------------- */
  const eligible = campaigns
    .filter((c) => c.active !== false)
    .filter((c) => c.scope === "item")
    .filter((c) => c.productIds?.includes(item.id))
    .filter((c) => isCampaignEligible(c, item, qty, userData));

  if (eligible.length === 0) {
    return {
      hasDiscount: false,
      originalPrice,
      price: originalPrice,
    };
  }

  /* -------------------------------
     Sort by PRIORITY (highest wins)
  -------------------------------- */
  eligible.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  /* -------------------------------
     Apply FIRST valid discount only
  -------------------------------- */
  for (const campaign of eligible) {
    const discountedPrice = computeItemPrice(
      campaign,
      originalPrice,
      qty
    );

    if (discountedPrice < originalPrice) {
      return {
        hasDiscount: true,
        originalPrice,
        price: discountedPrice,
        campaign,
      };
    }

    if (campaign.exclusive) break;
  }

  return {
    hasDiscount: false,
    originalPrice,
    price: originalPrice,
  };
}

/* =========================================================
   CART-LEVEL DISCOUNT (ONCE PER CART)
========================================================= */
export function applyCartDiscount({
  subtotal,
  campaigns,
  userData,
}: {
  subtotal: number;
  campaigns: any[];
  userData?: any;
}): number {
  if (!Array.isArray(campaigns) || subtotal <= 0) return subtotal;

  const eligible = campaigns
    .filter((c) => c.active !== false)
    .filter((c) => c.scope === "cart")
    .filter((c) => isCampaignEligible(c, undefined, undefined, userData))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const campaign of eligible) {
    const discounted = computeCartPrice(campaign, subtotal);
    if (discounted < subtotal) return discounted;
    if (campaign.exclusive) break;
  }

  return subtotal;
}

/* =========================================================
   ELIGIBILITY RULES
========================================================= */
function isCampaignEligible(
  campaign: any,
  item?: any,
  qty?: number,
  userData?: any
): boolean {
  switch (campaign.type) {
    case "FIRST_PURCHASE_DISCOUNT":
      return !userData?.hasOrderedBefore;

    case "QUANTITY_DISCOUNT":
      return qty != null && qty >= Number(campaign.config?.minQuantity ?? 0);

    case "BUY_X_GET_Y_PERCENT":
      return qty != null && qty >= Number(campaign.config?.buyQuantity ?? 0);

    case "FLASH_SALE": {
      const now = Date.now();
      return (
        now >= Number(campaign.config?.startAt ?? 0) &&
        now <= Number(campaign.config?.endAt ?? Infinity)
      );
    }

    case "SPEND_AND_SAVE":
      return true;

    case "BOGO":
      return qty != null && qty >= Number(campaign.config?.buy ?? 0);

    default:
      return false;
  }
}

/* =========================================================
   PRICE CALCULATIONS — ITEM
========================================================= */
function computeItemPrice(
  campaign: any,
  price: number,
  qty: number
): number {
  switch (campaign.type) {
    case "FIRST_PURCHASE_DISCOUNT":
    case "FLASH_SALE":
    case "QUANTITY_DISCOUNT":
    case "BUY_X_GET_Y_PERCENT":
      return round(
        price * (1 - Number(campaign.config?.discountPercent ?? 0) / 100)
      );

    case "BOGO": {
      const buy = Number(campaign.config?.buy ?? 1);
      const free = Math.floor(qty / buy);
      const paidUnits = qty - free;
      return round((paidUnits * price) / qty);
    }

    default:
      return price;
  }
}

/* =========================================================
   PRICE CALCULATIONS — CART
========================================================= */
function computeCartPrice(campaign: any, subtotal: number): number {
  switch (campaign.type) {
    case "SPEND_AND_SAVE":
      if (subtotal >= Number(campaign.config?.minAmount ?? 0)) {
        return round(
          Math.max(
            0,
            subtotal - Number(campaign.config?.discountAmount ?? 0)
          )
        );
      }
      return subtotal;

    default:
      return subtotal;
  }
}

/* =========================================================
   UTIL
========================================================= */
function round(n: number) {
  return Math.round(n * 100) / 100;
}

/* =========================================================
   AGGREGATOR — CART SUMMARY HELPER
   (Keeps backward compatibility)
========================================================= */
export function applyDiscounts(
items: any[], campaigns: any[], userData?: any, coupon?: any) {
  if (!Array.isArray(items)) {
    return {
      subtotal: 0,
      discount: 0,
      total: 0,
      appliedCampaign: null,
    };
  }

  /* -------------------------------
     ITEM LEVEL
  -------------------------------- */
  let subtotal = 0;
  let itemDiscountTotal = 0;
  let appliedItemCampaign: any = null;

  for (const item of items) {
    const qty = Number(item.qty ?? 1);
    const originalLine = item.price * qty;

    const result = applyItemDiscount({
      item,
      qty,
      campaigns,
      userData,
    });

    subtotal += originalLine;
    itemDiscountTotal += originalLine - result.price * qty;

    if (!appliedItemCampaign && result.campaign) {
      appliedItemCampaign = result.campaign;
    }
  }

  /* -------------------------------
     CART LEVEL (ONCE)
  -------------------------------- */
  const afterCartDiscount = applyCartDiscount({
    subtotal: subtotal - itemDiscountTotal,
    campaigns,
    userData,
  });

  const cartDiscount = subtotal - itemDiscountTotal - afterCartDiscount;

  return {
    subtotal,
    discount: round(itemDiscountTotal + cartDiscount),
    total: round(afterCartDiscount),
    appliedCampaign: appliedItemCampaign,
  };
}

export function applyDiscounts(
  product: any,
  campaigns: any[],
  userData: any = null,
  cartQty = 1,
  coupon: any = null,
  cartSubtotal: number = 0
) {
  let bestDiscountPercent = 0;
  let matchedCampaign: any = null;
  let matchedCoupon: any = null;

  const originalPrice = product.price * cartQty;
  let finalPrice = originalPrice;

  /* ==========================
     1) PRODUCT CAMPAIGNS
  ========================== */
  for (const campaign of campaigns) {
    const cfg = campaign.config || {};

    const isProductInCampaign = campaign.productIds?.includes(product.id);

    const isGlobal =
      campaign.type === "FIRST_PURCHASE_DISCOUNT" ||
      campaign.type === "FLASH_SALE";

    if (!isProductInCampaign && !isGlobal) continue;

    switch (campaign.type) {
      case "BUY_X_GET_Y_PERCENT":
        if (cartQty >= cfg.buy && cfg.discountPercent > bestDiscountPercent) {
          bestDiscountPercent = cfg.discountPercent;
          matchedCampaign = campaign;
        }
        break;

      case "FIRST_PURCHASE_DISCOUNT":
        if (userData?.orders?.length === 0) {
          if (cfg.discountPercent > bestDiscountPercent) {
            bestDiscountPercent = cfg.discountPercent;
            matchedCampaign = campaign;
          }
        }
        break;

      case "FLASH_SALE":
        const now = Date.now();
        if (now >= cfg.startAt * 1000 && now <= cfg.endAt * 1000) {
          if (cfg.discountPercent > bestDiscountPercent) {
            bestDiscountPercent = cfg.discountPercent;
            matchedCampaign = campaign;
          }
        }
        break;

      case "QUANTITY_DISCOUNT":
        if (cartQty >= cfg.minQty && cfg.discountPercent > bestDiscountPercent) {
          bestDiscountPercent = cfg.discountPercent;
          matchedCampaign = campaign;
        }
        break;

      case "BOGO": {
        const group = cfg.buy + cfg.free;
        const freeUnits = Math.floor(cartQty / group) * cfg.free;

        if (freeUnits > 0) {
          const savings = freeUnits * product.price;
          finalPrice = originalPrice - savings;

          return {
            originalPrice,
            price: finalPrice,
            hasDiscount: true,
            discountPercent: Math.round((savings / originalPrice) * 100),
            campaign: campaign,
            discountFrom: "BOGO",
          };
        }
        break;
      }
    }
  }

  /* ==========================
     2) COUPON / PROMO CODE
  ========================== */
  if (coupon) {
    if (coupon.type === "PERCENT") {
      bestDiscountPercent = Math.max(bestDiscountPercent, coupon.percent);
      matchedCoupon = coupon;
    }

    if (coupon.type === "FIXED") {
      const discounted = originalPrice - coupon.amount;
      finalPrice = Math.max(0, discounted);

      return {
        originalPrice,
        price: finalPrice,
        hasDiscount: true,
        discountPercent: Math.round((coupon.amount / originalPrice) * 100),
        campaign: null,
        coupon: coupon,
        discountFrom: "COUPON",
      };
    }
  }

  /* ==========================
     3) SPEND MORE DISCOUNT — Cart Level
  ========================== */
  if (cartSubtotal >= 100) {
    const extraDiscount = 15; // $15 OFF above $100
    const discounted = originalPrice - extraDiscount;

    if (discounted < finalPrice) {
      return {
        originalPrice,
        price: Math.max(0, discounted),
        hasDiscount: true,
        discountPercent: Math.round((extraDiscount / originalPrice) * 100),
        discountFrom: "SPEND_MORE",
        campaign: { title: "Spend $100 Get $15 OFF" },
      };
    }
  }

  /* ==========================
     APPLY BEST % DISCOUNT
  ========================== */
  if (bestDiscountPercent > 0) {
    finalPrice = Number(
      (originalPrice * (1 - bestDiscountPercent / 100)).toFixed(2)
    );
  }

  return {
    originalPrice,
    price: finalPrice,
    hasDiscount: bestDiscountPercent > 0,
    discountPercent: bestDiscountPercent,
    campaign: matchedCampaign,
    coupon: matchedCoupon,
    discountFrom: matchedCoupon ? "COUPON" : matchedCampaign ? "CAMPAIGN" : null,
  };
}

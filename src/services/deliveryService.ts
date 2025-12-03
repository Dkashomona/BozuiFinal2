export const DELIVERY_OPTIONS = {
  STANDARD: { label: "Standard Delivery", amount: 5.99, days: "3–5 days" },
  EXPRESS: { label: "Express Delivery", amount: 12.99, days: "1–2 days" },
  NEXT_DAY: { label: "Next-Day Delivery", amount: 24.99, days: "Next day" },
} as const;

// 👇 This tells TypeScript EXACTLY which keys exist
export type DeliveryKey = keyof typeof DELIVERY_OPTIONS;

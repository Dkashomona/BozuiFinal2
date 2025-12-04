import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;     // ALWAYS number
  size?: string;
  color?: string;
  qty: number;       // ALWAYS number
};

type CartState = {
  items: CartItem[];
  saved: CartItem[];

  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;

  addToCart: (item: {
    id: string;
    name: string;
    image: string;
    price: number | string;
    qty?: number | string;
    size?: string;
    color?: string;
  }) => void;

  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  saveForLater: (id: string) => void;
  restoreFromSaved: (id: string) => void;

  /** internal: recalculates totals */
  calculateTotals: (items: CartItem[]) => {
    subtotal: number;
    tax: number;
    shippingFee: number;
    total: number;
  };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  saved: [],

  subtotal: 0,
  tax: 0,
  shippingFee: 0,
  total: 0,

  /* --------------------------------------------------------
     INTERNAL: Calculate totals (subtotal, tax, shipping, etc.)
  ---------------------------------------------------------*/
  calculateTotals: (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const tax = subtotal * 0.07; // Example: 7% tax
    const shippingFee = subtotal > 100 ? 0 : 5.99; // Example: free shipping over $100
    const total = subtotal + tax + shippingFee;

    return { subtotal, tax, shippingFee, total };
  },

  /* --------------------------------------------------------
     ADD ITEM TO CART
  ---------------------------------------------------------*/
  addToCart: (item) =>
    set((state) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;

      const existing = state.items.find((i) => i.id === item.id);

      let updatedItems;

      if (existing) {
        updatedItems = state.items.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + qty } : i
        );
      } else {
        updatedItems = [
          ...state.items,
          {
            id: item.id,
            name: item.name,
            image: item.image,
            size: item.size,
            color: item.color,
            price,
            qty,
          },
        ];
      }

      const totals = state.calculateTotals(updatedItems);

      return {
        items: updatedItems,
        ...totals,
      };
    }),

  /* --------------------------------------------------------
     UPDATE QUANTITY
  ---------------------------------------------------------*/
  updateQty: (id, qty) =>
    set((state) => {
      const updatedItems = state.items.map((i) =>
        i.id === id ? { ...i, qty: Number(qty) || 1 } : i
      );

      const totals = state.calculateTotals(updatedItems);

      return {
        items: updatedItems,
        ...totals,
      };
    }),

  /* --------------------------------------------------------
     REMOVE ITEM
  ---------------------------------------------------------*/
  removeFromCart: (id) =>
    set((state) => {
      const updatedItems = state.items.filter((i) => i.id !== id);

      const totals = state.calculateTotals(updatedItems);

      return {
        items: updatedItems,
        ...totals,
      };
    }),

  /* --------------------------------------------------------
     CLEAR CART
  ---------------------------------------------------------*/
  clearCart: () =>
    set(() => ({
      items: [],
      subtotal: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
    })),

  /* --------------------------------------------------------
     SAVE FOR LATER
  ---------------------------------------------------------*/
  saveForLater: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;

      const updatedItems = state.items.filter((i) => i.id !== id);
      const totals = state.calculateTotals(updatedItems);

      return {
        items: updatedItems,
        saved: [...state.saved, item],
        ...totals,
      };
    }),

  /* --------------------------------------------------------
     RESTORE SAVED ITEM BACK TO CART
  ---------------------------------------------------------*/
  restoreFromSaved: (id) =>
    set((state) => {
      const item = state.saved.find((i) => i.id === id);
      if (!item) return state;

      const updatedSaved = state.saved.filter((i) => i.id !== id);
      const updatedItems = [...state.items, item];

      const totals = state.calculateTotals(updatedItems);

      return {
        items: updatedItems,
        saved: updatedSaved,
        ...totals,
      };
    }),
}));

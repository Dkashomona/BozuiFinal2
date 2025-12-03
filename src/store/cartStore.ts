import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;   // ALWAYS a number
  size?: string;
  color?: string;
  qty: number;     // ALWAYS a number
};

type CartState = {
  items: CartItem[];
  saved: CartItem[];

  addToCart: (item: { id: string; name: string; image: string; price: any; qty?: number; size?: string; color?: string }) => void;
  updateQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  saveForLater: (id: string) => void;
  restoreFromSaved: (id: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  saved: [],

  /** ADD ITEM TO CART */
  addToCart: (item) =>
    set((state) => {
      const numericPrice = Number(item.price) || 0;
      const addedQty = Number(item.qty) || 1;

      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + addedQty } : i
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            id: item.id,
            name: item.name,
            image: item.image,
            size: item.size,
            color: item.color,
            price: numericPrice,
            qty: addedQty,
          },
        ],
      };
    }),

  /** UPDATE QTY */
  updateQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: Number(qty) || 1 } : i
      ),
    })),

  /** REMOVE ITEM */
  removeFromCart: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  /** CLEAR CART */
  clearCart: () => set({ items: [] }),

  /** SAVE FOR LATER */
  saveForLater: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return state;

      return {
        items: state.items.filter((i) => i.id !== id),
        saved: [...state.saved, item],
      };
    }),

  /** RESTORE ITEM FROM SAVED LIST */
  restoreFromSaved: (id) =>
    set((state) => {
      const item = state.saved.find((i) => i.id === id);
      if (!item) return state;

      return {
        saved: state.saved.filter((i) => i.id !== id),
        items: [...state.items, item],
      };
    }),
}));

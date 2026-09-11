import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  key: string; // e.g. productId::variantId
  productId: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string;
  variantId: string;
  variantSku: string;
  variantLabel: string; // e.g. "5-6mm"
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'key' | 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  cartCount: () => number;
  cartSubtotal: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (newItem) =>
        set((state) => {
          const key = `${newItem.productId}::${newItem.variantId}`;
          const normalizedLabel = newItem.variantLabel ? newItem.variantLabel.replace(/\s*\/\s*/g, ', ') : newItem.variantLabel;
          const itemToAdd = { ...newItem, variantLabel: normalizedLabel };
          const existingItem = state.items.find((item) => item.key === key);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.key === key
                  ? { ...item, quantity: item.quantity + (newItem.quantity || 1), variantLabel: normalizedLabel }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { ...itemToAdd, key, quantity: newItem.quantity || 1 }],
          };
        }),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity } : item
          ),
        })),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((item) => item.key !== key),
        })),

      cartCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      cartSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'gemostone-cart-storage',
      skipHydration: true, // We will manually rehydrate in StoreRehydrator
    }
  )
);

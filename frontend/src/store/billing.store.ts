import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReceiptBundle } from '../types/receipt.types';
import { categoryApi } from '../api/category.api';
import { menuApi } from '../api/menu.api';
export interface CartItem {
  id: string;
  itemNumber: string;
  name: string;
  price: number;
  quantity: number;
  itemType: 'KITCHEN' | 'PACKED';
  gstPercentage: number;
  instructions?: string;
  image?: string | null;
}

export interface MenuItem {
  id: string;
  itemNumber: string;
  name: string;
  categoryId: string;
  price: number;
  gst: number;
  itemType: 'KITCHEN' | 'PACKED';
  isAvailable: boolean;
  image?: string | null;
  barcode?: string;
  shortCode: string;
  sku: string;
  prepTime?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CompletedOrder {
  orderId: string;
  orderNumber: string;
  tokenNumber: number;
  grandTotal: number;
  paymentMethod: string;
  businessDate: string;
  completedAt: string;
  receiptBundle: ReceiptBundle;
}

interface BillingState {
  cart: CartItem[];
  categories: Category[];
  menuItems: MenuItem[];
  selectedCategoryId: string | null;
  searchQuery: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  discountReason: string;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | null;
  receivedCashAmount: number;
  changeReturnAmount: number;
  transactionReference: string;
  paymentStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED';
  lastRemovedItem: CartItem | null;
  recentSearches: string[];
  completedOrders: CompletedOrder[];

  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, note: string) => void;
  setDiscountDetails: (type: 'PERCENTAGE' | 'FLAT', value: number, reason: string) => void;
  setPaymentMethod: (method: 'CASH' | 'UPI' | 'CARD' | null) => void;
  setPaymentState: (fields: Partial<BillingState>) => void;
  addCompletedOrder: (order: CompletedOrder) => void;
  undoLastRemove: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  barcodeScan: (code: string) => boolean;
  clearCart: () => void;
  isLoadingCatalog: boolean;
  fetchCatalog: () => Promise<void>;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      cart: [],
      categories: [],
      menuItems: [],
      selectedCategoryId: null,
      searchQuery: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      discountReason: '',
      paymentMethod: null,
      receivedCashAmount: 0,
      changeReturnAmount: 0,
      transactionReference: '',
      paymentStatus: 'IDLE',
      lastRemovedItem: null,
      recentSearches: [],
      completedOrders: [],

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((c) => c.id === item.id);
        if (existing) {
          return { cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) };
        }
        return {
          cart: [...state.cart, { id: item.id, itemNumber: item.itemNumber, name: item.name, price: item.price, quantity: 1, itemType: item.itemType, gstPercentage: item.gst, instructions: '', image: item.image }],
        };
      }),
      removeFromCart: (itemId) => set((state) => {
        const itemToRemove = state.cart.find((c) => c.id === itemId);
        return { cart: state.cart.filter((c) => c.id !== itemId), lastRemovedItem: itemToRemove || null };
      }),
      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          const itemToRemove = state.cart.find((c) => c.id === itemId);
          return { cart: state.cart.filter((c) => c.id !== itemId), lastRemovedItem: itemToRemove || null };
        }
        return { cart: state.cart.map((c) => (c.id === itemId ? { ...c, quantity } : c)) };
      }),
      updateInstructions: (itemId, note) => set((state) => ({
        cart: state.cart.map((c) => (c.id === itemId ? { ...c, instructions: note } : c)),
      })),
      setDiscountDetails: (type, value, reason) => set({ discountType: type, discountValue: value, discountReason: reason }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaymentState: (fields) => set(fields),
      addCompletedOrder: (order) => set((state) => ({
        completedOrders: [order, ...state.completedOrders].slice(0, 20),
      })),
      undoLastRemove: () => set((state) => {
        if (!state.lastRemovedItem) return {};
        const alreadyInCart = state.cart.find((c) => c.id === state.lastRemovedItem?.id);
        if (alreadyInCart) {
          return {
            cart: state.cart.map((c) => c.id === state.lastRemovedItem?.id ? { ...c, quantity: c.quantity + state.lastRemovedItem!.quantity } : c),
            lastRemovedItem: null,
          };
        }
        return { cart: [...state.cart, state.lastRemovedItem], lastRemovedItem: null };
      }),
      addRecentSearch: (query) => set((state) => {
        if (!query.trim()) return {};
        const clean = query.trim();
        const filtered = state.recentSearches.filter((s) => s !== clean);
        return { recentSearches: [clean, ...filtered].slice(0, 5) };
      }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      barcodeScan: (code) => {
        const q = code.toLowerCase().trim();
        const matches = get().menuItems.filter((m) => 
          (m.barcode && m.barcode.toLowerCase() === q) || 
          (m.itemNumber && m.itemNumber.toLowerCase() === q) ||
          (m.itemNumber && m.itemNumber.toLowerCase() === `m${q}`)
        );
        if (matches.length > 0) {
          const available = matches.find(m => m.isAvailable) || matches[0];
          if (available && available.isAvailable) {
            get().addToCart(available);
            return true;
          }
        }
        return false;
      },
      clearCart: () => set({
        cart: [], discountType: 'PERCENTAGE', discountValue: 0, discountReason: '',
        paymentMethod: null, receivedCashAmount: 0, changeReturnAmount: 0,
        transactionReference: '', paymentStatus: 'IDLE', lastRemovedItem: null,
      }),
      isLoadingCatalog: false,
      fetchCatalog: async () => {
        try {
          set({ isLoadingCatalog: true });
          const [catRes, menuRes] = await Promise.all([
            categoryApi.getCategories(),
            menuApi.getMenuItems(),
          ]);
          
          // Map backend categories to frontend store format
          const mappedCategories = (catRes.data.data || []).map((c: any, index: number) => {
            const icons = ['🍽️', '🍜', '🥗', '☕', '🍰', '🍟', '🍱', '🍔'];
            const colors = ['bg-amber-500', 'bg-red-500', 'bg-green-500', 'bg-brown-500', 'bg-pink-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500'];
            return {
              id: c.id,
              name: c.name,
              icon: icons[index % icons.length],
              color: colors[index % colors.length]
            };
          });

          // Map backend menu items
          const mappedMenuItems = (menuRes.data.data || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            shortCode: m.name.substring(0, 4).toUpperCase(),
            sku: `SKU-${m.id.substring(0, 8)}`,
            price: Number(m.price),
            itemType: m.itemType,
            isAvailable: m.isAvailable,
            categoryId: m.categoryId,
            itemNumber: m.itemNumber,
            gst: Number(m.gst) || 5,
            gstPercentage: Number(m.gst) || 5,
            prepTime: m.itemType === 'KITCHEN' ? 10 : 0
          }));

          set({ categories: mappedCategories, menuItems: mappedMenuItems });
        } catch (error) {
          console.error('Failed to fetch catalog:', error);
        } finally {
          set({ isLoadingCatalog: false });
        }
      },
    }),
    {
      name: 'pos-checkout-storage-v5',
      partialize: (state) => ({
        cart: state.cart,
        discountType: state.discountType,
        discountValue: state.discountValue,
        discountReason: state.discountReason,
        recentSearches: state.recentSearches,
        completedOrders: state.completedOrders,
      }),
    }
  )
);

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  productSlug: string;
  title: string;
  variantName: string;
  price: number;
  image: string;
  storeId: string;
  storeName: string;
  storeCity: string;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  itemsByStore: Record<string, { storeName: string; storeCity: string; items: CartItem[] }>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'hyperlocal_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qtyToAdd = item.quantity || 1;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === item.variantId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(
          updated[existingIndex].maxStock,
          updated[existingIndex].quantity + qtyToAdd
        );
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }
      return [...prev, { ...item, quantity: Math.min(item.maxStock, qtyToAdd) }];
    });
    setIsOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          return {
            ...item,
            quantity: Math.min(item.maxStock, quantity),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Group items by hyper-local vendor store
  const itemsByStore = items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        storeCity: item.storeCity,
        items: [],
      };
    }
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeName: string; storeCity: string; items: CartItem[] }>);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        itemsByStore,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

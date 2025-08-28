// context/CartContext.tsx
"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

export type CartItem = {
  id: string;             // generated per row
  slug?: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  image?: string;
  variantId?: string;     // Shopify Variant GID (required for checkout)
  preorder?: boolean;     // Preorder flag
  shipEstimate?: string;  // e.g., "Ships late Sept"
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (b: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "cart-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextType["addItem"] = (item) => {
    setItems((prev) => {
      // merge identical lines (same variantId + size)
      const idx = prev.findIndex(
        (p) => p.variantId && p.variantId === item.variantId && p.size === item.size
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + (item.qty || 1) };
        return next;
      }
      return [...prev, { ...item, id: uid(), qty: item.qty || 1 }];
    });
    setOpen(true);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, Math.min(99, qty)) } : p))
    );

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  const value: CartContextType = {
    items,
    count,
    subtotal,
    addItem,
    removeItem,
    setQty,
    clear,
    open,
    setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  cartItemId: string; // unique composite key: `${menuId}_${notes}`
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  imageUrl: string;
  veg: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: { id: string; name: string; price: number; imageUrl: string; veg: boolean }, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode; restaurantId: string; tableNumber: string }> = ({ 
  children, 
  restaurantId, 
  tableNumber 
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const storageKey = `wavepos_cart_${restaurantId}_t${tableNumber}`;

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch (e) {
          console.error("Error reading cached cart:", e);
        }
      }
    }
  }, [storageKey]);

  // Persist cart to localStorage whenever it changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  };

  const addToCart = (
    item: { id: string; name: string; price: number; imageUrl: string; veg: boolean }, 
    notes: string = ""
  ) => {
    const trimmedNotes = notes.trim();
    const cartItemId = `${item.id}_${trimmedNotes}`;

    const existingIndex = cartItems.findIndex((x) => x.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        cartItemId,
        menuId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: trimmedNotes,
        imageUrl: item.imageUrl,
        veg: item.veg
      };
      saveCart([...cartItems, newItem]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    const updated = cartItems.filter((x) => x.cartItemId !== cartItemId);
    saveCart(updated);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const updated = cartItems.map((x) => 
      x.cartItemId === cartItemId ? { ...x, quantity } : x
    );
    saveCart(updated);
  };

  const updateNotes = (cartItemId: string, notes: string) => {
    const trimmedNotes = notes.trim();
    const updated = cartItems.map((x) => {
      if (x.cartItemId === cartItemId) {
        // Regenerate unique key if notes are modified
        const newCartItemId = `${x.menuId}_${trimmedNotes}`;
        return {
          ...x,
          cartItemId: newCartItemId,
          notes: trimmedNotes
        };
      }
      return x;
    });

    // Merge duplicates if changing notes leads to an existing item configuration
    const merged: CartItem[] = [];
    updated.forEach((item) => {
      const existing = merged.find((m) => m.cartItemId === item.cartItemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.push(item);
      }
    });

    saveCart(merged);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Computations (5% GST rate)
  const subtotal = cartItems.reduce((acc, x) => acc + x.price * x.quantity, 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return (
    <CartContext.Provider 
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        subtotal,
        tax,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
};

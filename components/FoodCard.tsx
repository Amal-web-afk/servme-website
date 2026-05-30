"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  veg: boolean;
  available: boolean;
  currencySymbol?: string;
  primaryColor?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  veg,
  available,
  currencySymbol = "₹",
  primaryColor = "#E5613D"
}) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const matchingCartItems = cartItems.filter((x) => x.menuId === id);
  const totalQuantity = matchingCartItems.reduce((acc, x) => acc + x.quantity, 0);

  const handleAddClick = () => {
    if (!available) return;
    setIsAdding(true);
    addToCart({ id, name, price, imageUrl, veg });
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleIncrement = () => {
    if (matchingCartItems.length > 0) {
      const itemToUpdate = matchingCartItems[0];
      updateQuantity(itemToUpdate.cartItemId, itemToUpdate.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (matchingCartItems.length > 0) {
      const itemToUpdate = matchingCartItems[matchingCartItems.length - 1];
      updateQuantity(itemToUpdate.cartItemId, itemToUpdate.quantity - 1);
    }
  };

  const hasQty = totalQuantity > 0;

  // Premium badge logic
  let badgeLabel = "";
  let badgeStyle = "";
  if (name.toLowerCase().includes("malabar") || name.toLowerCase().includes("signature") || name.toLowerCase().includes("special")) {
    badgeLabel = "Chef's Pick";
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40";
  } else if (price > 220) {
    badgeLabel = "Popular";
    badgeStyle = "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/40";
  } else if (veg && name.length % 3 === 0) {
    badgeLabel = "Must Try";
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40";
  }

  return (
    <div
      className={`group relative rounded-[1.75rem] overflow-hidden transition-all duration-400 select-none ${
        hasQty
          ? "ring-[1.5px] ring-[#E5613D]/60 dark:ring-[#FF7A00]/60 shadow-[0_8px_30px_-6px_rgba(229,97,61,0.18)]"
          : "ring-1 ring-[#EBE3E2] dark:ring-slate-800/80 shadow-[0_2px_12px_-4px_rgba(60,44,40,0.06)] hover:shadow-[0_10px_36px_-8px_rgba(229,97,61,0.12)] hover:ring-[#E5613D]/25 dark:hover:ring-[#FF7A00]/25"
      } ${!available ? "opacity-55 pointer-events-none" : ""} bg-white dark:bg-[#161A22]`}
    >
      {/* ── Image Banner ─────────────────────────────────────── */}
      <div className="relative w-full h-44 overflow-hidden bg-[#F3ECEB] dark:bg-[#1E242E]">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient fade at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Veg / Non-veg dot + text (top-left, over image) */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-wider ${
          veg
            ? "bg-white/85 dark:bg-black/60 text-green-700 dark:text-green-400 border-green-200/60 dark:border-green-800/40"
            : "bg-white/85 dark:bg-black/60 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/40"
        }`}>
          <span className={`w-2 h-2 rounded-full ${veg ? "bg-green-500" : "bg-red-500"}`} />
          {veg ? "Veg" : "Non-Veg"}
        </div>

        {/* Optional premium badge (top-right) */}
        {badgeLabel && (
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border backdrop-blur-md ${badgeStyle}`}>
            ✦ {badgeLabel}
          </div>
        )}

        {/* Unavailable overlay */}
        {!available && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center">
            <span className="bg-white dark:bg-[#1E242E] border border-[#EBE3E2] dark:border-slate-700 text-[#8E7C77] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Content Area ─────────────────────────────────────── */}
      <div className="px-4 pt-3.5 pb-4 space-y-3">
        {/* Name + description */}
        <div className="space-y-1.5">
          <h3 className="font-black text-[15px] leading-snug text-[#3C2C28] dark:text-slate-100 tracking-tight group-hover:text-[#E5613D] dark:group-hover:text-[#FF7A00] transition-colors duration-300">
            {name}
          </h3>
          <p className="text-[11.5px] text-[#9A8880] dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
            {description}
          </p>
        </div>

        {/* Price + Add button row */}
        <div className="flex items-center justify-between pt-1">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#B8A9A5] dark:text-slate-500 font-semibold uppercase tracking-wider leading-none mb-0.5">Price</span>
            <span className="text-[17px] font-black text-[#3C2C28] dark:text-white tracking-tight leading-none">
              <span className="text-[12px] font-extrabold opacity-70 mr-0.5">{currencySymbol}</span>
              {price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}
            </span>
          </div>

          {/* Action: Add / Stepper */}
          {available && (
            hasQty ? (
              <div
                className="flex items-center gap-0 rounded-2xl overflow-hidden border-2 shadow-sm"
                style={{ borderColor: primaryColor + "60" }}
              >
                <button
                  onClick={handleDecrement}
                  className="w-9 h-9 flex items-center justify-center text-base font-black transition-all active:scale-90"
                  style={{ color: primaryColor }}
                >
                  −
                </button>
                <span
                  className="w-7 text-center text-sm font-black select-none"
                  style={{ color: primaryColor }}
                >
                  {totalQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-9 h-9 flex items-center justify-center text-sm font-black text-white rounded-xl transition-all active:scale-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                style={{ backgroundColor: isAdding ? primaryColor + "cc" : primaryColor }}
                className={`h-10 px-5 rounded-2xl text-white font-black text-[11px] uppercase tracking-wider shadow-md active:scale-95 transition-all duration-200 ${
                  isAdding ? "scale-95 shadow-sm" : "hover:shadow-lg hover:scale-[1.04]"
                }`}
              >
                {isAdding ? "Added ✓" : "Add"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Active selection glow bar at bottom */}
      {hasQty && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[1.75rem]"
          style={{ backgroundColor: primaryColor }}
        />
      )}
    </div>
  );
};

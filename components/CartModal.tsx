"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  tableNumber: string;
  restaurantName: string;
  currencySymbol?: string;
  primaryColor?: string;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  tableNumber,
  restaurantName,
  currencySymbol = "₹",
  primaryColor = "#E5613D"
}) => {
  const { cartItems, updateQuantity, updateNotes, subtotal, tax, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleEditNoteStart = (cartItemId: string, currentNotes: string) => {
    setActiveNoteEditId(cartItemId);
    setTempNote(currentNotes);
  };

  const handleSaveNote = (cartItemId: string) => {
    updateNotes(cartItemId, tempNote);
    setActiveNoteEditId(null);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const itemsPayload = cartItems.map((item) => ({
        menuId: item.menuId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes
      }));

      const orderData = {
        restaurantId,
        tableNumber: Number(tableNumber),
        items: itemsPayload,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: null,
        subtotal,
        tax,
        discount: 0,
        total,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const batch = writeBatch(db);
      
      const orderRef = doc(collection(db, "orders"));
      batch.set(orderRef, orderData);

      const tableId = `${restaurantId}_${tableNumber}`;
      const tableRef = doc(db, "tables", tableId);
      batch.set(tableRef, {
        restaurantId,
        tableNumber: Number(tableNumber),
        status: "active",
        currentOrderId: orderRef.id,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();

      clearCart();
      onClose();

      router.push(`/restaurant/${restaurantId}/table/${tableNumber}/orders`);
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#3C2C28]/40 backdrop-blur-md z-50 flex flex-col justify-end transition-opacity duration-300">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet */}
      <div className="bg-[#FBF5F4] dark:bg-[#161A22] w-full rounded-t-[2.5rem] max-h-[85vh] flex flex-col relative z-10 shadow-2xl border-t border-[#EBE3E2] dark:border-slate-800 overflow-hidden animate-slide-up">
        
        {/* Handle */}
        <div className="w-10 h-1 bg-[#EBE3E2] dark:bg-slate-800 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-center border-b border-[#EBE3E2] dark:border-slate-800 shrink-0">
          <div>
            <h2 className="font-black text-lg text-[#3C2C28] dark:text-white">Your Cart</h2>
            <p className="text-[10px] text-[#8E7C77] font-bold uppercase tracking-wider mt-0.5">{restaurantName} • Table {tableNumber}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F3ECEB] dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-[#3C2C28] dark:text-slate-300 hover:scale-105 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-2 select-none">
              <span className="text-4xl block">🍽️</span>
              <p className="font-extrabold text-sm text-[#3C2C28] dark:text-slate-350">Your cart is empty</p>
              <p className="text-[11px] text-[#8E7C77] font-semibold max-w-xs mx-auto">Add items from our signature selection to satisfy your cravings!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.cartItemId} className="flex flex-col border-b border-[#F3ECEB] dark:border-slate-800/40 pb-4">
                <div className="flex gap-3.5 items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#EBE3E2]/50">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      {/* Handcrafted FSSAI Packaging Badge */}
                      <span 
                        className={`w-3 h-3 border flex items-center justify-center rounded select-none shrink-0 ${
                          item.veg ? "border-green-600" : "border-red-600"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${
                          item.veg ? "bg-green-600" : "bg-red-600"
                        }`} />
                      </span>
                      <h4 className="font-black text-xs text-[#3C2C28] dark:text-slate-100 line-clamp-1">{item.name}</h4>
                    </div>
                    <span className="text-[11px] font-black text-[#8E7C77] mt-0.5 block">
                      {currencySymbol}{item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Slider */}
                  <div 
                    style={{ backgroundColor: primaryColor }}
                    className="flex items-center justify-between text-white font-extrabold text-[10px] h-6 rounded-lg shadow-sm px-1"
                  >
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition-all text-xs"
                    >
                      −
                    </button>
                    <span className="w-4 text-center select-none text-[9px]">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition-all text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Kitchen Instruction Notes */}
                <div className="mt-2.5 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 border border-[#EBE3E2]/60 dark:border-slate-800">
                  {activeNoteEditId === item.cartItemId ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="e.g., extra spicy, no onions, sauce on side"
                        className="flex-1 bg-transparent text-[11px] outline-none text-[#3C2C28] dark:text-white border-b border-[#EBE3E2] pb-0.5 focus:border-[#E5613D] font-bold tracking-wide"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleSaveNote(item.cartItemId)}
                        style={{ color: primaryColor }}
                        className="text-[10px] font-black uppercase tracking-wider px-2"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#8E7C77] flex-1 pr-2 truncate font-semibold">
                        {item.notes ? `Note: "${item.notes}"` : "Add kitchen instructions (notes)..."}
                      </span>
                      <button 
                        onClick={() => handleEditNoteStart(item.cartItemId, item.notes)}
                        style={{ color: primaryColor }}
                        className="font-black uppercase tracking-wider shrink-0 hover:underline"
                      >
                        {item.notes ? "Edit" : "Add"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations & Order Button */}
        {cartItems.length > 0 && (
          <div className="bg-white dark:bg-[#161A22] border-t border-[#EBE3E2] dark:border-slate-800 px-6 py-5 shrink-0 space-y-4 shadow-[0_-8px_24px_rgba(60,44,40,0.02)]">
            <div className="space-y-1.5 text-[11px] font-bold text-[#8E7C77]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-extrabold text-[#3C2C28] dark:text-slate-200">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-extrabold text-[#3C2C28] dark:text-slate-200">{currencySymbol}{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-[#3C2C28] dark:text-white border-t border-[#F3ECEB] dark:border-slate-800 pt-2 shrink-0">
                <span>Total Bill (inc. Tax)</span>
                <span style={{ color: primaryColor }} className="text-sm">
                  {currencySymbol}{total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              style={{ backgroundColor: primaryColor }}
              className="w-full h-11 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#E5613D]/10 hover:shadow-lg hover:shadow-[#E5613D]/15 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending to Kitchen...</span>
                </>
              ) : (
                <>
                  <span>Place Order • {currencySymbol}{total.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

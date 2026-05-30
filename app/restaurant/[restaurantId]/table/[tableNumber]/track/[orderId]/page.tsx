"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

interface OrderDoc {
  restaurantId: string;
  tableNumber: number;
  items: OrderItem[];
  status: string; // 'pending' | 'preparing' | 'ready' | 'completed'
  paymentStatus: string;
  total: number;
}

interface RestaurantDetails {
  name: string;
  currencySymbol: string;
  phone: string;
  branding?: {
    primaryColor?: string;
  };
}

interface TrackPageProps {
  params: Promise<{
    restaurantId: string;
    tableNumber: string;
    orderId: string;
  }>;
}

export default function OrderTrackingPage({ params }: TrackPageProps) {
  const resolvedParams = React.use(params);
  const { restaurantId, tableNumber, orderId } = resolvedParams;

  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Fetch Restaurant details once for branding
    const fetchBranding = async () => {
      try {
        const restDocRef = doc(db, "restaurants", restaurantId);
        const restSnap = await getDoc(restDocRef);
        if (restSnap.exists()) {
          setRestaurant(restSnap.data() as RestaurantDetails);
        }
      } catch (err) {
        console.error("Error fetching restaurant branding:", err);
      }
    };
    fetchBranding();

    // 2. Set up realtime listener on order document
    const orderDocRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      orderDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder(docSnap.data() as OrderDoc);
        } else {
          console.warn("Order document does not exist in Firestore.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore order subscription failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId, restaurantId]);

  const primaryColor = restaurant?.branding?.primaryColor || "#E5613D";
  const currencySymbol = restaurant?.currencySymbol || "₹";

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#FBF5F4] dark:bg-[#0F1216] flex flex-col items-center justify-center p-6 space-y-4">
        <svg className="animate-spin h-10 w-10" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#FBF5F4] dark:bg-[#0F1216] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-[#EBE3E2] dark:border-slate-700">
          <span className="text-3xl">🕵️‍♀️</span>
        </div>
        <div>
          <h2 className="font-black text-[17px] text-[#3C2C28] dark:text-white">Order Not Found</h2>
          <p className="text-[11px] text-[#8E7C77] mt-1 font-medium px-6 leading-relaxed">
            We couldn't resolve this order reference. It might have been cleared or belongs to a different session.
          </p>
        </div>
        <button
          onClick={() => router.push(`/restaurant/${restaurantId}/table/${tableNumber}`)}
          style={{ backgroundColor: primaryColor }}
          className="mt-4 px-8 h-12 text-white font-black text-[11px] uppercase tracking-wider rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  // Work out step values
  const statusSteps = [
    { key: "pending", label: "Order Received", desc: "Sent successfully to kitchen", icon: "📝" },
    { key: "preparing", label: "Preparing Food", desc: "Chef is cooking your dish", icon: "🍳" },
    { key: "ready", label: "Ready to Serve", desc: "Dishes are hot and packing", icon: "🍽️" },
    { key: "completed", label: "Order Completed", desc: "Deliciously enjoyed!", icon: "✨" }
  ];

  const getStepIndex = (status: string) => {
    const idx = statusSteps.findIndex((step) => step.key === status);
    return idx === -1 ? 0 : idx;
  };

  const activeIndex = getStepIndex(order.status);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FBF5F4] dark:bg-[#0F1216] relative pb-16 font-sans">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-[250px] h-[250px] rounded-full opacity-[0.04] dark:opacity-[0.05] blur-[80px]" style={{ backgroundColor: primaryColor }} />
      </div>

      {/* Immersive Parallax Header Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-[#3C2C28] shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBF5F4] dark:from-[#0F1216] via-[#3C2C28]/60 to-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80" 
          alt="Restaurant Banner"
          className="w-full h-full object-cover scale-105"
        />
        
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <a 
              href={`/restaurant/${restaurantId}/table/${tableNumber}/orders`}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 active:scale-95 transition-all duration-200 border border-white/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </a>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 active:scale-95 transition-all duration-300 border border-white/10"
          >
            <div className={`transition-all duration-500 ${isDarkMode ? "rotate-180" : "rotate-0"}`}>
              {isDarkMode ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </div>
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-5 left-5 right-5 z-20 flex items-end justify-between">
          <div>
            <h1 className="font-black text-2xl text-[#3C2C28] dark:text-white leading-tight tracking-tight drop-shadow-md">
              Tracking Info
            </h1>
            <p className="text-[11px] text-[#8E7C77] dark:text-slate-300 font-bold uppercase tracking-wider mt-0.5 drop-shadow-md">#{orderId.substring(0, 7).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Main Track Dashboard */}
      <div className="p-5 space-y-5 relative z-10">
        
        {/* Status Callout Box */}
        <div className="bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 p-6 rounded-[2rem] shadow-sm text-center space-y-2 relative overflow-hidden">
          <div className="text-4xl mb-2 animate-pulse-warm inline-block">
            {statusSteps[activeIndex]?.icon}
          </div>
          <h2 className="font-black text-xl text-[#3C2C28] dark:text-white tracking-tight">
            {statusSteps[activeIndex]?.label}
          </h2>
          <p className="text-[11px] text-[#8E7C77] dark:text-slate-400 font-semibold">{statusSteps[activeIndex]?.desc}</p>
          
          {/* Subtle status top indicator line */}
          <div 
            style={{ backgroundColor: primaryColor }} 
            className="absolute top-0 left-0 right-0 h-1.5 opacity-90"
          />
        </div>

        {/* Timeline Progress */}
        <div className="bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 p-6 rounded-[2rem] shadow-sm space-y-6">
          <h3 className="font-black text-[11px] text-[#8E7C77] dark:text-slate-400 uppercase tracking-widest mb-4">Live Progress</h3>
          
          <div className="relative pl-8 space-y-8">
            {/* Timeline Line */}
            <div className="absolute left-3.5 top-2.5 bottom-2 w-1 bg-[#F3ECEB] dark:bg-slate-800/80 rounded-full overflow-hidden">
              <div 
                style={{ 
                  backgroundColor: primaryColor,
                  height: `${(activeIndex / (statusSteps.length - 1)) * 100}%`
                }} 
                className="w-full transition-all duration-700 ease-in-out origin-top shadow-[0_0_8px_rgba(0,0,0,0.3)]"
              />
            </div>

            {/* Timeline Steps */}
            {statusSteps.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isActive = idx === activeIndex;
              const isFuture = idx > activeIndex;

              return (
                <div key={step.key} className="relative flex gap-4">
                  {/* Circle Indicator */}
                  <div 
                    style={{ 
                      borderColor: isActive || isPast ? primaryColor : undefined,
                      backgroundColor: isPast ? primaryColor : (isActive ? "#FFFFFF" : undefined)
                    }}
                    className={`absolute -left-[2.1rem] w-[1.35rem] h-[1.35rem] rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                      isPast 
                        ? "text-white" 
                        : (isActive 
                            ? "bg-white border-[#E5613D] dark:bg-slate-900" 
                            : "bg-[#FBF5F4] dark:bg-[#0F1216] border-[#EBE3E2] dark:border-slate-700")
                    }`}
                  >
                    {isPast ? (
                      <span className="text-[9px] font-black">✓</span>
                    ) : (
                      <span 
                        style={{ backgroundColor: isActive ? primaryColor : undefined }}
                        className={`w-2 h-2 rounded-full ${isActive ? "animate-pulse" : "bg-[#EBE3E2] dark:bg-slate-700"}`} 
                      />
                    )}
                  </div>

                  {/* Step Text Info */}
                  <div className="pt-0.5">
                    <h4 className={`text-[13px] transition-colors ${
                      isActive ? "text-[#3C2C28] dark:text-white font-black" : (isPast ? "text-[#3C2C28]/80 dark:text-slate-300 font-bold" : "text-[#8E7C77] dark:text-slate-500 font-semibold")
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-[10px] mt-0.5 font-medium ${isActive ? "text-[#8E7C77] dark:text-slate-400" : "text-[#8E7C77]/60 dark:text-slate-600"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized summary receipt */}
        <div className="bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 p-6 rounded-[2rem] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#F3ECEB] dark:border-slate-800/80 pb-4">
            <h3 className="font-black text-[11px] text-[#8E7C77] dark:text-slate-400 uppercase tracking-widest">Receipt</h3>
            <span className="text-[10px] bg-[#F3ECEB] dark:bg-slate-800 text-[#8E7C77] dark:text-slate-300 font-bold px-2 py-0.5 rounded-md">
              {order.items.length} {order.items.length === 1 ? "dish" : "dishes"}
            </span>
          </div>

          <div className="divide-y divide-[#F3ECEB] dark:divide-slate-800/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[13px] text-[#3C2C28] dark:text-slate-200">{item.name}</h4>
                    <span className="text-[9px] font-black text-[#8E7C77] px-1.5 py-0.5 bg-[#F3ECEB] dark:bg-slate-800 rounded-md">
                      x{item.quantity}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-[#8E7C77] font-medium flex items-start gap-1">
                      <span className="opacity-60 text-xs">↳</span> Note: {item.notes}
                    </p>
                  )}
                </div>
                <span className="font-black text-[13px] text-[#3C2C28] dark:text-white shrink-0">
                  {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-[#F3ECEB] dark:border-slate-800/80 pt-4 mt-2">
            <span className="text-[11px] font-black text-[#8E7C77] dark:text-slate-400 uppercase tracking-widest">Total Bill</span>
            <span style={{ color: primaryColor }} className="text-xl font-black tracking-tight">
              {currencySymbol}{order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Bottom CTA */}
        <div className="space-y-4 pt-4 pb-2">
          <button
            onClick={() => router.push(`/restaurant/${restaurantId}/table/${tableNumber}`)}
            className="w-full h-12 bg-white dark:bg-slate-800 text-[#3C2C28] dark:text-white font-black text-[11px] uppercase tracking-wider rounded-full border border-[#EBE3E2] dark:border-slate-700 shadow-sm hover:shadow-md active:scale-95 transition-all"
          >
            Order More Dishes
          </button>
          
          <div className="text-center text-[10px] text-[#8E7C77] font-semibold px-4 leading-relaxed">
            Need help? Speak with a staff member at the counter or wave down the captain.
          </div>
        </div>

      </div>
    </div>
  );
}

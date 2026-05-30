"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

interface OrderDoc {
  id: string;
  restaurantId: string;
  tableNumber: number;
  items: OrderItem[];
  status: string; // 'pending' | 'preparing' | 'ready' | 'completed'
  paymentStatus: string;
  total: number;
  createdAt: any;
}

interface RestaurantDetails {
  name: string;
  currencySymbol: string;
  phone: string;
  branding?: {
    primaryColor?: string;
  };
}

export default function TableOrdersPage({
  params
}: {
  params: Promise<{ restaurantId: string; tableNumber: string }>;
}) {
  const resolvedParams = React.use(params);
  const { restaurantId, tableNumber } = resolvedParams;

  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBillRequested, setIsBillRequested] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("restaurantId", "==", restaurantId),
      where("tableNumber", "==", Number(tableNumber))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders: OrderDoc[] = [];
        snapshot.forEach((docSnap) => {
          fetchedOrders.push({ id: docSnap.id, ...docSnap.data() } as OrderDoc);
        });
        
        // Sort descending by creation time
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });

        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore orders subscription failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [restaurantId, tableNumber]);

  const primaryColor = restaurant?.branding?.primaryColor || "#E5613D";
  const currencySymbol = restaurant?.currencySymbol || "₹";

  const grandTotal = orders.reduce((sum, order) => sum + order.total, 0);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleRequestBill = async () => {
    setIsBillRequested(true);
    // In a counter-pay model, we don't necessarily need to ping the waiter, 
    // but we can set a local state to show the user they should proceed.
    setTimeout(() => {
      setIsBillRequested(false);
    }, 8000);
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "pending": return { label: "Received", color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400" };
      case "preparing": return { label: "Preparing", color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400" };
      case "ready": return { label: "Ready to Serve", color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" };
      case "completed": return { label: "Completed", color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400" };
      default: return { label: status, color: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400" };
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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FBF5F4] dark:bg-[#0F1216] relative pb-32 font-sans">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full opacity-[0.03] dark:opacity-[0.05] blur-[80px]" style={{ backgroundColor: primaryColor }} />
        <div className="absolute bottom-[20%] left-[-15%] w-[250px] h-[250px] rounded-full opacity-[0.02] dark:opacity-[0.03] blur-[70px]" style={{ backgroundColor: primaryColor }} />
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
              href={`/restaurant/${restaurantId}/table/${tableNumber}`}
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
              My Plate
            </h1>
            <p className="text-[11px] text-[#8E7C77] dark:text-slate-300 font-bold uppercase tracking-wider mt-0.5 drop-shadow-md">Table {tableNumber}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-4 relative z-10">
        {orders.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm border border-[#EBE3E2] dark:border-slate-700">
              <span className="text-3xl">🍽️</span>
            </div>
            <div>
              <h2 className="font-black text-[17px] text-[#3C2C28] dark:text-white">Your Plate is Empty</h2>
              <p className="text-[11px] text-[#8E7C77] mt-1 font-medium px-6 leading-relaxed">It looks like your table hasn't placed any orders yet. Ready to taste something amazing?</p>
            </div>
            <button
              onClick={() => router.push(`/restaurant/${restaurantId}/table/${tableNumber}`)}
              style={{ backgroundColor: primaryColor }}
              className="mt-6 px-8 h-12 rounded-full text-white font-black text-[11px] uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const statusDisplay = getStatusDisplay(order.status);
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Link 
                  key={order.id}
                  href={`/restaurant/${restaurantId}/table/${tableNumber}/track/${order.id}`}
                  className="block bg-white dark:bg-[#161A22] rounded-[1.5rem] p-5 border border-[#EBE3E2] dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  {/* Subtle top color bar based on status */}
                  {order.status !== 'completed' && (
                    <div 
                      className={`absolute top-0 left-0 right-0 h-1 opacity-50 ${statusDisplay.color.split(' ')[0]}`}
                    />
                  )}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black text-[#8E7C77] uppercase tracking-widest">Order #{order.id.substring(0, 6)}</span>
                        {idx === 0 && order.status !== 'completed' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-black text-lg text-[#3C2C28] dark:text-white tracking-tight">
                          {currencySymbol}{order.total.toFixed(2)}
                        </h3>
                        <span className="text-[11px] text-[#8E7C77] font-bold bg-[#FBF5F4] dark:bg-slate-800 px-2 py-0.5 rounded-md border border-[#EBE3E2] dark:border-slate-700/50">
                          {itemCount} items
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#8E7C77] dark:text-slate-400 font-semibold line-clamp-1 border-t border-[#F3ECEB] dark:border-slate-800/80 pt-3 relative z-10">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                  </div>
                  
                  {/* Hover visual cue */}
                  <div className="absolute right-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E7C77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Billing Section */}
      {orders.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-[#161A22]/95 backdrop-blur-xl border-t border-[#EBE3E2] dark:border-slate-800 p-5 pb-8 z-30 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4 px-2">
            <div>
              <span className="text-[11px] font-black text-[#8E7C77] dark:text-slate-400 uppercase tracking-widest">Total Table Bill</span>
              <p className="text-[10px] font-semibold text-[#8E7C77]/70 dark:text-slate-500 mt-0.5">Across {orders.length} {orders.length === 1 ? "order" : "orders"}</p>
            </div>
            <h2 style={{ color: primaryColor }} className="text-2xl font-black tracking-tight">
              {currencySymbol}{grandTotal.toFixed(2)}
            </h2>
          </div>
          
          <button
            onClick={handleRequestBill}
            disabled={isBillRequested}
            className={`w-full h-14 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all border ${
              isBillRequested 
                ? "bg-emerald-500 text-white border-emerald-400" 
                : "bg-[#3C2C28] dark:bg-white text-white dark:text-[#3C2C28] border-transparent hover:scale-[1.01] active:scale-[0.98]"
            }`}
          >
            {isBillRequested ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Proceed to Counter
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                Pay at Counter
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

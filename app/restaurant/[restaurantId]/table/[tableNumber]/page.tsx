"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { HeaderSkeletonLoader, MenuSkeletonLoader } from "@/components/SkeletonLoader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { FoodCard } from "@/components/FoodCard";
import { CartModal } from "@/components/CartModal";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface RestaurantData {
  name: string;
  logoUrl: string;
  currencySymbol: string;
  taxRate: number;
  branding?: {
    primaryColor?: string;
  };
}

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  veg: boolean;
}

interface PageProps {
  params: Promise<{
    restaurantId: string;
    tableNumber: string;
  }>;
}

export default function CustomerMenuPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { restaurantId, tableNumber } = resolvedParams;

  const { cartItems, total, addToCart, updateQuantity } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Interactive Waiter/Service States
  const [isWaiterCalled, setIsWaiterCalled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<string | null>("WELCOME10");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const restDocRef = doc(db, "restaurants", restaurantId);
        const restSnap = await getDoc(restDocRef);
        
        let restData: RestaurantData = {
          name: "Malabar Cafe & Grill",
          logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
          currencySymbol: "₹",
          taxRate: 0.05
        };

        if (restSnap.exists()) {
          restData = restSnap.data() as RestaurantData;
          setRestaurant(restData);
        } else {
          setRestaurant(restData);
        }

        const menuQuery = query(
          collection(db, "menu"),
          where("restaurantId", "==", restaurantId)
        );
        const menuSnap = await getDocs(menuQuery);
        const items: MenuItemData[] = [];
        const catsSet = new Set<string>(["All"]);

        menuSnap.forEach((docSnap) => {
          const item = { id: docSnap.id, ...docSnap.data() } as MenuItemData;
          items.push(item);
          if (item.category) {
            catsSet.add(item.category);
          }
        });

        items.sort((a, b) => {
          if (a.available === b.available) {
            return a.name.localeCompare(b.name);
          }
          return a.available ? -1 : 1;
        });

        setMenuItems(items);
        setCategories(Array.from(catsSet));
      } catch (err) {
        console.error("Error loading restaurant menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleCallWaiter = () => {
    setIsWaiterCalled(true);
    setToastMessage("🛎️ Bell Rung! The captain is heading to Table " + tableNumber + " with a warm smile.");
    setTimeout(() => {
      setIsWaiterCalled(false);
    }, 6000);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const primaryColor = restaurant?.branding?.primaryColor || "#E5613D";
  const currencySymbol = restaurant?.currencySymbol || "₹";

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesDiet = 
      dietFilter === "all" ||
      (dietFilter === "veg" && item.veg) ||
      (dietFilter === "non-veg" && !item.veg);

    return matchesSearch && matchesCategory && matchesDiet;
  });

  // Extract Chef Recommendations
  const recommendations = menuItems.filter(item => item.available).slice(0, 3);

  const totalCartCount = cartItems.reduce((acc, x) => acc + x.quantity, 0);

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-[#FBF5F4] to-[#F5ECEB] dark:from-[#0F1216] dark:to-[#141920] min-h-screen relative pb-32 font-sans selection:bg-[#E5613D]/10 selection:text-[#E5613D] overflow-hidden">
      
      {/* Background Decorative Blob Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[-25%] w-72 h-72 rounded-full bg-[#E5613D]/5 dark:bg-[#FF7A00]/5 blur-[80px] animate-float-1" />
        <div className="absolute top-[50%] right-[-25%] w-80 h-80 rounded-full bg-[#8E7C77]/6 dark:bg-[#334155]/6 blur-[90px] animate-float-2" />
        <div className="absolute bottom-[15%] left-[-15%] w-64 h-64 rounded-full bg-[#E5613D]/4 dark:bg-[#FF7A00]/4 blur-[70px] animate-float-3" />
      </div>

      {/* Immersive Parallax Header Banner */}
      <div className="relative h-56 w-full overflow-hidden bg-[#3C2C28]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#3C2C28]/95 via-[#3C2C28]/40 to-black/35 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80" 
          alt="Restaurant Banner"
          className="w-full h-full object-cover scale-105"
        />
        
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          {/* Back button */}
          <a 
            href="/" 
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 active:scale-95 transition-all duration-200 border border-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </a>
          
          <div className="flex gap-2.5 items-center">
            {/* ── Call Waiter Button ── */}
            <button
              onClick={handleCallWaiter}
              className={`h-9 rounded-full backdrop-blur-md flex items-center gap-2 text-white text-[11px] font-semibold tracking-wide transition-all duration-300 border ${
                isWaiterCalled 
                  ? "pl-3 pr-4 bg-emerald-600/90 border-emerald-500/50" 
                  : "pl-3 pr-4 bg-black/30 border-white/10 hover:bg-black/40 active:scale-95"
              }`}
            >
              {isWaiterCalled ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              )}
              <span className="leading-none">
                {isWaiterCalled ? "Captain Notified" : "Call Waiter"}
              </span>
            </button>

            {/* ── Theme Toggle Button ── */}
            <button 
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 active:scale-95 transition-all duration-300 border border-white/10"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <div className={`transition-all duration-500 ${isDarkMode ? "rotate-180" : "rotate-0"}`}>
                {isDarkMode ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>


        {/* Brand details overlay (Sleek Culinary Style) */}
        <div className="absolute bottom-5 left-4 right-4 z-20 flex items-end gap-4">
          {restaurant?.logoUrl && (
            <img 
              src={restaurant.logoUrl} 
              alt={restaurant.name} 
              className="w-16 h-16 rounded-[1.4rem] object-cover border border-white/25 shadow-md bg-white shrink-0 animate-pulse-warm"
            />
          )}
          <div className="space-y-1 text-white">
            <h1 className="font-black text-lg tracking-tight leading-none">{restaurant?.name}</h1>
            <div className="flex items-center gap-2 text-[9px] font-bold text-white/80 uppercase tracking-widest select-none">
              <span>Table {tableNumber}</span>
              <span>•</span>
              <span className="text-[#FF8E6E] font-black">★ 4.9 (1.2k+ reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Live Promotional Coupon Ticker */}
      {activeCoupon && (
        <div className="bg-[#E5613D] text-white py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-wider flex justify-between items-center select-none shadow-sm relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
          <span>💝 Code <strong className="underline">{activeCoupon}</strong> applied: Enjoy a complimentary 10% discount!</span>
          <button 
            onClick={() => setActiveCoupon(null)}
            className="text-[9px] font-bold opacity-80 hover:opacity-100 pl-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="px-4 pt-4 space-y-5">
        {loading ? (
          <div className="space-y-6">
            <HeaderSkeletonLoader />
            <MenuSkeletonLoader />
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Search & Custom Diet Filters */}
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E7C77] dark:text-slate-500 transition-colors group-focus-within:text-[#E5613D] pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full h-11 rounded-2xl bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 pl-10 pr-10 text-[13px] font-semibold outline-none focus:border-[#E5613D] focus:shadow-[0_0_0_3px_rgba(229,97,61,0.1)] dark:focus:border-[#FF7A00] dark:focus:shadow-[0_0_0_3px_rgba(255,122,0,0.1)] transition-all text-[#3C2C28] dark:text-white placeholder:text-[#B8A9A5] dark:placeholder:text-slate-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#EBE3E2] dark:bg-slate-700 flex items-center justify-center text-[#8E7C77] hover:bg-[#E5613D] hover:text-white transition-all text-[10px]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Diet Choice Pills */}
              <div className="flex gap-2 select-none">
                {[
                  { key: "all", label: "All", icon: "✦" },
                  { key: "veg", label: "Veg", icon: "🌿" },
                  { key: "non-veg", label: "Non-Veg", icon: "🍗" }
                ].map((pill) => {
                  const isActive = dietFilter === pill.key;
                  return (
                    <button
                      key={pill.key}
                      onClick={() => setDietFilter(pill.key as any)}
                      className={`flex items-center gap-1.5 px-4 h-9 rounded-2xl text-[11px] font-extrabold tracking-wide transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "bg-[#E5613D] text-white shadow-md shadow-[#E5613D]/20 dark:bg-[#FF7A00] dark:shadow-[#FF7A00]/20"
                          : "bg-white dark:bg-[#161A22] text-[#8E7C77] dark:text-slate-400 border border-[#EBE3E2] dark:border-slate-800 hover:border-[#E5613D]/30 dark:hover:border-[#FF7A00]/30"
                      }`}
                    >
                      <span className="text-[13px]">{pill.icon}</span>
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Premium Section 1: Chef's Horizontal Recommendation Carousel */}
            {selectedCategory === "All" && searchQuery === "" && recommendations.length > 0 && (
              <div className="space-y-3 select-none">
                <div className="flex justify-between items-center pl-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E5613D] flex items-center gap-1.5">
                    💝 Handcrafted Chef Choices
                  </h3>
                  <span className="text-[9px] font-bold text-[#8E7C77] uppercase tracking-wide">Specials</span>
                </div>
                
                <div className="overflow-x-auto no-scrollbar flex gap-4 -mx-4 px-4 pb-2.5">
                  {recommendations.map((item) => {
                    const cartItem = cartItems.find(x => x.menuId === item.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    
                    return (
                      <div 
                        key={item.id} 
                        className="w-48 bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 rounded-[2rem] p-3.5 shrink-0 shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)] space-y-3 relative hover:translate-y-[-2px] hover:border-[#E5613D]/25 transition-all duration-200"
                      >
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          <span className={`absolute top-2.5 left-2.5 w-2 h-2 rounded-full border border-white ${
                            item.veg ? "bg-green-600" : "bg-red-600"
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-[11px] text-[#3C2C28] dark:text-slate-100 line-clamp-1">{item.name}</h4>
                          <p className="text-[9px] text-[#8E7C77] font-semibold leading-relaxed line-clamp-2">{item.description}</p>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-[#F3ECEB] dark:border-slate-800 pt-2.5 shrink-0">
                          <span className="font-black text-xs text-[#3C2C28] dark:text-white">₹{item.price.toFixed(0)}</span>
                          
                          {qty > 0 && cartItem ? (
                            <div className="flex items-center bg-[#E5613D] text-white rounded-lg px-1 h-6 font-bold text-[10px]">
                              <button 
                                onClick={() => updateQuantity(cartItem.cartItemId, qty - 1)}
                                className="w-4 text-center"
                              >
                                −
                              </button>
                              <span className="w-4 text-center text-[9px]">{qty}</span>
                              <button 
                                onClick={() => updateQuantity(cartItem.cartItemId, qty + 1)}
                                className="w-4 text-center"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, veg: item.veg })}
                              className="text-[9px] font-black uppercase tracking-wider text-[#E5613D] bg-[#E5613D]/8 px-2.5 py-1 rounded-lg hover:bg-[#E5613D] hover:text-white transition-all"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reassuring micro-copy text banner under categories */}
            <div className="py-1 flex items-center justify-center gap-1.5 text-[10px] text-[#8E7C77] font-semibold select-none">
              <span>🕊️</span>
              <span>Prepared fresh with love and local organic ingredients by our kitchen team.</span>
            </div>

            {/* Category Tabs */}
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              primaryColor={primaryColor}
            />

            {/* Culinary Catalog Grid */}
            <div>
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-20 space-y-3 select-none">
                  <span className="text-5xl block">🧑‍🍳</span>
                  <p className="font-black text-base text-[#3C2C28] dark:text-slate-200">No dishes found</p>
                  <p className="text-[12px] text-[#8E7C77] font-semibold px-8 leading-relaxed">
                    Try a different search or switch categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredMenuItems.map((item) => (
                    <FoodCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      imageUrl={item.imageUrl}
                      veg={item.veg}
                      available={item.available}
                      currencySymbol={currencySymbol}
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Sticky Bottom Controls Container */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-[#161A22]/95 backdrop-blur-xl border-t border-[#EBE3E2] dark:border-slate-800 p-5 pb-8 z-40 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col gap-3">
        {/* Floating Bottom Cart Bar (Ultra-Premium Signature Heartbeat Dock) */}
        {!loading && totalCartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ backgroundColor: primaryColor }}
            className="w-full h-14 rounded-[1.8rem] text-white font-black text-xs uppercase tracking-widest flex justify-between items-center px-6 shadow-[0_20px_40px_rgba(229,97,61,0.25)] hover:shadow-[0_24px_48px_rgba(229,97,61,0.35)] hover:scale-[1.01] active:scale-[0.98] transition-all animate-bounce-subtle border border-white/10 shrink-0"
          >
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#E5613D] w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[10px] font-black">{totalCartCount}</span>
              <span>Review Table Cart</span>
            </div>
            <div className="flex items-center gap-1.5 font-black">
              <span>{currencySymbol}{total.toFixed(2)}</span>
              <span>→</span>
            </div>
          </button>
        )}

        {/* My Plate & Bill Button */}
        <Link 
          href={`/restaurant/${restaurantId}/table/${tableNumber}/orders`}
          className="w-full h-14 rounded-[1.8rem] bg-[#3C2C28] dark:bg-white text-white dark:text-[#3C2C28] shadow-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.98] transition-all border border-transparent"
        >
          <span className="text-lg leading-none">🍽️</span>
          <span>My Plate & Bill</span>
        </Link>
      </div>

      {/* Cart Modal Bottom Sheet */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurantId={restaurantId}
        tableNumber={tableNumber}
        restaurantName={restaurant?.name || "Malabar Cafe"}
        currencySymbol={currencySymbol}
        primaryColor={primaryColor}
      />

      {/* Premium Ambient Notification Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-4 right-4 max-w-sm mx-auto z-50 animate-bounce-subtle">
          <div className="bg-white/95 dark:bg-[#161A22]/95 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-400/30 rounded-[1.8rem] p-3.5 shadow-[0_20px_40px_rgba(16,185,129,0.12)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 text-lg">
              🛎️
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Captain Summoned</h4>
              <p className="text-[11px] text-[#3C2C28] dark:text-slate-200 font-semibold leading-snug">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

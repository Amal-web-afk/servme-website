"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [restaurantId, setRestaurantId] = useState("malabar-cafe");
  const [tableNumber, setTableNumber] = useState("4");
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const router = useRouter();

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId.trim() || !tableNumber.trim()) return;
    router.push(`/restaurant/${restaurantId.trim().toLowerCase()}/table/${tableNumber.trim()}`);
  };

  // Instant pre-fill options for the interactive sandbox
  const handleQuickSelect = (restId: string, tableNo: string) => {
    setRestaurantId(restId);
    setTableNumber(tableNo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF5F4] to-[#F5ECEB] dark:from-[#0F1216] dark:to-[#141920] text-[#3C2C28] dark:text-slate-100 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#E5613D]/10 selection:text-[#E5613D] relative overflow-hidden">
      
      {/* Decorative Elegant Blur */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E5613D]/5 blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E5613D] text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-[#E5613D]/10 select-none">
            s
          </div>
          <span className="text-lg font-black tracking-tight text-[#3C2C28] dark:text-white">
            servme
          </span>
        </div>
        <a 
          href="/owner" 
          className="text-xs font-bold tracking-wide text-[#3C2C28] dark:text-slate-200 hover:text-[#E5613D] transition-colors border-b border-[#3C2C28] dark:border-slate-200 hover:border-[#E5613D] pb-0.5"
        >
          Partner Portal
        </a>
      </header>

      {/* Main Interactive Workspace */}
      <main className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center my-auto py-12 z-10">
        
        {/* Left Column: Bold Human Editorial Headline */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5613D]/8 border border-[#E5613D]/12 text-[#E5613D] text-[10px] font-bold uppercase tracking-widest select-none">
            ● Live Dining Network
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-[#3C2C28] dark:text-white">
            Dine-in. <br />
            Redefined.
          </h1>
          
          <p className="text-sm md:text-base text-[#8E7C77] dark:text-slate-400 font-medium leading-relaxed max-w-md">
            Scan your table QR code to browse our hand-drawn interactive menus, customize dishes with direct kitchen notes, and track your order's journey from prep to plate.
          </p>

          {/* Clean human highlights */}
          <div className="grid grid-cols-2 gap-4 max-w-xs pt-4 select-none">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#3C2C28] dark:text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 flex items-center justify-center text-[10px]">📱</span>
              No app required
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#3C2C28] dark:text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 flex items-center justify-center text-[10px]">🧑‍🍳</span>
              Realtime KDS sync
            </div>
          </div>
        </div>

        {/* Right Column: Elegant Dashboard Hub (Interactive) */}
        <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-start">
          
          {/* Card 1: Handcrafted Mock Interactive Menu Card */}
          <div className="hidden md:block md:col-span-5 bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 rounded-[2rem] p-5 shadow-[0_16px_36px_-12px_rgba(60,44,40,0.04)] space-y-4 hover:translate-y-[-2px] transition-all duration-300 group select-none">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80" 
                alt="Signature Biryani"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-green-500 text-white text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Veg
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xs text-[#3C2C28] dark:text-slate-200 leading-tight">Signature Biryani</h3>
              <p className="text-[10px] text-[#8E7C77] leading-relaxed line-clamp-2">Slow-cooked fragrant kaima rice layered with saffron...</p>
            </div>
            <div className="flex justify-between items-center border-t border-[#F3ECEB] dark:border-slate-800 pt-2.5">
              <span className="font-black text-xs text-[#3C2C28] dark:text-white">₹240.00</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-[#E5613D] bg-[#E5613D]/8 px-2 py-1 rounded-lg">Add to Cart</span>
            </div>
          </div>

          {/* Card 2: Main Dynamic Table QR Form Card */}
          <div className="md:col-span-7 bg-white dark:bg-[#161A22] border border-[#EBE3E2] dark:border-slate-800 rounded-[2.2rem] p-7 shadow-[0_24px_48px_-12px_rgba(60,44,40,0.06)] relative w-full">
            
            <div className="space-y-6">
              
              <div>
                <h2 className="text-lg font-black text-[#3C2C28] dark:text-white">Table QR Portal</h2>
                <p className="text-xs text-[#8E7C77] dark:text-slate-400 font-semibold mt-0.5">
                  Connect and start ordering
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLaunch} className="space-y-4">
                
                {/* Input 1: Restaurant ID */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">
                    Restaurant Code
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    isFocused === "rest" 
                      ? "border-[#E5613D] bg-white dark:bg-[#0F1216]" 
                      : "border-[#EBE3E2] dark:border-slate-800 bg-[#FBF5F4]/30 dark:bg-slate-900/10"
                  }`}>
                    <input
                      type="text"
                      value={restaurantId}
                      onChange={(e) => setRestaurantId(e.target.value)}
                      onFocus={() => setIsFocused("rest")}
                      onBlur={() => setIsFocused(null)}
                      placeholder="e.g. malabar-cafe"
                      className="w-full h-11 bg-transparent outline-none px-4 text-xs font-extrabold tracking-wide text-[#3C2C28] dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Input 2: Table Number */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">
                    Table Number
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-200 ${
                    isFocused === "table" 
                      ? "border-[#E5613D] bg-white dark:bg-[#0F1216]" 
                      : "border-[#EBE3E2] dark:border-slate-800 bg-[#FBF5F4]/30 dark:bg-slate-900/10"
                  }`}>
                    <input
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      onFocus={() => setIsFocused("table")}
                      onBlur={() => setIsFocused(null)}
                      placeholder="e.g. 4"
                      min="1"
                      className="w-full h-11 bg-transparent outline-none px-4 text-xs font-extrabold tracking-wide text-[#3C2C28] dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#E5613D] hover:bg-[#DC2E1E] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#E5613D]/10 hover:shadow-lg hover:shadow-[#E5613D]/15 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 pt-0.5"
                >
                  <span>Launch Menu</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </form>

              {/* Fully Interactive Sandbox Demo Helper */}
              <div className="pt-4 border-t border-[#F3ECEB] dark:border-slate-800 space-y-2.5">
                <h4 className="text-[9px] uppercase font-black text-[#E5613D] tracking-wider">
                  ⚡ Interactive Sandbox Selectors
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickSelect("malabar-cafe", "4")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      restaurantId === "malabar-cafe" && tableNumber === "4"
                        ? "bg-[#E5613D] text-white border-[#E5613D] shadow-sm shadow-[#E5613D]/10"
                        : "bg-[#FBF5F4]/50 dark:bg-slate-900/10 text-[#8E7C77] hover:text-[#3C2C28] dark:hover:text-slate-200 border-[#EBE3E2] dark:border-slate-800"
                    }`}
                  >
                    Malabar Cafe (Table 4)
                  </button>
                  <button
                    onClick={() => handleQuickSelect("malabar-cafe", "2")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                      restaurantId === "malabar-cafe" && tableNumber === "2"
                        ? "bg-[#E5613D] text-white border-[#E5613D] shadow-sm shadow-[#E5613D]/10"
                        : "bg-[#FBF5F4]/50 dark:bg-slate-900/10 text-[#8E7C77] hover:text-[#3C2C28] dark:hover:text-slate-200 border-[#EBE3E2] dark:border-slate-800"
                    }`}
                  >
                    Malabar Cafe (Table 2)
                  </button>
                </div>
                <p className="text-[10px] text-[#8E7C77] leading-relaxed pl-0.5">
                  Click any selector above to instantly pre-fill credentials connected to our live Firebase active datasets!
                </p>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* Handcrafted Editorial Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center py-6 border-t border-[#EBE3E2] dark:border-slate-900 gap-4 text-center sm:text-left select-none text-[10px] text-[#8E7C77] font-bold">
        <span>
          © {new Date().getFullYear()} servme. Handcrafted hospitality.
        </span>
        <span>
          Bespoke POS & QR Ordering Suite
        </span>
      </footer>

    </div>
  );
}

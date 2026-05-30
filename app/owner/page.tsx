"use client";
import React, { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
  Timestamp,
  writeBatch 
} from "firebase/firestore";

interface Restaurant {
  id: string;
  name: string;
  currencySymbol: string;
  taxRate: number;
  upiVpa: string;
  address: string;
  phone: string;
  logoUrl?: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId: string;
}

interface Payment {
  id: string;
  restaurantId: string;
  tableNumber: number;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: any;
}

export default function OwnerPortal() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<"shops" | "staff" | "ledger" | "qr">("shops");

  // QR Form State
  const [qrShopId, setQrShopId] = useState("");
  const [tableCount, setTableCount] = useState<number>(10);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<{tableNumber: number, url: string}[]>([]);
  const [printTarget, setPrintTarget] = useState<number | null>(null);

  // Shop Form State
  const [shopId, setShopId] = useState("");
  const [shopName, setShopName] = useState("");
  const [upiVpa, setUpiVpa] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currencySymbol] = useState("₹");
  const [taxRate, setTaxRate] = useState(0.05);

  // Staff Form State
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("kitchen");
  const [selectedShopId, setSelectedShopId] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Real-time listeners
  useEffect(() => {
    const unsubRestaurants = onSnapshot(collection(db, "restaurants"), (snap) => {
      const list: Restaurant[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Restaurant));
      setRestaurants(list);
      if (list.length > 0 && !selectedShopId) {
        setSelectedShopId(list[0].id);
      }
    });

    const unsubStaff = onSnapshot(collection(db, "users"), (snap) => {
      const list: Staff[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({ id: d.id, name: data.name || "", email: data.email || "", role: data.role || "", restaurantId: data.restaurantId || "" });
      });
      setStaffList(list);
    });

    const unsubPayments = onSnapshot(collection(db, "payments"), (snap) => {
      const list: Payment[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Payment));
      list.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });
      setPayments(list);
    });

    return () => {
      unsubRestaurants();
      unsubStaff();
      unsubPayments();
    };
  }, []);

  const showStatus = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId.trim() || !shopName.trim()) return;

    setLoading(true);
    const cleanedId = shopId.trim().toLowerCase().replace(/\s+/g, "-");

    try {
      const shopRef = doc(db, "restaurants", cleanedId);
      await setDoc(shopRef, {
        name: shopName.trim(),
        currency: "INR",
        currencySymbol: currencySymbol,
        taxRate: Number(taxRate),
        upiVpa: upiVpa.trim(),
        address: address.trim(),
        phone: phone.trim(),
        logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
        createdAt: Timestamp.now()
      });

      showStatus(`Shop "${shopName}" created successfully! ID: ${cleanedId}`);
      setShopId("");
      setShopName("");
      setUpiVpa("");
      setPhone("");
      setAddress("");
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || "Failed to create shop.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !selectedShopId) return;

    setLoading(true);
    const cleanedEmail = staffEmail.trim().toLowerCase();

    try {
      const defaultPin = staffRole === "kitchen" ? "1001" : staffRole === "cashier" ? "1002" : "1003";
      const userRef = doc(db, "users", cleanedEmail);
      await setDoc(userRef, {
        name: staffName.trim(),
        email: cleanedEmail,
        role: staffRole,
        restaurantId: selectedShopId,
        phone: "+91 90000 00000",
        pin: defaultPin,
        isActive: true,
        createdAt: Timestamp.now()
      });

      showStatus(`Staff "${staffName}" onboarded to Shop "${selectedShopId}"!`);
      setStaffName("");
      setStaffEmail("");
    } catch (err: any) {
      console.error(err);
      showStatus(err.message || "Failed to register staff.", true);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabaseJIT = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const restRef = doc(db, "restaurants", "malabar-cafe");
      batch.set(restRef, {
        name: "Malabar Cafe & Grill",
        logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
        currency: "INR",
        currencySymbol: "₹",
        taxRate: 0.05,
        branding: {
          primaryColor: "#E5613D"
        }
      });

      const menuItems = {
        "menu_shawarma_01": {
          restaurantId: "malabar-cafe",
          name: "Classic Rumali Shawarma",
          description: "Flame-grilled slow-roasted chicken cubes, tightly rolled in warm soft rumali roti with thick garlic paste.",
          price: 130.00,
          category: "Shawarma",
          imageUrl: "https://images.unsplash.com/photo-1644704170910-a0cdf183649b?w=400&auto=format&fit=crop&q=80",
          available: true,
          veg: false
        },
        "menu_shawarma_02": {
          restaurantId: "malabar-cafe",
          name: "Spicy Whole-Meat Shawarma Roll",
          description: "Loaded with roasted chicken cubes and green chillies, wrapped with garlic mayonnaise. No veggies added.",
          price: 160.00,
          category: "Shawarma",
          imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80",
          available: true,
          veg: false
        },
        "menu_rice_01": {
          restaurantId: "malabar-cafe",
          name: "Kozhikode Chicken Biryani",
          description: "Traditional aromatic kaima rice biryani layered with tender marinated chicken, fried onions, raisins, and rich ghee.",
          price: 240.00,
          category: "Rice",
          imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
          available: true,
          veg: false
        },
        "menu_drinks_01": {
          restaurantId: "malabar-cafe",
          name: "Fresh Lime Mint Cooler",
          description: "Refreshing iced cooler crushed with fresh local lime, spearmint leaves, and cane sugar syrup.",
          price: 50.00,
          category: "Drinks",
          imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80",
          available: true,
          veg: true
        }
      };

      for (const [menuId, mData] of Object.entries(menuItems)) {
        batch.set(doc(db, "menu", menuId), mData);
      }

      await batch.commit();
      showStatus("Sandbox database seeded successfully!");
    } catch (err: any) {
      console.error(err);
      showStatus("Failed to seed database.", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF5F4] to-[#F5ECEB] text-[#3C2C28] font-sans selection:bg-[#E5613D]/10 selection:text-[#E5613D] flex flex-col">
      
      {/* Upper Navigation Header */}
      <header className="w-full bg-white border-b border-[#EBE3E2] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E5613D] text-white flex items-center justify-center font-extrabold text-sm">
              s
            </div>
            <span className="text-base font-black tracking-tight">servme Owner Studio</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={seedDatabaseJIT}
              disabled={loading}
              className="text-[10px] font-black uppercase tracking-wider text-[#E5613D] bg-[#E5613D]/8 px-3.5 py-2 rounded-xl hover:bg-[#E5613D]/12 active:scale-95 transition-all select-none"
            >
              🌱 Seed Sandbox
            </button>
            <a 
              href="/" 
              className="text-xs font-bold text-[#8E7C77] hover:text-[#3C2C28] transition-colors"
            >
              ← Back to Web
            </a>
          </div>
        </div>
      </header>

      {/* Main SaaS Dashboard Layout */}
      <div className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sleek Nav Dock Menu */}
        <aside className="lg:col-span-3 space-y-4 print:hidden">
          <div className="bg-white border border-[#EBE3E2] rounded-[1.8rem] p-4 shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)] space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#8E7C77] pl-3 mb-2 block select-none">
              Console Dock
            </span>
            {[
              { key: "shops", label: "Shop Registry", icon: "🏪" },
              { key: "staff", label: "Staff Registry", icon: "👥" },
              { key: "ledger", label: "Ledger Streams", icon: "📊" },
              { key: "qr", label: "QR Tables", icon: "🔳" }
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-extrabold tracking-wide transition-all ${
                    isActive 
                      ? "bg-[#E5613D] text-white shadow-sm shadow-[#E5613D]/10" 
                      : "text-[#8E7C77] hover:text-[#3C2C28] hover:bg-[#FBF5F4]"
                  }`}
                >
                  <span className="text-sm select-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs font-bold transition-all shadow-sm ${
              statusMessage.isError 
                ? "bg-red-500/8 border-red-500/12 text-red-600" 
                : "bg-green-500/8 border-green-500/12 text-green-600"
            }`}>
              {statusMessage.isError ? "❌" : "✓"} {statusMessage.text}
            </div>
          )}
        </aside>

        {/* Right Column: Dynamic Workspace */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: SHOPS MANAGER */}
          {activeTab === "shops" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Form Card */}
              <div className="md:col-span-5 bg-white border border-[#EBE3E2] rounded-[2rem] p-6 space-y-5 shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)]">
                <h3 className="text-sm font-black text-[#3C2C28]">Register Shop</h3>
                <form onSubmit={handleCreateShop} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">Shop Unique ID</label>
                    <input
                      type="text"
                      value={shopId}
                      onChange={(e) => setShopId(e.target.value)}
                      placeholder="e.g. malabar-cafe"
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] focus:border-[#E5613D] rounded-xl outline-none px-4 text-xs font-bold text-[#3C2C28]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">Shop Name</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Malabar Cafe"
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] focus:border-[#E5613D] rounded-xl outline-none px-4 text-xs font-bold text-[#3C2C28]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">UPI VPA Merchant ID</label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. malabar@okhdfcbank"
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] focus:border-[#E5613D] rounded-xl outline-none px-4 text-xs font-bold text-[#3C2C28]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#E5613D] hover:bg-[#DC2E1E] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow active:scale-95 transition-all duration-200"
                  >
                    {loading ? "Adding..." : "Add Shop Profile"}
                  </button>
                </form>
              </div>

              {/* List Card */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-xs font-black text-[#8E7C77] uppercase tracking-widest pl-1">Active Shop Registry</h3>
                {restaurants.length === 0 ? (
                  <div className="bg-white border border-[#EBE3E2] rounded-[2rem] p-12 text-center text-xs text-[#8E7C77] font-semibold shadow-inner select-none">
                    No shops registered yet. Use the profile panel on the left to set up your first store!
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {restaurants.map((shop) => (
                      <div key={shop.id} className="bg-white border border-[#EBE3E2] rounded-[2rem] p-5 shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)] space-y-3 hover:border-[#E5613D]/25 transition-all">
                        <div className="flex justify-between items-center border-b border-[#F3ECEB] pb-2.5">
                          <h4 className="font-extrabold text-sm text-[#3C2C28]">{shop.name}</h4>
                          <span className="text-[9px] font-black uppercase bg-[#F3ECEB] text-[#8E7C77] px-2 py-0.5 rounded-md">ID: {shop.id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-[11px] text-[#8E7C77]">
                          <p><strong>Merchant UPI:</strong> {shop.upiVpa || "None"}</p>
                          <p><strong>Tax Rate:</strong> {(shop.taxRate * 100).toFixed(0)}% GST</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STAFF REGISTER */}
          {activeTab === "staff" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Form Card */}
              <div className="md:col-span-5 bg-white border border-[#EBE3E2] rounded-[2rem] p-6 space-y-5 shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)]">
                <h3 className="text-sm font-black text-[#3C2C28]">Onboard Member</h3>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">Assigned Shop</label>
                    <select
                      value={selectedShopId}
                      onChange={(e) => setSelectedShopId(e.target.value)}
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] rounded-xl outline-none px-3 text-xs font-bold text-[#3C2C28]"
                      required
                    >
                      {restaurants.map((shop) => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">Full Name</label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Chef Ramakrishnan"
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] focus:border-[#E5613D] rounded-xl outline-none px-4 text-xs font-bold text-[#3C2C28]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">Email Address</label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. chef.ram@servme.com"
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] focus:border-[#E5613D] rounded-xl outline-none px-4 text-xs font-bold text-[#3C2C28]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-wider text-[#8E7C77] pl-0.5">Privilege Level</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full h-11 bg-[#FBF5F4]/30 border border-[#EBE3E2] rounded-xl outline-none px-3 text-xs font-bold text-[#3C2C28]"
                    >
                      <option value="kitchen">Chef (KDS Dash)</option>
                      <option value="cashier">Cashier (Settle POS)</option>
                      <option value="owner">Owner Cockpit</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#E5613D] hover:bg-[#DC2E1E] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow active:scale-95 transition-all duration-200"
                  >
                    {loading ? "Onboarding..." : "Onboard Staff"}
                  </button>
                </form>
              </div>

              {/* List Column */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-xs font-black text-[#8E7C77] uppercase tracking-widest pl-1">Onboarding QR Key Registry</h3>
                {staffList.length === 0 ? (
                  <div className="bg-white border border-[#EBE3E2] rounded-[2rem] p-12 text-center text-xs text-[#8E7C77] font-semibold shadow-inner select-none">
                    No active staff registrations found. Register above to generate setup QR keys!
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {staffList.map((staff) => {
                      const payload = {
                        type: "wavepos_onboard",
                        email: staff.email,
                        restaurantId: staff.restaurantId,
                        role: staff.role
                      };
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify(payload))}`;

                      return (
                        <div key={staff.id} className="bg-white border border-[#EBE3E2] rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 items-center shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)] hover:border-[#E5613D]/25 transition-all relative overflow-hidden">
                          <div className="flex-1 space-y-3.5 text-center sm:text-left">
                            <div>
                              <h4 className="font-extrabold text-sm text-[#3C2C28]">{staff.name}</h4>
                              <p className="text-[10px] text-[#8E7C77] mt-0.5 font-bold">{staff.email}</p>
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 select-none">
                              <span className="text-[8px] font-black uppercase tracking-wider bg-[#E5613D]/8 text-[#E5613D] px-2 py-0.5 rounded-md">
                                Role: {staff.role}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-wider bg-[#F3ECEB] text-[#8E7C77] px-2 py-0.5 rounded-md">
                                Shop: {staff.restaurantId}
                              </span>
                            </div>
                            <div className="p-3 bg-[#FBF5F4] rounded-xl border border-[#EBE3E2]/60 text-[10px] text-[#8E7C77] leading-relaxed max-w-sm">
                              💡 <strong>Staffpairing Setup:</strong> Scan this QR card on the tablet's setup screen to pair in 1 second!
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-center gap-1.5">
                            <img 
                              src={qrUrl} 
                              alt="Setup QR Key" 
                              className="w-32 h-32 border border-[#EBE3E2] p-1.5 bg-white rounded-xl shadow-sm"
                            />
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#E5613D]">
                              Setup Card
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: LEDGER STREAMS */}
          {activeTab === "ledger" && (
            <div className="bg-white border border-[#EBE3E2] rounded-[2.2rem] p-6 shadow-[0_12px_24px_-10px_rgba(60,44,40,0.02)] space-y-5">
              <div className="flex justify-between items-center border-b border-[#F3ECEB] pb-4">
                <h3 className="text-sm font-black text-[#3C2C28]">Realtime Ledger Streams</h3>
                <span className="text-[10px] font-black uppercase bg-[#E5613D]/8 text-[#E5613D] px-3 py-1 rounded-xl">
                  {payments.length} Settlements
                </span>
              </div>

              {payments.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#8E7C77] font-semibold select-none">
                  No payment settlements have been recorded in the ledger yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#EBE3E2] text-[10px] font-black uppercase tracking-wider text-[#8E7C77]">
                        <th className="p-4 pl-1">Txn ID</th>
                        <th className="p-4">Shop</th>
                        <th className="p-4">Table</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Channel</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3ECEB]/60 text-xs font-semibold text-[#3C2C28]">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FBF5F4]/40 transition-colors">
                          <td className="p-4 pl-1 font-mono text-[10px] text-[#8E7C77]">#{p.id.slice(0, 10).toUpperCase()}</td>
                          <td className="p-4 font-black">{p.restaurantId}</td>
                          <td className="p-4">Table {p.tableNumber}</td>
                          <td className="p-4 font-black text-[#3C2C28]">₹{p.amount.toFixed(2)}</td>
                          <td className="p-4 font-bold uppercase tracking-wider text-[10px] text-[#8E7C77]">{p.paymentMethod || "UPI QR"}</td>
                          <td className="p-4">
                            <span className="text-[8px] font-black uppercase tracking-widest bg-green-500/8 text-green-600 px-2 py-0.5 rounded border border-green-500/12">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QR Tables Generator */}
          {activeTab === "qr" && (
            <div className="bg-white border border-[#EBE3E2] rounded-[2rem] p-6 shadow-[0_20px_40px_-10px_rgba(60,44,40,0.02)] print:border-none print:shadow-none print:p-0 print:m-0">
              
              <div className="print:hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-black text-[#3C2C28] tracking-tight">QR Table Generator</h2>
                    <p className="text-xs text-[#8E7C77] font-semibold mt-1">Generate and print QR codes for tables one by one.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-end mb-8 border-b border-[#F5ECEB] pb-8">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-[#8E7C77] uppercase tracking-widest mb-1.5 block ml-1">Target Shop</label>
                    <div className="relative">
                      <select 
                        value={qrShopId} 
                        onChange={e => setQrShopId(e.target.value)}
                        className="w-full h-12 bg-[#FBF5F4] border border-[#EBE3E2] rounded-xl px-4 text-sm font-bold text-[#3C2C28] focus:outline-none focus:ring-2 focus:ring-[#E5613D] appearance-none"
                      >
                        <option value="" disabled>Select a shop...</option>
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8E7C77]">
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <label className="text-[10px] font-black text-[#8E7C77] uppercase tracking-widest mb-1.5 block ml-1">Table Count</label>
                    <input 
                      type="number" min={1} max={100}
                      value={tableCount} 
                      onChange={e => setTableCount(Number(e.target.value))}
                      className="w-full h-12 bg-[#FBF5F4] border border-[#EBE3E2] rounded-xl px-4 text-sm font-bold text-[#3C2C28] focus:outline-none focus:ring-2 focus:ring-[#E5613D]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!qrShopId || tableCount < 1) return;
                      // Generate URLs. In production, this would use window.location.origin
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
                      const codes = Array.from({length: tableCount}).map((_, i) => ({
                        tableNumber: i + 1,
                        url: `${origin}/restaurant/${qrShopId}/table/${i + 1}`
                      }));
                      setGeneratedQRCodes(codes);
                    }}
                    disabled={!qrShopId || tableCount < 1}
                    className="h-12 px-6 rounded-xl bg-[#E5613D] text-white font-black text-[11px] uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {generatedQRCodes.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 print:block print:w-full">
                  <style>{`
                    @media print {
                      @page { margin: 0; size: portrait; }
                      body { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        margin: 0; 
                        background: white;
                      }
                      /* Hide everything else aggressively */
                      header, aside, .ConsoleDock { display: none !important; }
                    }
                  `}</style>
                  {generatedQRCodes.map((qr) => {
                    const QRCodeRenderer = require('qrcode.react').QRCodeSVG;
                    const shop = restaurants.find(r => r.id === qrShopId);
                    
                    return (
                      <div 
                        key={qr.tableNumber} 
                        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#EBE3E2] rounded-2xl relative group ${
                          printTarget !== null && printTarget !== qr.tableNumber 
                            ? 'print:hidden' 
                            : 'print:border-none print:w-[100vw] print:h-[100vh] print:fixed print:inset-0 print:bg-white print:z-[9999] print:flex print:items-center print:justify-center'
                        }`}
                      >
                        {/* Print Button (Hover only) */}
                        <button
                          onClick={() => {
                            setPrintTarget(qr.tableNumber);
                            setTimeout(() => {
                              window.print();
                              setTimeout(() => setPrintTarget(null), 100);
                            }, 50);
                          }}
                          className="absolute inset-0 bg-[#FBF5F4]/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl print:hidden z-10"
                        >
                          <span className="bg-[#E5613D] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            Print Stand
                          </span>
                        </button>

                        <div className="print:w-[12cm] print:h-[18cm] print:mx-auto print:bg-white print:border-4 print:border-[#3C2C28] print:rounded-3xl print:p-8 print:flex print:flex-col print:items-center print:justify-between">
                          {/* Header */}
                          <div className="hidden print:flex flex-col items-center mb-6 w-full">
                            {shop?.logoUrl ? (
                              <img src={shop.logoUrl} alt={shop.name} className="w-16 h-16 rounded-xl object-cover mb-4 border-2 border-[#EBE3E2]" />
                            ) : (
                              <div className="w-16 h-16 bg-[#E5613D] rounded-xl flex items-center justify-center text-white font-black text-3xl mb-4 border-2 border-white">
                                {shop?.name?.charAt(0) || "W"}
                              </div>
                            )}
                            <h3 className="font-black text-2xl tracking-tight text-[#3C2C28] text-center max-w-[250px] leading-tight">{shop?.name || "Wave POS"}</h3>
                            <p className="text-[10px] font-black text-[#E5613D] uppercase tracking-widest mt-2">Smart Table Menu</p>
                          </div>

                          {/* QR Code Container */}
                          <div className="bg-white p-4 rounded-2xl print:border-2 print:border-[#EBE3E2] flex justify-center w-full max-w-[200px]">
                            <QRCodeRenderer 
                              value={qr.url} 
                              size={200} 
                              level="M"
                              includeMargin={true}
                              className="print:w-full print:h-auto" 
                            />
                          </div>
                          
                          {/* Table Number */}
                          <div className="mt-4 print:mt-6 text-center bg-[#3C2C28] text-white print:px-10 print:py-3 rounded-2xl">
                            <p className="font-black text-lg print:text-4xl">Table {qr.tableNumber}</p>
                            <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest mt-1 print:hidden">Scan to Order</p>
                          </div>

                          {/* Instructions */}
                          <div className="hidden print:block w-full mt-8 bg-[#FBF5F4] rounded-2xl p-5 border-2 border-[#EBE3E2]">
                            <h4 className="text-center text-xs font-black text-[#8E7C77] uppercase tracking-widest mb-4">How to Order</h4>
                            <div className="flex flex-col items-start space-y-3 mx-auto w-fit">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-white border border-[#EBE3E2] text-[#E5613D] flex items-center justify-center font-black text-sm">1</div>
                                <p className="text-sm font-bold text-[#3C2C28]">Scan code using camera</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-white border border-[#EBE3E2] text-[#E5613D] flex items-center justify-center font-black text-sm">2</div>
                                <p className="text-sm font-bold text-[#3C2C28]">Add items to your plate</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 shrink-0 rounded-full bg-white border border-[#EBE3E2] text-[#E5613D] flex items-center justify-center font-black text-sm">3</div>
                                <p className="text-sm font-bold text-[#3C2C28]">Pay directly at counter</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
              
            </div>
          )}

        </main>
      </div>
      
    </div>
  );
}

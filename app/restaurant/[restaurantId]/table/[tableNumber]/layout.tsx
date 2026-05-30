"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    restaurantId: string;
    tableNumber: string;
  }>;
}

export default function RestaurantTableLayout({ children, params }: LayoutProps) {
  // Resolve parameters safely
  const resolvedParams = React.use(params);

  return (
    <CartProvider 
      restaurantId={resolvedParams.restaurantId} 
      tableNumber={resolvedParams.tableNumber}
    >
      <div className="min-h-screen bg-background text-foreground pb-20 select-none">
        {children}
      </div>
    </CartProvider>
  );
}

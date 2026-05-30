import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "servme QR Order - Scan, Browse, & Eat",
  description: "Browse curated menus, add kitchen notes, place real-time table orders, and track your delicious meal directly from your mobile browser with servme.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=192&auto=format&fit=crop&q=80",
    apple: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=192&auto=format&fit=crop&q=80",
  },
};

export const viewport = {
  themeColor: "#E5613D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark:bg-[#11141A]">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}

"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BiBell, BiSearch } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import Sidebar from "@/components/Shared/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen min-w-full bg-background-DEFAULT text-text-DEFAULT">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Enhanced Top Bar */}
            <div className="flex justify-around">
              <div className="relative">
                <BiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search shipments, customers, suppliers..."
                  className="border border-border-strong rounded-xl pl-10 pr-4 py-2.5 text-sm w-80 focus:ring-2 focus:ring-primary-light focus:border-primary-light focus:outline-none transition-all duration-200 bg-background-accent/50"
                />
              </div>

              <div className="flex items-center gap-6">
                <BiBell
                  className="text-text-light hover:text-primary-DEFAULT transition-colors"
                  size={20}
                />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </span>

                <FiSettings
                  className="text-text-light hover:text-primary-DEFAULT transition-colors"
                  size={18}
                />

                <div className="h-8 w-8 rounded-full bg-gradient-main flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">AS</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-text-DEFAULT">
                    Alex Smith
                  </p>
                  <p className="text-xs text-text-muted">Administrator</p>
                </div>
              </div>
            </div>
            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}

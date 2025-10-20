"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BiBell, BiUser } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import Sidebar from "@/components/Shared/Sidebar";
import { AuthProvider } from "@/context/AuthProvider";

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
        <div className="">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}

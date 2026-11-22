"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/Public/Navbar";
import Footer from "@/components/Public/Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

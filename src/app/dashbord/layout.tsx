"use client";

import { BiBell, BiUser } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import Sidebar from "@/components/Shared/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/auth"); // Redirect if not logged in
  }, [user, router]);

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );

  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <Sidebar logout={logout} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search"
              className="border border-border rounded-md px-3 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary focus:outline-none bg-background text-text-primary placeholder-text-muted"
            />
          </div>
          <div className="flex items-center gap-4">
            <BiBell className="text-text-secondary cursor-pointer hover:text-primary transition-colors" />
            <FiSettings className="text-text-secondary cursor-pointer hover:text-primary transition-colors" />
            <BiUser className="text-text-secondary cursor-pointer hover:text-primary transition-colors" />
          </div>
        </header>

        {/* Dynamic page content */}
        <section className="p-6 overflow-y-auto bg-secondary-background">
          {children}
        </section>
      </main>
    </div>
  );
}

"use client";

import { BiBell, BiUser } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import Sidebar from "@/components/Shared/Sidebar";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isCheckingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isCheckingAuth && !user) {
      router.push("/auth");
    }
  }, [isCheckingAuth, user, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar logout={logout} user={user} />
      <main className="flex-1 flex flex-col">
        <section className="p-6 overflow-y-auto bg-secondary-background">
          {children}
        </section>
      </main>
    </div>
  );
}

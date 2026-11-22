"use client";

import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ToastProvider } from "@/context/ToastProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

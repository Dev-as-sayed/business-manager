import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Brand Launcher — Zero-to-Launch",
    template: "%s | The Brand Launcher",
  },
  description:
    "The Brand Launcher is the all-in-one, zero-to-launch ecosystem: AI-built websites, direct China sourcing, door-to-door logistics, and an integrated CRM.",
  keywords: [
    "brand launcher",
    "AI website builder",
    "China sourcing",
    "door-to-door logistics",
    "business CRM",
    "start a brand",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

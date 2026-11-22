import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ThemeScript } from "@/components/marketing/layout/ThemeScript";
import { siteUrl } from "@/lib/site-url";

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

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const defaultDescription =
  "Omnia is an all-in-one platform for sourcing or creating your product in China, building your online store, producing content, and marketing your brand.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Omnia | Source, Create & Launch Your Product Brand From China",
    template: "%s | Omnia",
  },
  description: defaultDescription,
  applicationName: "Omnia",
  authors: [{ name: "Omnia" }],
  creator: "Omnia",
  publisher: "Omnia",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Omnia",
    title: "Omnia | Source, Create & Launch Your Product Brand From China",
    description: defaultDescription,
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Omnia — from product idea to profitable brand",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omnia | Source, Create & Launch Your Product Brand From China",
    description: defaultDescription,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F0B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} font-sans antialiased`}
      >
        <ThemeScript />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

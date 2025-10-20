"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-text-primary px-4">
      {/* 🌟 Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Manage Your <span className="text-primary">Business</span> Smarter
        </h1>
        <p className="text-text-secondary text-base md:text-lg mb-8">
          Streamline your consignments, payments, and customer management — all
          in one intuitive dashboard.
        </p>

        {/* 🚀 CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashbord")}
          className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl shadow-md hover:bg-primary-hover transition-all"
        >
          Get Started
        </motion.button>
      </motion.section>

      {/* 🧭 Footer */}
      <footer className="absolute bottom-4 text-sm text-text-muted">
        © {new Date().getFullYear()} Business Manager. All rights reserved.
      </footer>
    </main>
  );
}

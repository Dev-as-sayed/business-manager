"use client";

import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  FiArrowRight,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiPackage,
} from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const containerRef = useRef(null);

  // Mouse position animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();

    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const floatingIcons = [
    { icon: <FiStar />, delay: 0, position: "top-10 left-10" },
    { icon: <FiTrendingUp />, delay: 0.4, position: "top-20 right-20" },
    { icon: <FiUsers />, delay: 0.8, position: "bottom-20 left-20" },
    { icon: <FiPackage />, delay: 1.2, position: "bottom-10 right-10" },
  ];

  const features = [
    {
      title: "Smart Consignments",
      description: "Track shipments in real-time",
    },
    {
      title: "Payment Management",
      description: "Handle advances and dues efficiently",
    },
    {
      title: "Customer Portal",
      description: "Manage all client relationships",
    },
  ];

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 text-text-primary px-4 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 -left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute bottom-1/4 -right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />

        {/* Floating Icons */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: item.delay,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 2,
            }}
            className={`absolute text-primary/20 text-2xl ${item.position}`}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* 🌟 Main Hero Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium"
            >
              <FiTrendingUp className="w-4 h-4" />
              Streamline Your Business Operations
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Manage Your{" "}
              <motion.span
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent bg-size-200 bg-pos-0"
              >
                Business
              </motion.span>{" "}
              Smarter
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-lg"
            >
              Streamline your consignments, payments, and customer management —
              all in one intuitive dashboard designed for modern businesses.
            </motion.p>

            {/* Feature Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-3 text-text-secondary"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">{feature.title}</span>
                  <span className="text-text-muted">
                    - {feature.description}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.5)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/dashbord")}
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Card */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, x: 50, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Main Dashboard Card */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="bg-card border border-border rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="flex-1 text-center text-sm font-semibold text-text-secondary">
                    Dashboard Preview
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[32, 12, "$5.2k"].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="bg-accent rounded-lg p-3 text-center"
                      >
                        <div className="text-lg font-bold text-text-primary">
                          {stat}
                        </div>
                        <div className="text-xs text-text-muted">Active</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Graph Placeholder */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="bg-accent rounded-xl p-4 space-y-2"
                  >
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>Revenue Trend</span>
                      <span>+12%</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[20, 40, 60, 80, 60, 40, 60].map((height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            delay: 1.6 + index * 0.1,
                            duration: 0.5,
                          }}
                          className="flex-1 bg-primary rounded-t-lg"
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="space-y-2"
                  >
                    <div className="text-sm font-semibold text-text-secondary">
                      Recent Activity
                    </div>
                    {[
                      "New consignment",
                      "Payment received",
                      "Shipment delivered",
                    ].map((activity, index) => (
                      <motion.div
                        key={activity}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + index * 0.1 }}
                        className="flex items-center gap-3 text-sm text-text-secondary"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {activity}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 2.2 }}
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg"
              >
                <span className="text-sm font-semibold">+45% Growth</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 2.4 }}
                className="absolute -bottom-4 -left-4 bg-accent border border-border px-4 py-2 rounded-xl shadow-lg"
              >
                <span className="text-sm font-semibold text-text-primary">
                  99% Uptime
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 🧭 Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="absolute bottom-6 text-center"
      >
        <p className="text-text-muted text-sm">
          © {new Date().getFullYear()} Business Manager. All rights reserved.
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="text-text-muted text-xs mt-1"
        >
          Built for modern enterprises
        </motion.p>
      </motion.footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BiLogOut, BiChevronRight, BiMenu, BiX } from "react-icons/bi";
import { useState, useEffect } from "react";

const navLinks = [
  { title: "Dashboard", path: "/dashbord", icon: "📊" },
  { title: "Add user", path: "/dashbord/add-user", icon: "🏢" },
  { title: "Admins", path: "/dashbord/admins", icon: "🏢" },
  { title: "Suppliers", path: "/dashbord/suppliers", icon: "🏢" },
  { title: "Customers", path: "/dashbord/customers", icon: "👥" },
  { title: "Consignments", path: "/dashbord/consignments", icon: "📦" },
];

const Sidebar = ({ logout, user }) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size and setup responsive behavior [citation:1][citation:5][citation:9]
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      // Auto-close sidebar on mobile when resizing to larger screen
      if (width >= 768) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [pathname, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen, isMobile]);

  // Animation variants for responsive behavior
  const sidebarVariants = {
    closed: {
      x: isMobile ? -300 : isTablet ? -280 : -300,
      opacity: 0,
    },
    open: {
      x: 0,
      opacity: 1,
    },
  };

  const mobileOverlayVariants = {
    closed: { opacity: 0, pointerEvents: "none" },
    open: { opacity: 1, pointerEvents: "auto" },
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  // Responsive width classes
  const getSidebarWidth = () => {
    if (isMobile) return "w-72 max-w-[85vw]";
    if (isTablet) return "w-64";
    return "w-64";
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bg-black top-4 left-4 z-50 p-2 bg-background-sidebar rounded-lg shadow-lg border border-border-strong"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileOpen ? <BiX size={24} /> : <BiMenu size={24} />}
        </motion.button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            variants={mobileOverlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/90 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(!isMobile || isMobileOpen) && (
          <motion.aside
            key="sidebar"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{
              duration: isMobile ? 0.3 : 0.4,
              ease: "easeOut",
            }}
            className={`
              fixed lg:relative 
              h-screen 
              ${getSidebarWidth()}
              bg-background-sidebar 
              shadow-sidebar 
              flex flex-col justify-between 
              border-r border-border-strong
              z-40
              overflow-y-auto
            `}
          >
            {/* Header Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 lg:p-6 shrink-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg">LM</span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-text-DEFAULT gradient-text truncate">
                      LogiManage
                    </h1>
                    <p className="text-xs text-text-muted truncate">
                      Supply Chain Pro
                    </p>
                  </div>
                  {isMobile && (
                    <button
                      className="ml-auto p-1 text-text-muted hover:text-text-DEFAULT"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <BiX size={20} />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Navigation Links */}
              <nav className="mt-4 space-y-1 px-3 lg:px-4 flex-1 overflow-y-auto">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.title}
                    variants={itemVariants}
                    transition={{ delay: index * 0.1 }}
                    custom={index}
                  >
                    <Link
                      href={link.path}
                      className={`
                        flex items-center gap-3
                        px-3 py-3 lg:py-2.5
                        rounded-xl
                        transition-all duration-200
                        group
                        ${
                          pathname === link.path
                            ? "bg-primary-500 text-white shadow-md"
                            : "text-text-muted hover:bg-background-card hover:text-text-DEFAULT"
                        }
                      `}
                    >
                      <span className="text-lg flex-shrink-0">{link.icon}</span>
                      <span className="flex-1 font-medium text-sm truncate">
                        {link.title}
                      </span>
                      <BiChevronRight
                        className={`
                          flex-shrink-0 transition-transform duration-200
                          ${
                            pathname === link.path
                              ? "rotate-90 text-white"
                              : "text-text-muted group-hover:text-primary-500"
                          }
                          ${isTablet ? "hidden" : ""}
                        `}
                        size={16}
                      />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* User Profile Section */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.8 }}
              className="border-t border-border-DEFAULT p-4 m-2 lg:m-4 rounded-xl bg-background-card shadow-soft shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-semibold text-sm lg:text-base">
                      {user?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 lg:h-4 lg:w-4 rounded-full bg-success-500 border-2 border-background-card"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-DEFAULT truncate">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user?.email || "admin@logimanage.com"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-ghost p-2 text-text-muted hover:text-error-500 shrink-0"
                  onClick={() => logout()}
                  title="Logout"
                >
                  <BiLogOut size={18} />
                </motion.button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

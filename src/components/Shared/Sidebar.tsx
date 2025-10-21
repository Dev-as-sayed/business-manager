"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BiLogOut, BiChevronRight } from "react-icons/bi";

const navLinks = [
  { title: "Dashboard", path: "/dashbord", icon: "📊" },
  { title: "Add user", path: "/dashbord/add-user", icon: "🏢" },
  { title: "Admins", path: "/dashbord/admins", icon: "🏢" },
  { title: "Suppliers", path: "/dashbord/suppliers", icon: "🏢" },
  { title: "Customers", path: "/dashbord/customers", icon: "👥" },
  { title: "Consignments", path: "/dashbord/consignments", icon: "📦" },
  { title: "Products", path: "/dashbord/products", icon: "🛍️" },
  { title: "Payments", path: "/dashbord/payments", icon: "💳" },
  { title: "Reports", path: "/dashbord/reports", icon: "📈" },
  { title: "Settings", path: "/dashbord/settings", icon: "⚙️" },
];

const Sidebar = ({ logout }) => {
  const pathname = usePathname();

  const sidebarVariants = {
    closed: { x: -300, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  return (
    <motion.aside
      initial="closed"
      animate="open"
      variants={sidebarVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-64 bg-background-sidebar shadow-sidebar flex flex-col justify-between border-r border-border-strong"
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">LM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-DEFAULT gradient-text">
                LogiManage
              </h1>
              <p className="text-xs text-text-muted">Supply Chain Pro</p>
            </div>
          </div>
        </motion.div>

        <nav className="mt-4 space-y-2 px-4">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.title}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.path}
                className={`nav-item ${
                  pathname === link.path
                    ? "nav-item-active"
                    : "nav-item-inactive"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="flex-1">{link.title}</span>
                <BiChevronRight
                  className={`transition-transform duration-200 ${
                    pathname === link.path
                      ? "rotate-90 text-white"
                      : "text-text-muted group-hover:text-primary-500"
                  }`}
                />
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>

      <motion.div
        variants={itemVariants}
        transition={{ delay: 0.8 }}
        className="border-t border-border-DEFAULT p-4 m-4 rounded-xl bg-background-card shadow-soft"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-semibold">AS</span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success-500 border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-DEFAULT truncate">
              Alex Smith
            </p>
            <p className="text-xs text-text-muted truncate">
              admin@logimanage.com
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-ghost p-2 text-text-muted hover:text-error-500"
            onClick={() => logout()}
          >
            <BiLogOut size={18} />
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;

"use client";

import { useState } from "react";
import { RiLoader2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    address: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 🧠 Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🚀 Submit user registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add user");
      }

      setMessage({ type: "success", text: "User added successfully!" });
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
        address: "",
        avatar: "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Add New User
          </h1>
          <p className="text-text-secondary">
            Create new user accounts for your business
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-sm p-6"
        >
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-6 p-4 rounded-xl ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{message.text}</p>
                  <button
                    onClick={() => setMessage(null)}
                    className="text-current opacity-70 hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-background rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 bg-background rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Account Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create password"
                    className="w-full px-4 py-3 bg-background rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background rounded-xl text-text-primary focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none appearance-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 bg-background rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    className="w-full px-4 py-3 bg-background rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Additional Information
              </h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">
                  Avatar URL (Optional)
                </label>
                <input
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="Enter avatar image URL"
                  className="w-full px-4 py-3 bg-background rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:bg-accent transition-all duration-200 outline-none"
                />
                <p className="text-xs text-text-muted mt-1">
                  Provide a URL to the user&apos;s profile picture
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-xl font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <RiLoader2Line className="h-5 w-5" />
                  </motion.div>
                  Adding User...
                </>
              ) : (
                "Add User"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-accent rounded-xl p-4"
        >
          <h4 className="text-sm font-semibold text-text-primary mb-2">
            💡 Quick Tips
          </h4>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• Passwords should be at least 8 characters long</li>
            <li>• Admin users have full access to all features</li>
            <li>• Suppliers can manage their own consignments</li>
            <li>• Customers can only view their own orders</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default AddUser;

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLoader2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCheckLine,
  RiCloseLine,
  RiMore2Fill,
  RiCalendarLine,
  RiToggleLine,
  RiToggleFill,
} from "react-icons/ri";
import { PiPackageLight } from "react-icons/pi";

const CustomersTable = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/users?role=customer");
      const data = await res.json();
      setCustomers(data.users || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer._id);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setActiveMenu(null);
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingId(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this customer? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    setActiveMenu(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-3"
        >
          <RiLoader2Line className="h-6 w-6 text-primary" />
          <span className="text-text-secondary font-medium">
            Loading customers...
          </span>
        </motion.div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-12"
      >
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <RiUserLine className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No Customers Found
        </h3>
        <p className="text-text-secondary max-w-sm mx-auto mb-6">
          No customer accounts found in the system. Start by adding new
          customers to manage their orders and consignments.
        </p>
        <button className="btn-primary px-6 py-2">Add First Customer</button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Customers</h2>
          <p className="text-text-secondary mt-1">
            Manage customer accounts and their order history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {customers.length}{" "}
            {customers.length === 1 ? "Customer" : "Customers"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead className="bg-accent border-b border-border">
              <tr>
                {[
                  "Customer",
                  "Contact Info",
                  "Consignments",
                  "Join Date",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {customers.map((c, i) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-accent/50 transition-colors group"
                  >
                    {/* Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(c.name)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary truncate">
                            {c.name}
                          </div>
                          <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                            <RiUserLine className="w-3 h-3" />
                            Customer
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-sm text-text-secondary">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <RiMailLine className="w-4 h-4" />
                          <span>{c.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RiPhoneLine className="w-4 h-4" />
                          <span>{c.phone || "Not provided"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Consignments */}
                    <td className="p-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <PiPackageLight className="w-4 h-4" />
                        <span>{c.consignments?.length || 0} Orders</span>
                      </div>
                    </td>

                    {/* Join Date */}
                    <td className="p-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <RiCalendarLine className="w-4 h-4" />
                        <span>{formatDate(c.createdAt)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleStatus(c._id, c.isActive)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          c.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <RiToggleFill className="w-4 h-4" /> Active
                          </>
                        ) : (
                          <>
                            <RiToggleLine className="w-4 h-4" /> Inactive
                          </>
                        )}
                      </motion.button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleEdit(c)}
                        className="p-2 hover:bg-accent rounded-lg text-text-secondary hover:text-primary"
                      >
                        <RiEditLine className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleDelete(c._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-text-secondary hover:text-danger"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          setActiveMenu(activeMenu === c._id ? null : c._id)
                        }
                        className="p-2 hover:bg-accent rounded-lg text-text-secondary"
                      >
                        <RiMore2Fill className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* MOBILE CARD VIEW */}
          <div className="grid md:hidden gap-4">
            {customers.map((c) => (
              <div
                key={c._id}
                className="bg-background border border-border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(c.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">
                      {c.name}
                    </h3>
                    <p className="text-xs text-text-muted">{c.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-text-secondary mb-3">
                  <div className="flex items-center gap-2">
                    <RiPhoneLine className="w-4 h-4" />
                    <span>{c.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiCalendarLine className="w-4 h-4" />
                    <span>{formatDate(c.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PiPackageLight className="w-4 h-4" />
                    <span>{c.consignments?.length || 0} Orders</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleStatus(c._id, c.isActive)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      c.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleEdit(c)}
                      className="p-2 hover:bg-accent rounded-lg text-text-secondary hover:text-primary"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDelete(c._id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-text-secondary hover:text-danger"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-border"
      >
        <div className="text-sm text-text-secondary">
          Showing {customers.length} of {customers.length} customers
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-text-secondary">
              {customers.filter((c) => c.isActive).length} Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-text-secondary">
              {customers.filter((c) => !c.isActive).length} Inactive
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PiPackageLight className="w-4 h-4 text-text-muted" />
            <span className="text-text-secondary">
              {customers.reduce(
                (total, c) => total + (c.consignments?.length || 0),
                0
              )}{" "}
              Total Orders
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomersTable;

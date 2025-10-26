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
  RiToggleLine,
  RiToggleFill,
} from "react-icons/ri";

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/users?role=supplier");
      const data = await res.json();
      setSuppliers(data.users || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingId(supplier._id);
    setEditForm({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone || "",
      address: supplier.address || "",
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
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this supplier? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
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
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    setActiveMenu(null);
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
            Loading suppliers...
          </span>
        </motion.div>
      </div>
    );
  }

  if (suppliers.length === 0) {
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
          No Suppliers Found
        </h3>
        <p className="text-text-secondary max-w-sm mx-auto mb-6">
          Get started by adding new suppliers to manage your inventory and
          shipments.
        </p>
        <button className="btn-primary px-6 py-2">Add First Supplier</button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Suppliers
          </h2>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">
            Manage your supplier accounts and their information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {suppliers.length}{" "}
            {suppliers.length === 1 ? "Supplier" : "Suppliers"}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="hidden md:table w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Supplier
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {suppliers.map((supplier, index) => (
                  <motion.tr
                    key={supplier._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-accent/50 transition-colors group"
                  >
                    {/* Supplier Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(supplier.name)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-text-primary truncate">
                            {supplier.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                            <RiUserLine className="w-3 h-3" />
                            Supplier
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-4 text-sm text-text-secondary">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <RiMailLine className="w-4 h-4" /> {supplier.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <RiPhoneLine className="w-4 h-4" />{" "}
                          {supplier.phone || "Not provided"}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          toggleStatus(supplier._id, supplier.isActive)
                        }
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          supplier.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {supplier.isActive ? (
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
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(supplier)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                          title="Edit supplier"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(supplier._id)}
                          className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                          title="Delete supplier"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border">
            {suppliers.map((supplier, index) => (
              <motion.div
                key={supplier._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex flex-col gap-3 bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(supplier.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {supplier.name}
                    </h3>
                    <p className="text-xs text-text-muted">Supplier</p>
                  </div>
                </div>

                <div className="text-sm text-text-secondary space-y-1">
                  <p className="flex items-center gap-2">
                    <RiMailLine className="w-4 h-4" /> {supplier.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <RiPhoneLine className="w-4 h-4" />{" "}
                    {supplier.phone || "Not provided"}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      toggleStatus(supplier._id, supplier.isActive)
                    }
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      supplier.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {supplier.isActive ? (
                      <>
                        <RiToggleFill className="w-4 h-4" /> Active
                      </>
                    ) : (
                      <>
                        <RiToggleLine className="w-4 h-4" /> Inactive
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(supplier)}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(supplier._id)}
                      className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-border text-sm text-text-secondary"
      >
        <div>
          Showing {suppliers.length} of {suppliers.length} suppliers
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{suppliers.filter((s) => s.isActive).length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{suppliers.filter((s) => !s.isActive).length} Inactive</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SupplierTable;

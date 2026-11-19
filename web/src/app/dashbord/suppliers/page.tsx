"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLoader2Line,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiCalendarLine,
  RiCloseLine,
  RiSearchLine,
  RiArrowRightLine,
  RiMapPinLine,
} from "react-icons/ri";
import { BiDetail, BiPackage } from "react-icons/bi";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [consignments, setConsignments] = useState<any[]>([]);
  const [loadingConsignments, setLoadingConsignments] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch Suppliers
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const users = await apiFetch<any[]>("/directory/users?role=supplier");
      setSuppliers(users || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch consignments for selected supplier
  const fetchSupplierConsignments = async (id: string) => {
    try {
      setLoadingConsignments(true);
      const items = await apiFetch<any[]>(
        `/consignments/users?role=supplier&id=${id}`
      );
      setConsignments(items || []);
    } catch (error) {
      console.error("Error fetching consignments:", error);
    } finally {
      setLoadingConsignments(false);
    }
  };

  // ✅ Open Drawer
  const handleOpenDrawer = useCallback((supplier: any) => {
    setSelectedSupplier(supplier);
    setDrawerOpen(true);
    fetchSupplierConsignments(supplier._id);
  }, []);

  // ✅ Close Drawer
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedSupplier(null);
    setConsignments([]);
  }, []);

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        class: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Pending",
      },
      "in-transit": {
        class: "bg-blue-100 text-blue-800 border-blue-200",
        label: "In Transit",
      },
      delivered: {
        class: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
      },
      cancelled: {
        class: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };
    return (
      config[status as keyof typeof config] || {
        class: "bg-gray-100 text-gray-800 border-gray-200",
        label: status,
      }
    );
  };

  const getConsignmentStats = (consignments: any[]) => {
    return {
      total: consignments.length,
      totalValue: consignments.reduce(
        (sum, c) => sum + (c.totalAmount || 0),
        0
      ),
      pending: consignments.filter((c) => c.status === "pending").length,
      inTransit: consignments.filter((c) => c.status === "in-transit").length,
      delivered: consignments.filter((c) => c.status === "delivered").length,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-3"
        >
          <RiLoader2Line className="w-6 h-6 text-primary" />
          <span className="text-text-secondary font-medium">
            Loading suppliers...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* ✅ Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Supplier Management
            </h1>
            <p className="text-text-secondary">
              Manage supplier accounts and track their shipments
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            {suppliers.length}{" "}
            {suppliers.length === 1 ? "Supplier" : "Suppliers"}
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative min-w-0">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search suppliers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background rounded-xl border border-border text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Suppliers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border"
        >
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-16">
              <RiUserLine className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Suppliers Found
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {searchTerm
                  ? "No suppliers match your search criteria. Try adjusting your search terms."
                  : "No supplier accounts found in the system."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent border-b border-border">
                    <tr>
                      {[
                        "Supplier",
                        "Contact Information",
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
                      {filteredSuppliers.map((supplier, index) => (
                        <motion.tr
                          key={supplier._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-accent/50 transition-colors group cursor-pointer"
                          onClick={() => handleOpenDrawer(supplier)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials(supplier.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                                  {supplier.name}
                                </div>
                                <div className="text-xs text-text-muted mt-1">
                                  Supplier
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <RiMailLine className="w-4 h-4" />
                                {supplier.email}
                              </div>
                              {supplier.phone && (
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                  <RiPhoneLine className="w-4 h-4" />
                                  {supplier.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <RiCalendarLine className="w-4 h-4" />
                              {formatDate(supplier.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                supplier.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {supplier.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDrawer(supplier);
                                }}
                                className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                                title="View shipments"
                              >
                                <BiPackage className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                <AnimatePresence>
                  {filteredSuppliers.map((supplier, index) => (
                    <motion.div
                      key={supplier._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-background rounded-xl border border-border p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleOpenDrawer(supplier)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(supplier.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">
                              {supplier.name}
                            </div>
                            <div className="text-xs text-text-muted">
                              Supplier
                            </div>
                          </div>
                        </div>
                        <RiArrowRightLine className="w-5 h-5 text-text-muted" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <RiMailLine className="w-4 h-4" />
                          {supplier.email}
                        </div>
                        {supplier.phone && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <RiPhoneLine className="w-4 h-4" />
                            {supplier.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-text-secondary">
                          <RiCalendarLine className="w-4 h-4" />
                          Joined {formatDate(supplier.createdAt)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            supplier.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {supplier.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(supplier);
                          }}
                          className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1"
                        >
                          View Shipments
                          <RiArrowRightLine className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ✅ Supplier Details Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedSupplier && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-card shadow-2xl z-50 flex flex-col border-l border-border"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(selectedSupplier.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {selectedSupplier.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Supplier Details
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseDrawer}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Supplier Information */}
                <div className="p-6 border-b border-border">
                  <h4 className="font-semibold text-text-primary mb-4">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <RiMailLine className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <div>
                        <div className="text-sm text-text-secondary">Email</div>
                        <div className="text-text-primary">
                          {selectedSupplier.email}
                        </div>
                      </div>
                    </div>
                    {selectedSupplier.phone && (
                      <div className="flex items-center gap-3">
                        <RiPhoneLine className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <div>
                          <div className="text-sm text-text-secondary">
                            Phone
                          </div>
                          <div className="text-text-primary">
                            {selectedSupplier.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedSupplier.address && (
                      <div className="flex items-center gap-3">
                        <RiMapPinLine className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <div>
                          <div className="text-sm text-text-secondary">
                            Address
                          </div>
                          <div className="text-text-primary">
                            {selectedSupplier.address}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <RiCalendarLine className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <div>
                        <div className="text-sm text-text-secondary">
                          Member Since
                        </div>
                        <div className="text-text-primary">
                          {formatDate(selectedSupplier.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipments Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-text-primary">
                      Shipments
                    </h4>
                    {!loadingConsignments && (
                      <span className="text-sm text-text-secondary">
                        {consignments.length} total
                      </span>
                    )}
                  </div>

                  {loadingConsignments ? (
                    <div className="flex justify-center items-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="flex items-center gap-2"
                      >
                        <RiLoader2Line className="w-5 h-5 text-primary" />
                        <span className="text-text-secondary text-sm">
                          Loading shipments...
                        </span>
                      </motion.div>
                    </div>
                  ) : consignments.length === 0 ? (
                    <div className="text-center py-8">
                      <BiPackage className="w-12 h-12 text-text-muted mx-auto mb-3" />
                      <p className="text-text-secondary text-sm">
                        No shipments found for this supplier.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Shipment Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-accent rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-text-primary">
                            {getConsignmentStats(consignments).total}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Total Shipments
                          </div>
                        </div>
                        <div className="bg-accent rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-text-primary">
                            $
                            {getConsignmentStats(
                              consignments
                            ).totalValue.toFixed(2)}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Total Value
                          </div>
                        </div>
                      </div>

                      {/* Status Distribution */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-600">
                            {getConsignmentStats(consignments).pending}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Pending
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {getConsignmentStats(consignments).inTransit}
                          </div>
                          <div className="text-xs text-text-secondary">
                            In Transit
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {getConsignmentStats(consignments).delivered}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Delivered
                          </div>
                        </div>
                      </div>

                      {/* Shipments List */}
                      {consignments.map((consignment) => (
                        <motion.div
                          key={consignment._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border border-border rounded-xl bg-background hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-text-primary text-sm truncate">
                                {consignment.consignmentId}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <RiMapPinLine className="w-3 h-3 text-text-muted flex-shrink-0" />
                                <span className="text-xs text-text-secondary truncate">
                                  To:{" "}
                                  {consignment.customer?.name ||
                                    "Unknown Customer"}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                getStatusBadge(consignment.status).class
                              }`}
                            >
                              {getStatusBadge(consignment.status).label}
                            </span>
                            <motion.button className="p-1 bg-primary rounded mx-2">
                              <Link
                                href={`/dashbord/consignments/${consignment._id}`}
                              >
                                <BiDetail />
                              </Link>
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <span>{formatDate(consignment.startDate)}</span>
                            <span className="font-medium text-text-primary">
                              ${consignment.totalAmount?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierTable;

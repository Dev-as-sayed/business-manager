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
import { PiPackageLight } from "react-icons/pi";
import { BiDetail } from "react-icons/bi";
import Link from "next/link";

const CustomersTable = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [consignments, setConsignments] = useState<any[]>([]);
  const [loadingConsignments, setLoadingConsignments] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch Customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users?role=customer");
      const data = await res.json();
      setCustomers(data.users || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch consignments for selected customer
  const fetchCustomerConsignments = async (id: string) => {
    try {
      setLoadingConsignments(true);
      const res = await fetch(`/api/consignments/users?role=customer&id=${id}`);
      const data = await res.json();
      setConsignments(data.consignments || []);
    } catch (error) {
      console.error("Error fetching consignments:", error);
    } finally {
      setLoadingConsignments(false);
    }
  };

  // ✅ Open Drawer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenDrawer = useCallback((customer: any) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
    fetchCustomerConsignments(customer._id);
  }, []);

  // ✅ Close Drawer
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedCustomer(null);
    setConsignments([]);
  }, []);

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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
      pending: { class: "bg-amber-100 text-amber-800", label: "Pending" },
      "in-transit": { class: "bg-blue-100 text-blue-800", label: "In Transit" },
      delivered: { class: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { class: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    return (
      config[status as keyof typeof config] || {
        class: "bg-gray-100 text-gray-800",
        label: status,
      }
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getConsignmentStats = (consignments: any[]) => {
    return {
      total: consignments.length,
      totalValue: consignments.reduce(
        (sum, c) => sum + (c.totalAmount || 0),
        0
      ),
      pending: consignments.filter((c) => c.status === "pending").length,
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
            Loading customers...
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
              Customer Management
            </h1>
            <p className="text-text-secondary">
              Manage customer accounts and track their consignments
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            {customers.length}{" "}
            {customers.length === 1 ? "Customer" : "Customers"}
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
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
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background rounded-xl border border-border text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-sm overflow-hidden border border-border"
        >
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <RiUserLine className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                No Customers Found
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                {searchTerm
                  ? "No customers match your search criteria. Try adjusting your search terms."
                  : "No customer accounts found in the system."}
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
                        "Customer",
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
                      {filteredCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-accent/50 transition-colors group cursor-pointer"
                          onClick={() => handleOpenDrawer(customer)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials(customer.name)}
                              </div>
                              <div>
                                <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                                  {customer.name}
                                </div>
                                <div className="text-xs text-text-muted mt-1">
                                  Customer
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <RiMailLine className="w-4 h-4" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                  <RiPhoneLine className="w-4 h-4" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <RiCalendarLine className="w-4 h-4" />
                              {formatDate(customer.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                customer.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {customer.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDrawer(customer);
                                }}
                                className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                                title="View consignments"
                              >
                                <BiDetail className="w-5 h-5" />
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
                  {filteredCustomers.map((customer, index) => (
                    <motion.div
                      key={customer._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-background rounded-xl border border-border p-4 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleOpenDrawer(customer)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(customer.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">
                              {customer.name}
                            </div>
                            <div className="text-xs text-text-muted">
                              Customer
                            </div>
                          </div>
                        </div>
                        <RiArrowRightLine className="w-5 h-5 text-text-muted" />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <RiMailLine className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <RiPhoneLine className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-text-secondary">
                          <RiCalendarLine className="w-4 h-4" />
                          Joined {formatDate(customer.createdAt)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            customer.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(customer);
                          }}
                          className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1"
                        >
                          View Details
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

      {/* ✅ Customer Details Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedCustomer && (
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
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(selectedCustomer.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Customer Details
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
                {/* Customer Information */}
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
                          {selectedCustomer.email}
                        </div>
                      </div>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-3">
                        <RiPhoneLine className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <div>
                          <div className="text-sm text-text-secondary">
                            Phone
                          </div>
                          <div className="text-text-primary">
                            {selectedCustomer.phone}
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
                          {formatDate(selectedCustomer.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consignments Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-text-primary">
                      Consignments
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
                          Loading consignments...
                        </span>
                      </motion.div>
                    </div>
                  ) : consignments.length === 0 ? (
                    <div className="text-center py-8">
                      <PiPackageLight className="w-12 h-12 text-text-muted mx-auto mb-3" />
                      <p className="text-text-secondary text-sm">
                        No consignments found for this customer.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Consignment Stats */}
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
                          <div className="text-lg font-bold text-green-600">
                            {getConsignmentStats(consignments).delivered}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Delivered
                          </div>
                        </div>
                      </div>

                      {/* Consignments List */}
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
                                  {consignment.destination}
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

export default CustomersTable;

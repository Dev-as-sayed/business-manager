"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BiPlus, BiSearch, BiFilter, BiRefresh } from "react-icons/bi";
import {
  RiLoader2Fill,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileList3Line,
  RiCalendarLine,
  RiMapPinLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { format } from "date-fns";
import { TConsignment } from "@/db/interface/Consignment";
import Link from "next/link";

const ConsignmentsManagement = () => {
  const router = useRouter();
  const [consignments, setConsignments] = useState<TConsignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    destination: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Fetch consignments
  const fetchConsignments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.status) query.append("status", filters.status);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);
      if (filters.destination) query.append("destination", filters.destination);
      if (searchTerm) query.append("search", searchTerm);

      const res = await fetch(`/api/consignments?${query.toString()}`);
      const data = await res.json();
      setConsignments(data.consignments || []);
    } catch (error) {
      console.error("Error fetching consignments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchConsignments();
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      destination: "",
    });
    setSearchTerm("");
    fetchConsignments();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConsignments();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in-transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in-transit":
        return "🚚";
      case "delivered":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📦";
    }
  };

  const filteredConsignments = consignments.filter(
    (consignment) =>
      consignment.consignmentId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consignment.destination
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consignment.supplier?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consignment.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Consignments
          </h1>
          <p className="text-text-secondary">
            Manage and track all your shipments and deliveries
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/dashbord/consignments/add")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
        >
          <BiPlus className="w-5 h-5" />
          New Consignment
        </motion.button>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-sm mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search consignments, destinations, suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background rounded-xl border border-border text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-accent text-text-secondary hover:text-text-primary rounded-xl font-medium transition-colors"
            >
              <BiFilter className="w-5 h-5" />
              Filters
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-accent text-text-secondary hover:text-text-primary rounded-xl transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
              >
                <BiRefresh className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-background rounded-lg border border-border text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-background rounded-lg border border-border text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-background rounded-lg border border-border text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={filters.destination}
                    onChange={handleFilterChange}
                    placeholder="Enter destination"
                    className="w-full px-3 py-2 bg-background rounded-lg border border-border text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyFilters}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Apply Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResetFilters}
                  className="bg-accent text-text-secondary px-6 py-2 rounded-lg font-medium hover:text-text-primary transition-colors"
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {consignments.length}
          </div>
          <div className="text-sm text-text-secondary">Total Consignments</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-amber-600 mb-1">
            {consignments.filter((c) => c.status === "pending").length}
          </div>
          <div className="text-sm text-text-secondary">Pending</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {consignments.filter((c) => c.status === "in-transit").length}
          </div>
          <div className="text-sm text-text-secondary">In Transit</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {consignments.filter((c) => c.status === "delivered").length}
          </div>
          <div className="text-sm text-text-secondary">Delivered</div>
        </div>
      </motion.div>

      {/* Consignments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-3"
            >
              <RiLoader2Fill className="w-6 h-6 text-primary" />
              <span className="text-text-secondary font-medium">
                Loading consignments...
              </span>
            </motion.div>
          </div>
        ) : filteredConsignments.length === 0 ? (
          <div className="text-center py-12">
            <RiFileList3Line className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No consignments found
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || Object.values(filters).some((f) => f)
                ? "Try adjusting your search or filters"
                : "Get started by creating your first consignment"}
            </p>
            {!searchTerm && !Object.values(filters).some((f) => f) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashbord/consignments/add")}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Create Consignment
              </motion.button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                    Consignment
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                    Parties
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                    Financials
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
                  {filteredConsignments.map((consignment, index) => (
                    <motion.tr
                      key={consignment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-accent/50 transition-colors group"
                    >
                      {/* Consignment ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {getStatusIcon(consignment.status)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                              {consignment.consignmentId}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                              <RiMapPinLine className="w-3 h-3" />
                              {consignment.destination}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Parties */}
                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <RiUserLine className="w-3 h-3 text-text-muted" />
                            <span className="text-sm text-text-secondary">
                              {consignment.supplier?.name || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiUserLine className="w-3 h-3 text-text-muted" />
                            <span className="text-sm text-text-secondary">
                              {consignment.customer?.name || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <RiCalendarLine className="w-4 h-4" />
                          {consignment.startDate
                            ? format(
                                new Date(consignment.startDate),
                                "MMM dd, yyyy"
                              )
                            : "—"}
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <RiMoneyDollarCircleLine className="w-3 h-3 text-text-muted" />
                            <span className="font-semibold text-text-primary text-sm">
                              ${consignment.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-text-muted">
                            Due: ${consignment.totalDue.toFixed(2)}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                            consignment.status
                          )}`}
                        >
                          {consignment.status.replace("-", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashbord/consignments/${consignment._id}`}
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
                              title="View details"
                            >
                              <RiEyeLine className="w-4 h-4" />
                            </motion.button>
                          </Link>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-text-secondary hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit consignment"
                          >
                            <RiEditLine className="w-4 h-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                            title="Delete consignment"
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
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConsignmentsManagement;

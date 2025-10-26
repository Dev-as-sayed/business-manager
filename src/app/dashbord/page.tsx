"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiCreditCard,
  BiPackage,
  BiTrendingUp,
  BiRefresh,
} from "react-icons/bi";
import { BsTruck, BsGraphUp, BsThreeDots } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { FiArrowUpRight, FiArrowDownRight, FiEye } from "react-icons/fi";

interface ReportData {
  totalConsignments: number;
  totalSales: number;
  totalShippingCost: number;
  totalAdvance: number;
  totalDue: number;
  statusSummary: Record<string, number>;
  recentConsignments: {
    id: string;
    consignmentId: string;
    totalAmount: number;
    totalDue: number;
    status: string;
    createdAt: string;
  }[];
}

const DashboardLanding = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<
    "today" | "week" | "month" | "all"
  >("month");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/reports?filter=${timeFilter}`);
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
          />
          <p className="text-text-secondary font-medium">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto">
            <BsGraphUp className="w-8 h-8 text-danger" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            Failed to load data
          </h3>
          <p className="text-text-secondary">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background p-6 space-y-8"
    >
      {/* 🧭 Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here's your business summary
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Filter */}
          <div className="flex bg-accent rounded-lg p-1">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
              { key: "all", label: "All" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key as any)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  timeFilter === filter.key
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
            >
              <BiRefresh className="w-5 h-5" />
            </motion.div>
          </motion.button>

          <div className="flex items-center space-x-2 text-sm">
            <span className="text-text-muted">Last updated:</span>
            <span className="text-text-primary font-medium">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 📊 Summary Cards Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        <SummaryCard
          icon={<BiPackage className="w-6 h-6 text-blue-600" />}
          title="Total Consignments"
          value={data.totalConsignments}
          trend={{ value: 12, isPositive: true }}
          description="Active shipments"
          accent="blue"
          delay={0.1}
        />
        <SummaryCard
          icon={<FaDollarSign className="w-5 h-5 text-green-600" />}
          title="Total Revenue"
          value={`$${data.totalSales}`}
          trend={{ value: 8, isPositive: true }}
          description="From all consignments"
          accent="green"
          delay={0.2}
        />
        <SummaryCard
          icon={<BiCreditCard className="w-6 h-6 text-amber-600" />}
          title="Total Advance"
          value={`$${data.totalAdvance}`}
          trend={{ value: 5, isPositive: true }}
          description="Received payments"
          accent="amber"
          delay={0.3}
        />
        <SummaryCard
          icon={<BiTrendingUp className="w-6 h-6 text-red-600" />}
          title="Pending Due"
          value={`$${data.totalDue}`}
          trend={{ value: 3, isPositive: false }}
          description="Awaiting collection"
          accent="red"
          delay={0.4}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🚚 Status Summary */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Shipment Status Distribution
            </h2>
            <span className="text-sm text-text-muted">Real-time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.statusSummary).map(
              ([status, count], index) => (
                <StatusPill
                  key={status}
                  status={status}
                  count={count}
                  total={data.totalConsignments}
                  delay={0.5 + index * 0.1}
                />
              )
            )}
          </div>
        </motion.div>

        {/* 📦 Shipping Cost Card */}
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Shipping Analytics
            </h3>
            <BsTruck className="w-5 h-5 text-text-muted" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Shipping Cost</span>
              <span className="text-2xl font-bold text-text-primary">
                ${data.totalShippingCost}
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-accent rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (data.totalShippingCost / data.totalSales) * 100,
                      100
                    )}%`,
                  }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="bg-primary rounded-full h-3"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Cost Ratio</span>
                <span className="font-semibold text-text-primary">
                  {((data.totalShippingCost / data.totalSales) * 100).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm text-text-muted">
                Shipping costs represent{" "}
                {((data.totalShippingCost / data.totalSales) * 100).toFixed(1)}%
                of total revenue
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 🕓 Recent Consignments Table */}
      <motion.div
        variants={itemVariants}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                Recent Consignments
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Latest {data.recentConsignments.length} shipments
              </p>
            </div>
            <Link
              href="/dashbord/consignments"
              className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 transition-colors group"
            >
              View all
              <FiArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Consignment ID
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Due Amount
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Created Date
                </th>
                <th className="text-left p-4 text-sm font-semibold text-text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {data.recentConsignments.map((consignment, index) => (
                  <ConsignmentRow
                    key={consignment.id}
                    consignment={consignment}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ✅ Enhanced Summary Card Component with Animation
const SummaryCard = ({
  icon,
  title,
  value,
  trend,
  description,
  accent = "blue",
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: { value: number; isPositive: boolean };
  description?: string;
  accent?: "blue" | "green" | "amber" | "red";
  delay?: number;
}) => {
  const accentColors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      gradient: "from-blue-500 to-blue-600",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      gradient: "from-green-500 to-green-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      gradient: "from-amber-500 to-amber-600",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      gradient: "from-red-500 to-red-600",
    },
  };

  const colors = accentColors[accent];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
      }}
      className={`bg-card rounded-xl border border-border p-6 transition-all duration-300 group cursor-pointer relative overflow-hidden`}
    >
      {/* Background Gradient on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl ${colors.bg} ${colors.border} border transition-transform`}
          >
            {icon}
          </motion.div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 }}
              className={`flex items-center space-x-1 text-sm font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <FiArrowUpRight className="w-4 h-4" />
              ) : (
                <FiArrowDownRight className="w-4 h-4" />
              )}
              <span>{trend.value}%</span>
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <motion.h3
            className="text-2xl font-bold text-text-primary group-hover:text-primary transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            {value}
          </motion.h3>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          {description && (
            <p className="text-text-muted text-xs">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ✅ Enhanced Status Pill Component
const StatusPill = ({
  status,
  count,
  total,
  delay = 0,
}: {
  status: string;
  count: number;
  total: number;
  delay?: number;
}) => {
  const getStatusConfig = (status: string) => {
    const config = {
      pending: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Pending",
        gradient: "from-amber-400 to-amber-500",
      },
      "in-transit": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "In Transit",
        gradient: "from-blue-400 to-blue-500",
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
        gradient: "from-green-400 to-green-500",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
        gradient: "from-red-400 to-red-500",
      },
    };

    return (
      config[status as keyof typeof config] || {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: status,
        gradient: "from-gray-400 to-gray-500",
      }
    );
  };

  const { color, label, gradient } = getStatusConfig(status);
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      className="text-center p-4 rounded-lg border-2 border-transparent hover:border-current transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Animated background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      <div className="relative">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} mb-2 group-hover:shadow-lg transition-shadow`}
        >
          <span className="font-bold text-lg">{count}</span>
        </div>
        <p className="text-sm font-medium text-text-primary capitalize mb-1">
          {label}
        </p>
        <p className="text-xs text-text-muted">{percentage.toFixed(1)}%</p>
      </div>
    </motion.div>
  );
};

// ✅ Animated Consignment Row Component
const ConsignmentRow = ({
  consignment,
  index,
}: {
  consignment: any;
  index: number;
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="hover:bg-accent/50 transition-colors cursor-pointer group"
    >
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform" />
          <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
            {consignment.consignmentId}
          </span>
        </div>
      </td>
      <td className="p-4">
        <span className="font-semibold text-text-primary">
          ${consignment.totalAmount}
        </span>
      </td>
      <td className="p-4">
        <span
          className={`font-semibold ${
            consignment.totalDue > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          ${consignment.totalDue}
        </span>
      </td>
      <td className="p-4">
        <StatusBadge status={consignment.status} />
      </td>
      <td className="p-4 text-text-secondary">
        {new Date(consignment.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashbord/consignments/${consignment.id}`}
            className="p-2 text-text-secondary hover:text-primary hover:bg-accent rounded-lg transition-all"
            title="View details"
          >
            <FiEye className="w-4 h-4" />
          </Link>
          <button
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-accent rounded-lg transition-all"
            title="More options"
          >
            <BsThreeDots className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ✅ Enhanced Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in-transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </motion.span>
  );
};

export default DashboardLanding;

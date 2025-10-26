"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BiCreditCard, BiPackage, BiTrendingUp } from "react-icons/bi";
import { BsTruck, BsGraphUp } from "react-icons/bs";
import { FaDollarSign } from "react-icons/fa";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/reports");
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
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
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* 🧭 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here's your business summary
          </p>
        </div>
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

      {/* 📊 Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard
          icon={<BiPackage className="w-6 h-6 text-blue-600" />}
          title="Total Consignments"
          value={Number(data.totalConsignments).toString()}
          trend={{ value: 12, isPositive: true }}
          description="Active shipments"
          accent="blue"
        />
        <SummaryCard
          icon={<FaDollarSign className="w-5 h-5 text-green-600" />}
          title="Total Revenue"
          value={`$${data.totalSales}`}
          trend={{ value: 8, isPositive: true }}
          description="From all consignments"
          accent="green"
        />
        <SummaryCard
          icon={<BiCreditCard className="w-6 h-6 text-amber-600" />}
          title="Total Advance"
          value={`$${data.totalAdvance}`}
          trend={{ value: 5, isPositive: true }}
          description="Received payments"
          accent="amber"
        />
        <SummaryCard
          icon={<BiTrendingUp className="w-6 h-6 text-red-600" />}
          title="Pending Due"
          value={`$${data.totalDue}`}
          trend={{ value: 3, isPositive: false }}
          description="Awaiting collection"
          accent="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🚚 Status Summary */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Shipment Status
            </h2>
            <span className="text-sm text-text-muted">Real-time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.statusSummary).map(([status, count]) => (
              <StatusPill key={status} status={status} count={count} />
            ))}
          </div>
        </div>

        {/* 📦 Shipping Cost Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Shipping Costs
            </h3>
            <BsTruck className="w-5 h-5 text-text-muted" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Shipping</span>
              <span className="text-2xl font-bold text-text-primary">
                ${data.totalShippingCost}
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (data.totalShippingCost / data.totalSales) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-text-muted">
              {((data.totalShippingCost / data.totalSales) * 100).toFixed(1)}%
              of total revenue
            </p>
          </div>
        </div>
      </div>

      {/* 🕓 Recent Consignments Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Recent Consignments
            </h2>
            <button className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 transition-colors">
              <Link href="/dashbord/consignments">
                View all
                <FiArrowUpRight className="w-4 h-4" />
              </Link>
            </button>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentConsignments.map((consignment) => (
                <tr
                  key={consignment.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform"></div>
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
                        consignment.totalDue > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ${consignment.totalDue}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={consignment.status} />
                  </td>
                  <td className="p-4 text-text-secondary">
                    {new Date(consignment.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ✅ Enhanced Summary Card Component
const SummaryCard = ({
  icon,
  title,
  value,
  trend,
  description,
  accent = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: { value: number; isPositive: boolean };
  description?: string;
  accent?: "blue" | "green" | "amber" | "red";
}) => {
  const accentColors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  };

  const colors = accentColors[accent];

  return (
    <div
      className={`bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl ${colors.bg} ${colors.border} border group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        {trend && (
          <div
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
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-text-primary group-hover:text-primary transition-colors">
          {value}
        </h3>
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        {description && (
          <p className="text-text-muted text-xs">{description}</p>
        )}
      </div>
    </div>
  );
};

// ✅ Status Pill Component
const StatusPill = ({ status, count }: { status: string; count: number }) => {
  const getStatusConfig = (status: string) => {
    const config = {
      pending: {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Pending",
      },
      "in-transit": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "In Transit",
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };

    return (
      config[status as keyof typeof config] || {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: status,
      }
    );
  };

  const { color, label } = getStatusConfig(status);

  return (
    <div className="text-center p-4 rounded-lg border-2 border-transparent hover:border-current transition-colors cursor-pointer">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} mb-2`}
      >
        <span className="font-bold text-lg">{count}</span>
      </div>
      <p className="text-sm font-medium text-text-primary capitalize">
        {label}
      </p>
    </div>
  );
};

// ✅ Status Badge Component
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
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </span>
  );
};

export default DashboardLanding;

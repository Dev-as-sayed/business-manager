"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BiPlus, BiSearch } from "react-icons/bi";
import { RiLoader2Fill } from "react-icons/ri";
import { format } from "date-fns";
import { TConsignment } from "@/db/interface/Consignment";
import Link from "next/link";

const ConsignmentsManagement = () => {
  const router = useRouter();
  const [consignments, setConsignments] = useState<TConsignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    destination: "",
  });

  // ✅ Fetch consignments
  const fetchConsignments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filters.status) query.append("status", filters.status);
      if (filters.startDate) query.append("startDate", filters.startDate);
      if (filters.endDate) query.append("endDate", filters.endDate);
      if (filters.destination) query.append("destination", filters.destination);

      const res = await fetch(`/api/consignments?${query.toString()}`);
      const data = await res.json();
      setConsignments(data.consignments || []);
    } catch (error) {
      console.error("Error fetching consignments:", error);
    } finally {
      setLoading(false);
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

  const handleApplyFilters = () => fetchConsignments();

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/20 text-warning border border-warning/30";
      case "in-transit":
        return "bg-primary/20 text-primary border border-primary/30";
      case "delivered":
        return "bg-action/20 text-action border border-action/30";
      case "cancelled":
        return "bg-danger/20 text-danger border border-danger/30";
      default:
        return "bg-text-muted/20 text-text-muted border border-text-muted/30";
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-text-primary">
          Consignments Management
        </h1>
        <button
          onClick={() => router.push("/dashbord/consignments/add")}
          className="btn-primary flex items-center gap-2"
        >
          <BiPlus className="w-4 h-4" /> Add New Consignment
        </button>
      </div>

      {/* Filters */}
      <div className="card grid sm:grid-cols-5 gap-3 mb-6">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="input bg-background"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="input bg-background"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="input bg-background"
        />
        <input
          type="text"
          name="destination"
          value={filters.destination}
          onChange={handleFilterChange}
          placeholder="Search destination..."
          className="input bg-background"
        />
        <button
          onClick={handleApplyFilters}
          className="btn-secondary flex items-center justify-center"
        >
          <BiSearch className="w-4 h-4 mr-1" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="table">
          <thead>
            <tr className="bg-accent">
              <th className="p-4 text-text-primary font-semibold">#</th>
              <th className="p-4 text-text-primary font-semibold">
                Consignment ID
              </th>
              <th className="p-4 text-text-primary font-semibold">Supplier</th>
              <th className="p-4 text-text-primary font-semibold">Customer</th>
              <th className="p-4 text-text-primary font-semibold">
                Start Date
              </th>
              <th className="p-4 text-text-primary font-semibold">
                Destination
              </th>
              <th className="p-4 text-text-primary font-semibold">Status</th>
              <th className="p-4 text-text-primary font-semibold">Total</th>
              <th className="p-4 text-text-primary font-semibold">Advance</th>
              <th className="p-4 text-text-primary font-semibold">Due</th>
              <th className="p-4 text-text-primary font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-8">
                  <div className="flex items-center justify-center text-text-secondary">
                    <RiLoader2Fill className="w-6 h-6 animate-spin mr-2" />
                    Loading consignments...
                  </div>
                </td>
              </tr>
            ) : consignments.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-text-muted">
                  No consignments found
                </td>
              </tr>
            ) : (
              consignments.map((c, i) => (
                <tr
                  key={c._id}
                  className="border-b border-border hover:bg-accent transition-colors duration-150"
                >
                  <td className="p-4 text-text-muted">{i + 1}</td>
                  <td className="p-4 font-medium text-text-primary">
                    {c.consignmentId}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {c.supplier?.name || "N/A"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {c.customer?.name || "N/A"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {c.startDate
                      ? format(new Date(c.startDate), "yyyy-MM-dd")
                      : "—"}
                  </td>
                  <td className="p-4 text-text-secondary">{c.destination}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-text-primary">
                    ${c.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-4 text-text-secondary">
                    ${c.totalAdvance.toFixed(2)}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    ${c.totalDue.toFixed(2)}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    <Link href={`/dashbord/consignments/${c._id}`}>
                      <button>Detail</button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsignmentsManagement;

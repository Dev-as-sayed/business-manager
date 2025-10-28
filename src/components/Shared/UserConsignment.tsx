"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface UserConsignmentProps {
  id: string;
  role: "supplier" | "customer" | "admin";
}

interface Consignment {
  _id: string;
  consignmentId: string;
  status: string;
  destination: string;
  startDate: string;
  totalAmount: number;
  totalAdvance: number;
  totalDue: number;
  supplier?: { name: string };
  customer?: { name: string };
  admin?: { name: string };
}

const UserConsignment: React.FC<UserConsignmentProps> = ({ id, role }) => {
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consignments/users?id=${id}&role=${role}`);
      const data = await res.json();

      if (data.success) {
        setConsignments(data.consignments);
      }
    } catch (error) {
      console.error("❌ Failed to fetch consignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && role) fetchConsignments();
  }, [id, role]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading consignments...
      </div>
    );

  if (consignments.length === 0)
    return (
      <div className="text-center py-20 text-gray-500">
        No consignments found for this user.
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        User Consignments ({consignments.length})
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Consignment ID</th>
              <th className="p-3 border">Supplier</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Destination</th>
              <th className="p-3 border">Total Amount</th>
              <th className="p-3 border">Advance</th>
              <th className="p-3 border">Due</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {consignments.map((c, i) => (
              <tr
                key={c._id}
                className="text-center hover:bg-gray-50 transition"
              >
                <td className="p-3 border">{i + 1}</td>
                <td className="p-3 border font-medium">{c.consignmentId}</td>
                <td className="p-3 border">{c.supplier?.name || "-"}</td>
                <td className="p-3 border">{c.customer?.name || "-"}</td>
                <td className="p-3 border">{c.destination}</td>
                <td className="p-3 border">${c.totalAmount}</td>
                <td className="p-3 border text-green-600">${c.totalAdvance}</td>
                <td className="p-3 border text-red-600">${c.totalDue}</td>
                <td
                  className={`p-3 border font-semibold ${
                    c.status === "delivered"
                      ? "text-green-600"
                      : c.status === "pending"
                      ? "text-yellow-600"
                      : c.status === "in-transit"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {c.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserConsignment;

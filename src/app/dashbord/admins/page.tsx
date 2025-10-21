"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  RiLoader2Line,
  RiShieldUserLine,
  RiCalendarLine,
} from "react-icons/ri";

const AdminTable = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/users?role=admin");
      const data = await res.json();
      setAdmins(data.users || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RiLoader2Line className="animate-spin h-6 w-6 text-primary mr-2" />
        <span className="text-text-secondary">Loading admins...</span>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="text-center p-8">
        <RiShieldUserLine className="mx-auto h-12 w-12 text-text-muted" />
        <h3 className="mt-2 text-sm font-medium text-text-primary">
          No admins
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          No administrator accounts found.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Admin List</h2>
        <span className="badge-warning">{admins.length} administrators</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Admin</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr key={admin._id}>
                <td className="text-text-muted">{index + 1}</td>

                <td>
                  <div className="flex items-center gap-3">
                    {admin.avatar ? (
                      <Image
                        src={admin.avatar}
                        alt={admin.name}
                        fill
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                        <RiShieldUserLine className="text-white text-sm" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-text-primary">
                        {admin.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        Administrator
                      </div>
                    </div>
                  </div>
                </td>

                <td className="text-text-secondary">{admin.email}</td>

                <td className="text-text-secondary">{admin.phone || "-"}</td>

                <td className="text-text-muted text-sm">
                  <div className="flex items-center gap-1">
                    <RiCalendarLine size={14} />
                    {formatDate(admin.createdAt)}
                  </div>
                </td>

                <td className="text-text-muted text-sm">
                  <div className="flex items-center gap-1">
                    <RiCalendarLine size={14} />
                    {formatDate(admin.updatedAt)}
                  </div>
                </td>

                <td>
                  <span
                    className={`badge ${
                      admin.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;

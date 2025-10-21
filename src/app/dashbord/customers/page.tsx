"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  RiLoader2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiUserLine,
  RiCalendarLine,
} from "react-icons/ri";

const CustomersTable = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    if (!confirm("Are you sure you want to delete this customer?")) return;

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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RiLoader2Line className="animate-spin h-6 w-6 text-primary mr-2" />
        <span className="text-text-secondary">Loading customers...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center p-8">
        <RiUserLine className="mx-auto h-12 w-12 text-text-muted" />
        <h3 className="mt-2 text-sm font-medium text-text-primary">
          No customers
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          No customers found in the system.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Customer List
        </h2>
        <span className="badge-info">{customers.length} customers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Consignments</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer._id}>
                <td className="text-text-muted">{index + 1}</td>

                <td className="font-medium text-text-primary">
                  {editingId === customer._id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {customer.avatar ? (
                        <Image
                          src={customer.avatar}
                          alt={customer.name}
                          fill
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <RiUserLine className="h-6 w-6 text-text-muted" />
                      )}
                      {customer.name}
                    </div>
                  )}
                </td>

                <td className="text-text-secondary">
                  {editingId === customer._id ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    customer.email
                  )}
                </td>

                <td className="text-text-secondary">
                  {editingId === customer._id ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    customer.phone || "-"
                  )}
                </td>

                <td className="text-center">
                  <span className="badge">
                    {customer.consignment?.length || 0}
                  </span>
                </td>

                <td className="text-text-muted text-sm">
                  <div className="flex items-center gap-1">
                    <RiCalendarLine size={14} />
                    {formatDate(customer.createdAt)}
                  </div>
                </td>

                <td>
                  <button
                    onClick={() =>
                      toggleStatus(customer._id, customer.isActive)
                    }
                    className={`badge ${
                      customer.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td>
                  <div className="flex gap-2">
                    {editingId === customer._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(customer._id)}
                          className="btn-primary text-xs px-2 py-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-ghost text-xs px-2 py-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="btn-ghost text-text-muted hover:text-primary p-1"
                        >
                          <RiEditLine size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="btn-ghost text-text-muted hover:text-danger p-1"
                        >
                          <RiDeleteBinLine size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersTable;

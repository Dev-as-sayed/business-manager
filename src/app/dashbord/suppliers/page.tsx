"use client";

import { useEffect, useState } from "react";
import {
  RiLoader2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiUserLine,
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
        fetchSuppliers(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSuppliers(); // Refresh data
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
        fetchSuppliers(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RiLoader2Line className="animate-spin h-6 w-6 text-primary mr-2" />
        <span className="text-text-secondary">Loading suppliers...</span>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center p-8">
        <RiUserLine className="mx-auto h-12 w-12 text-text-muted" />
        <h3 className="mt-2 text-sm font-medium text-text-primary">
          No suppliers
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Get started by creating a new supplier.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Supplier List
        </h2>
        <span className="badge-info">{suppliers.length} suppliers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => (
              <tr key={supplier._id}>
                <td className="text-text-muted">{index + 1}</td>

                <td className="font-medium text-text-primary">
                  {editingId === supplier._id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    supplier.name
                  )}
                </td>

                <td className="text-text-secondary">
                  {editingId === supplier._id ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    supplier.email
                  )}
                </td>

                <td className="text-text-secondary">
                  {editingId === supplier._id ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    supplier.phone || "-"
                  )}
                </td>

                <td className="text-text-secondary">
                  {editingId === supplier._id ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="input text-sm"
                    />
                  ) : (
                    supplier.address || "-"
                  )}
                </td>

                <td>
                  <button
                    onClick={() =>
                      toggleStatus(supplier._id, supplier.isActive)
                    }
                    className={`badge ${
                      supplier.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {supplier.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td>
                  <div className="flex gap-2">
                    {editingId === supplier._id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(supplier._id)}
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
                          onClick={() => handleEdit(supplier)}
                          className="btn-ghost text-text-muted hover:text-primary p-1"
                        >
                          <RiEditLine size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier._id)}
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

export default SupplierTable;

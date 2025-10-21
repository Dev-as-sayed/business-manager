"use client";

import { useEffect, useState } from "react";

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchSuppliers();
  }, []);

  if (loading) return <p>Loading suppliers...</p>;

  if (suppliers.length === 0) return <p>No suppliers found.</p>;

  return (
    <div>
      <h2>Supplier List</h2>
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier, index) => (
            <tr key={supplier._id}>
              <td>{index + 1}</td>
              <td>{supplier.name}</td>
              <td>{supplier.email}</td>
              <td>{supplier.isActive ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { TbLoader2 } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { BsTrash2 } from "react-icons/bs";

type User = { name: string; email: string };
type Transaction = {
  transactionId: string;
  date: string;
  amount: number;
  method: string;
  type: string;
  note?: string;
};
type Product = {
  category: string;
  brand: string;
  model: string;
  specs?: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  totalbuyingCost: number;
  totalsellingCost: number;
};
type Consignment = {
  _id: string;
  consignmentId: string;
  supplier: User;
  customer: User;
  products: Product[];
  transactions: Transaction[];
  startDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  shippingCost: number;
  totalAmount: number;
  totalAdvance: number;
  totalDue: number;
  status: string;
  destination: string;
};

const ConsignmentDetails = () => {
  const { id } = useParams();
  const router = useRouter();

  const [consignment, setConsignment] = useState<Consignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ Fetch single consignment
  const fetchConsignment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/consignments/${id}`);
      const data = await res.json();
      setConsignment(data.consignment);
    } catch (error) {
      console.error("Error fetching consignment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignment();
  }, [id]);

  // ✅ Delete consignment
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this consignment?")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/consignments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.push("/dashboard/consignments");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-text-secondary">
        <TbLoader2 className="w-6 h-6 animate-spin mr-2" />
        Loading consignment details...
      </div>
    );

  if (!consignment)
    return (
      <div className="text-center text-text-muted mt-10">
        Consignment not found
      </div>
    );

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-semibold text-text-primary">
          Consignment #{consignment.consignmentId}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              router.push(`/dashbord/consignments/update/${consignment._id}`)
            }
            className="btn-primary flex items-center gap-1"
          >
            <BiEdit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn bg-danger text-danger-foreground hover:bg-danger-hover flex items-center gap-1 disabled:opacity-60"
          >
            {deleting ? (
              <>
                <TbLoader2 className="w-4 h-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <BsTrash2 className="w-4 h-4" /> Delete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-text-primary mb-3 border-b border-border pb-2">
          Basic Information
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <p className="text-text-secondary">
            <strong className="text-text-primary">Supplier:</strong>{" "}
            {consignment.supplier?.name} ({consignment.supplier?.email})
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Customer:</strong>{" "}
            {consignment.customer?.name} ({consignment.customer?.email})
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Destination:</strong>{" "}
            {consignment.destination}
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Start Date:</strong>{" "}
            {format(new Date(consignment.startDate), "yyyy-MM-dd")}
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Shipping Date:</strong>{" "}
            {consignment.shippingDate
              ? format(new Date(consignment.shippingDate), "yyyy-MM-dd")
              : "—"}
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Delivery Date:</strong>{" "}
            {consignment.deliveryDate
              ? format(new Date(consignment.deliveryDate), "yyyy-MM-dd")
              : "—"}
          </p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Status:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(
                consignment.status
              )}`}
            >
              {consignment.status}
            </span>
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-3 border-b border-border pb-2">
          Products ({consignment.products.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-accent">
                <th className="p-3 text-text-primary font-semibold text-left">
                  Category
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Brand
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Model
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Specs
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Qty
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Buying
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Selling
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {consignment.products.map((p, i) => (
                <tr
                  key={i}
                  className="border-t border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="p-3 text-text-secondary">{p.category}</td>
                  <td className="p-3 text-text-secondary">{p.brand}</td>
                  <td className="p-3 text-text-secondary">{p.model}</td>
                  <td className="p-3 text-text-muted">{p.specs || "—"}</td>
                  <td className="p-3 text-text-secondary">{p.quantity}</td>
                  <td className="p-3 text-text-secondary">${p.buyingPrice}</td>
                  <td className="p-3 text-text-secondary">${p.sellingPrice}</td>
                  <td className="p-3 font-semibold text-text-primary">
                    ${p.totalsellingCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text-primary mb-3 border-b border-border pb-2">
          Transactions ({consignment.transactions.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-accent">
                <th className="p-3 text-text-primary font-semibold text-left">
                  Transaction ID
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Date
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Type
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Method
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Amount
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {consignment.transactions.map((t, i) => (
                <tr
                  key={i}
                  className="border-t border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="p-3 text-text-secondary">{t.transactionId}</td>
                  <td className="p-3 text-text-secondary">
                    {format(new Date(t.date), "yyyy-MM-dd")}
                  </td>
                  <td className="p-3 text-text-secondary capitalize">
                    {t.type}
                  </td>
                  <td className="p-3 text-text-secondary capitalize">
                    {t.method}
                  </td>
                  <td className="p-3 font-semibold text-text-primary">
                    ${t.amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-text-muted">{t.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="card grid sm:grid-cols-3 gap-4 text-sm">
        <p className="text-text-secondary">
          <strong className="text-text-primary">Shipping Cost:</strong> $
          {consignment.shippingCost.toFixed(2)}
        </p>
        <p className="text-text-secondary">
          <strong className="text-text-primary">Total Amount:</strong> $
          {consignment.totalAmount.toFixed(2)}
        </p>
        <p className="text-text-secondary">
          <strong className="text-text-primary">Total Advance:</strong> $
          {consignment.totalAdvance.toFixed(2)}
        </p>
        <p className="text-text-secondary">
          <strong className="text-text-primary">Total Due:</strong>{" "}
          <span className="text-danger font-semibold">
            ${consignment.totalDue.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ConsignmentDetails;

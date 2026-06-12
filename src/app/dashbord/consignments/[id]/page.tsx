"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { TbLoader2 } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { BsTrash2 } from "react-icons/bs";
import { RiRefundFill } from "react-icons/ri";
import { FaMoneyBillWave, FaShippingFast } from "react-icons/fa";
import { Consignment } from "@/lib/types";
import EditConsignmentModal from "@/components/Consignment/EditConsignmentModal";
import AddProductModal from "@/components/Consignment/AddProductModal";
import EditProductModal from "@/components/Consignment/EditProductModal";
import AddTransactionModal from "@/components/Consignment/AddTransactionModal";
import ConfirmDialog from "@/components/Shared/ConfirmDialog";
import { useToast } from "@/context/ToastProvider";

const ConsignmentDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [consignment, setConsignment] = useState<Consignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number>(-1);

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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/consignments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("success", "Consignment deleted");
        router.push("/dashbord/consignments");
      } else {
        const data = await res.json();
        toast("error", data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning/20 text-warning border border-warning/30";
      case "in-transit": return "bg-primary/20 text-primary border border-primary/30";
      case "delivered": return "bg-action/20 text-action border border-action/30";
      case "partially-delivered": return "bg-warning/20 text-warning border border-warning/30";
      case "cancelled": return "bg-danger/20 text-danger border border-danger/30";
      case "refunded": return "bg-danger/20 text-danger border border-danger/30";
      default: return "bg-text-muted/20 text-text-muted border border-text-muted/30";
    }
  };

  const getProductStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered": return "bg-action/20 text-action border border-action/30";
      case "pending": return "bg-warning/20 text-warning border border-warning/30";
      case "refunded": return "bg-danger/20 text-danger border border-danger/30";
      default: return "bg-text-muted/20 text-text-muted border border-text-muted/30";
    }
  };

  const getTransactionBadgeClass = (direction: string, party: string) => {
    if (direction === "in") return "bg-action/20 text-action border border-action/30";
    if (party === "customer") return "bg-warning/20 text-warning border border-warning/30";
    return "bg-danger/20 text-danger border border-danger/30";
  };

  const calculatePaymentSummaries = () => {
    if (!consignment) return null;

    const customerPayments = consignment.transactions
      .filter((t) => t.party === "customer" && t.direction === "in" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const supplierPayments = consignment.transactions
      .filter((t) => t.party === "supplier" && t.direction === "out" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const customerRefunds = consignment.transactions
      .filter((t) => t.party === "customer" && t.direction === "out" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      customerPayments,
      supplierPayments,
      customerRefunds,
      totalReceived: customerPayments,
      totalPaid: supplierPayments + customerRefunds,
      netCashFlow: customerPayments - (supplierPayments + customerRefunds),
    };
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-text-secondary">
      <TbLoader2 className="w-6 h-6 animate-spin mr-2" />
      Loading consignment details...
    </div>
  );

  if (!consignment) return (
    <div className="text-center text-text-muted mt-10">Consignment not found</div>
  );

  const paymentSummaries = calculatePaymentSummaries();

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-semibold text-text-primary">
          Consignment #{consignment.consignmentId}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="btn-primary flex items-center gap-1">
            <BiEdit className="w-4 h-4" /> Edit Consignment
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting}
            className="btn bg-danger text-danger-foreground hover:bg-danger-hover flex items-center gap-1 disabled:opacity-60">
            {deleting ? <><TbLoader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><BsTrash2 className="w-4 h-4" /> Delete</>}
          </button>
        </div>
      </div>

      {paymentSummaries && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-action/5 border-action/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-action/20"><FaMoneyBillWave className="w-5 h-5 text-action" /></div>
              <div><p className="text-sm text-text-secondary">Customer Payments</p><p className="text-xl font-bold text-action">${paymentSummaries.customerPayments.toFixed(2)}</p></div>
            </div>
          </div>
          <div className="card bg-warning/5 border-warning/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20"><FaShippingFast className="w-5 h-5 text-warning" /></div>
              <div><p className="text-sm text-text-secondary">Supplier Payments</p><p className="text-xl font-bold text-warning">${paymentSummaries.supplierPayments.toFixed(2)}</p></div>
            </div>
          </div>
          <div className="card bg-danger/5 border-danger/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger/20"><RiRefundFill className="w-5 h-5 text-danger" /></div>
              <div><p className="text-sm text-text-secondary">Customer Refunds</p><p className="text-xl font-bold text-danger">${paymentSummaries.customerRefunds.toFixed(2)}</p></div>
            </div>
          </div>
          <div className={`card ${paymentSummaries.netCashFlow >= 0 ? "bg-action/5 border-action/20" : "bg-danger/5 border-danger/20"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${paymentSummaries.netCashFlow >= 0 ? "bg-action/20" : "bg-danger/20"}`}>
                <FaMoneyBillWave className={`w-5 h-5 ${paymentSummaries.netCashFlow >= 0 ? "text-action" : "text-danger"}`} />
              </div>
              <div><p className="text-sm text-text-secondary">Net Cash Flow</p><p className={`text-xl font-bold ${paymentSummaries.netCashFlow >= 0 ? "text-action" : "text-danger"}`}>${paymentSummaries.netCashFlow.toFixed(2)}</p></div>
            </div>
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-text-primary mb-3 border-b border-border pb-2">Basic Information</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <p className="text-text-secondary"><strong className="text-text-primary">Supplier:</strong> {consignment.supplier?.name} ({consignment.supplier?.email})</p>
          <p className="text-text-secondary"><strong className="text-text-primary">Customer:</strong> {consignment.customer?.name} ({consignment.customer?.email})</p>
          <p className="text-text-secondary"><strong className="text-text-primary">Destination:</strong> {consignment.destination}</p>
          <p className="text-text-secondary"><strong className="text-text-primary">Start Date:</strong> {format(new Date(consignment.startDate), "yyyy-MM-dd")}</p>
          <p className="text-text-secondary"><strong className="text-text-primary">Shipping Date:</strong> {consignment.shippingDate ? format(new Date(consignment.shippingDate), "yyyy-MM-dd") : "—"}</p>
          <p className="text-text-secondary"><strong className="text-text-primary">Delivery Date:</strong> {consignment.deliveryDate ? format(new Date(consignment.deliveryDate), "yyyy-MM-dd") : "—"}</p>
          <p className="text-text-secondary">
            <strong className="text-text-primary">Status:</strong>{" "}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(consignment.status)}`}>{consignment.status}</span>
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
          <h2 className="text-lg font-semibold text-text-primary">Products ({consignment.products.length})</h2>
          <button onClick={() => setShowAddProductModal(true)} className="btn-primary text-sm flex items-center gap-1">
            <BiEdit className="w-4 h-4" /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr className="bg-accent">
              <th className="p-3 text-text-primary font-semibold text-left">Actions</th>
              <th className="p-3 text-text-primary font-semibold text-left">Category</th>
              <th className="p-3 text-text-primary font-semibold text-left">Brand</th>
              <th className="p-3 text-text-primary font-semibold text-left">Model</th>
              <th className="p-3 text-text-primary font-semibold text-left">Status</th>
              <th className="p-3 text-text-primary font-semibold text-left">Qty</th>
              <th className="p-3 text-text-primary font-semibold text-left">Delivered</th>
              <th className="p-3 text-text-primary font-semibold text-left">Refunded</th>
              <th className="p-3 text-text-primary font-semibold text-left">Buying</th>
              <th className="p-3 text-text-primary font-semibold text-left">Selling</th>
              <th className="p-3 text-text-primary font-semibold text-left">Profit</th>
              <th className="p-3 text-text-primary font-semibold text-left">Total</th>
            </tr></thead>
            <tbody>
              {consignment.products.map((p, i) => (
                <tr key={i} className="border-t border-border hover:bg-accent/50 transition-colors">
                  <td className="p-3">
                    <button onClick={() => { setEditingProductIndex(i); setShowEditProductModal(true); }}
                      className="text-primary hover:text-primary-hover transition-colors">
                      <BiEdit className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-3 text-text-secondary capitalize">{p.category}</td>
                  <td className="p-3 text-text-secondary">{p.brand}</td>
                  <td className="p-3 text-text-secondary">{p.model}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getProductStatusBadgeClass(p.status)}`}>{p.status}</span></td>
                  <td className="p-3 text-text-secondary">{p.quantity}</td>
                  <td className="p-3 text-text-secondary">{p.deliveredQuantity || 0}</td>
                  <td className="p-3 text-text-secondary">{p.refundedQuantity || 0}</td>
                  <td className="p-3 text-text-secondary">${p.buyingPrice.toFixed(2)}</td>
                  <td className="p-3 text-text-secondary">${p.sellingPrice.toFixed(2)}</td>
                  <td className={`p-3 font-semibold ${(p.profit || 0) >= 0 ? "text-action" : "text-danger"}`}>${(p.profit || 0).toFixed(2)}</td>
                  <td className="p-3 font-semibold text-text-primary">${p.totalsellingCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
          <h2 className="text-lg font-semibold text-text-primary">Transactions ({consignment.transactions.length})</h2>
          <button onClick={() => setShowAddTransactionModal(true)} className="btn-primary text-sm flex items-center gap-1">
            <BiEdit className="w-4 h-4" /> Add Transaction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr className="bg-accent">
              <th className="p-3 text-text-primary font-semibold text-left">Transaction ID</th>
              <th className="p-3 text-text-primary font-semibold text-left">Date</th>
              <th className="p-3 text-text-primary font-semibold text-left">Type</th>
              <th className="p-3 text-text-primary font-semibold text-left">Direction</th>
              <th className="p-3 text-text-primary font-semibold text-left">Party</th>
              <th className="p-3 text-text-primary font-semibold text-left">Method</th>
              <th className="p-3 text-text-primary font-semibold text-left">Amount</th>
              <th className="p-3 text-text-primary font-semibold text-left">Note</th>
            </tr></thead>
            <tbody>
              {consignment.transactions.map((t, i) => (
                <tr key={i} className="border-t border-border hover:bg-accent/50 transition-colors">
                  <td className="p-3 text-text-secondary">{t.transactionId}</td>
                  <td className="p-3 text-text-secondary">{format(new Date(t.date), "yyyy-MM-dd")}</td>
                  <td className="p-3 text-text-secondary capitalize">{t.type}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getTransactionBadgeClass(t.direction, t.party)}`}>{t.direction}</span></td>
                  <td className="p-3 text-text-secondary capitalize">{t.party}</td>
                  <td className="p-3 text-text-secondary capitalize">{t.method}</td>
                  <td className={`p-3 font-semibold ${t.direction === "in" ? "text-action" : "text-danger"}`}>${t.amount.toFixed(2)}</td>
                  <td className="p-3 text-text-muted">{t.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Cost Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-text-secondary">Total Product Cost:</span><span className="font-semibold text-text-primary">${consignment.totalProductCost.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Total Selling Price:</span><span className="font-semibold text-text-primary">${consignment.totalSellingPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Shipping Cost:</span><span className="font-semibold text-text-primary">${consignment.shippingCost.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-border pt-2"><span className="text-text-secondary font-semibold">Total Amount:</span><span className="font-bold text-primary">${consignment.totalAmount.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">Profit Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-text-secondary">Gross Profit:</span><span className={`font-semibold ${consignment.grossProfit >= 0 ? "text-action" : "text-danger"}`}>${consignment.grossProfit.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Shipping Cost:</span><span className="font-semibold text-text-primary">-${consignment.shippingCost.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-border pt-2"><span className="text-text-secondary font-semibold">Net Profit:</span><span className={`font-bold ${consignment.netProfit >= 0 ? "text-action" : "text-danger"}`}>${consignment.netProfit.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Profit Margin:</span><span className={`font-semibold ${consignment.profitMargin >= 0 ? "text-action" : "text-danger"}`}>{consignment.profitMargin.toFixed(1)}%</span></div>
          </div>
        </div>
      </div>

      {showEditModal && <EditConsignmentModal consignment={consignment} onClose={() => setShowEditModal(false)} onUpdate={fetchConsignment} />}
      {showAddProductModal && <AddProductModal onClose={() => setShowAddProductModal(false)} onAdd={fetchConsignment} />}
      {showEditProductModal && editingProductIndex >= 0 && (
        <EditProductModal product={consignment.products[editingProductIndex]} index={editingProductIndex}
          onClose={() => { setShowEditProductModal(false); setEditingProductIndex(-1); }} onUpdate={fetchConsignment} />
      )}
      {showAddTransactionModal && <AddTransactionModal onClose={() => setShowAddTransactionModal(false)} onAdd={fetchConsignment} />}

      <ConfirmDialog open={showDeleteConfirm} title="Delete Consignment"
        message={`Are you sure you want to delete consignment #${consignment.consignmentId}? This action cannot be undone.`}
        loading={deleting} onConfirm={handleDelete} onCancel={() => setShowDeleteConfirm(false)} />
    </div>
  );
};

export default ConsignmentDetails;

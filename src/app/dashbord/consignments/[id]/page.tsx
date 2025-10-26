"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { TbLoader2 } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { BsTrash2 } from "react-icons/bs";

type User = { _id: string; name: string; email: string };
type Transaction = {
  transactionId: string;
  date: string;
  amount: number;
  method: string;
  type: string;
  note?: string;
  receivedBy?: string;
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

// Modal Components
const EditConsignmentModal = ({
  consignment,
  onClose,
  onUpdate,
}: {
  consignment: Consignment;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [formData, setFormData] = useState({
    shippingDate: consignment.shippingDate || "",
    deliveryDate: consignment.deliveryDate || "",
    shippingCost: consignment.shippingCost,
    status: consignment.status,
    destination: consignment.destination,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${consignment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        alert(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Consignment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Shipping Date
            </label>
            <input
              type="date"
              value={
                formData.shippingDate
                  ? format(new Date(formData.shippingDate), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                setFormData({ ...formData, shippingDate: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Delivery Date
            </label>
            <input
              type="date"
              value={
                formData.deliveryDate
                  ? format(new Date(formData.deliveryDate), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                setFormData({ ...formData, deliveryDate: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Shipping Cost
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.shippingCost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingCost: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Destination
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <TbLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddProductModal = ({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: () => void;
}) => {
  const [formData, setFormData] = useState({
    category: "mobile",
    brand: "",
    model: "",
    specs: "",
    quantity: 1,
    buyingPrice: 0,
    sellingPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onAdd();
        onClose();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Add product error:", error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
              <option value="accessory">Accessory</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Brand
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Model
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Specifications
            </label>
            <textarea
              value={formData.specs}
              onChange={(e) =>
                setFormData({ ...formData, specs: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Buying Price
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.buyingPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    buyingPrice: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Selling Price
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <TbLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditProductModal = ({
  product,
  index,
  onClose,
  onUpdate,
}: {
  product: Product;
  index: number;
  onClose: () => void;
  onUpdate: () => void;
}) => {
  const [formData, setFormData] = useState({
    category: product.category,
    brand: product.brand,
    model: product.model,
    specs: product.specs || "",
    quantity: product.quantity,
    buyingPrice: product.buyingPrice,
    sellingPrice: product.sellingPrice,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${id}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, product: formData }),
      });

      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Same form fields as AddProductModal but with current values */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
              <option value="accessory">Accessory</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Brand
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Model
            </label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Specifications
            </label>
            <textarea
              value={formData.specs}
              onChange={(e) =>
                setFormData({ ...formData, specs: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Buying Price
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.buyingPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    buyingPrice: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Selling Price
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: parseFloat(e.target.value),
                })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <TbLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddPaymentModal = ({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: () => void;
}) => {
  const [formData, setFormData] = useState({
    transactionId: `TXN${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    method: "cash",
    type: "payment",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onAdd();
        onClose();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add payment");
      }
    } catch (error) {
      console.error("Add payment error:", error);
      alert("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              required
              value={formData.transactionId}
              onChange={(e) =>
                setFormData({ ...formData, transactionId: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Amount
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Method
              </label>
              <select
                value={formData.method}
                onChange={(e) =>
                  setFormData({ ...formData, method: e.target.value })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile">Mobile</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="advance">Advance</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? (
                <TbLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConsignmentDetails = () => {
  const { id } = useParams();
  const router = useRouter();

  const [consignment, setConsignment] = useState<Consignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number>(-1);

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

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setShowEditProductModal(true);
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
            onClick={() => setShowEditModal(true)}
            className="btn-primary flex items-center gap-1"
          >
            <BiEdit className="w-4 h-4" /> Edit Consignment
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
        <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Products ({consignment.products.length})
          </h2>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <BiEdit className="w-4 h-4" /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="bg-accent">
                <th className="p-3 text-text-primary font-semibold text-left">
                  Actions
                </th>
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
                  <td className="p-3">
                    <button
                      onClick={() => handleEditProduct(i)}
                      className="text-primary hover:text-primary-hover transition-colors"
                    >
                      <BiEdit className="w-4 h-4" />
                    </button>
                  </td>
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
        <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Transactions ({consignment.transactions.length})
          </h2>
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <BiEdit className="w-4 h-4" /> Add Payment
          </button>
        </div>
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

      {/* Modals */}
      {showEditModal && (
        <EditConsignmentModal
          consignment={consignment}
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchConsignment}
        />
      )}

      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onAdd={fetchConsignment}
        />
      )}

      {showEditProductModal && editingProductIndex >= 0 && (
        <EditProductModal
          product={consignment.products[editingProductIndex]}
          index={editingProductIndex}
          onClose={() => {
            setShowEditProductModal(false);
            setEditingProductIndex(-1);
          }}
          onUpdate={fetchConsignment}
        />
      )}

      {showAddPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowAddPaymentModal(false)}
          onAdd={fetchConsignment}
        />
      )}
    </div>
  );
};

export default ConsignmentDetails;

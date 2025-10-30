"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { TbLoader2 } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { BsTrash2 } from "react-icons/bs";
import { RiRefundFill } from "react-icons/ri";
import { HiReceiptRefund } from "react-icons/hi";
import { FaMoneyBillWave, FaShippingFast } from "react-icons/fa";

type User = { _id: string; name: string; email: string };
type Transaction = {
  transactionId: string;
  date: string;
  amount: number;
  method: string;
  type: string;
  direction: "in" | "out";
  party: "customer" | "supplier" | "company";
  note?: string;
  addBy?: string;
  status: string;
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
  status: "delivered" | "pending" | "refund";
  deliveredQuantity?: number;
  refundedQuantity?: number;
  profit?: number;
  profitMargin?: number;
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
  totalProductCost: number;
  totalSellingPrice: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalReceived: number;
  totalPaid: number;
  status: string;
  destination: string;
  productStatus?: {
    total: number;
    delivered: number;
    pending: number;
    refunded: number;
  };
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
              <option value="partially-delivered">Partially Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
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
    status: "pending" as "delivered" | "pending" | "refund",
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${id}/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log(JSON.stringify(formData));

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
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="refund">Refund</option>
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
    status: product.status,
    deliveredQuantity: product.deliveredQuantity || 0,
    refundedQuantity: product.refundedQuantity || 0,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${id}/product`, {
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
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="refunded">Refund</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Delivered Qty
              </label>
              <input
                type="number"
                min="0"
                max={formData.quantity}
                value={formData.deliveredQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveredQuantity: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Refunded Qty
              </label>
              <input
                type="number"
                min="0"
                max={formData.quantity}
                value={formData.refundedQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    refundedQuantity: parseInt(e.target.value),
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

const AddTransactionModal = ({
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
    type: "advance",
    direction: "in" as "in" | "out",
    party: "customer" as "customer" | "supplier" | "company",
    note: "",
    status: "completed",
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  // Auto-set direction and party based on transaction type
  const handleTypeChange = (type: string) => {
    let direction: "in" | "out" = "in";
    let party: "customer" | "supplier" | "company" = "customer";

    switch (type) {
      case "advance":
      case "payment":
        direction = "in";
        party = "customer";
        break;
      case "pay-out":
        direction = "out";
        party = "supplier";
        break;
      case "refund":
        direction = "out";
        party = "customer";
        break;
      case "pay-in":
        direction = "in";
        party = "company";
        break;
    }

    setFormData((prev) => ({
      ...prev,
      type,
      direction,
      party,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/consignments/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onAdd();
        onClose();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add transaction");
      }
    } catch (error) {
      console.error("Add transaction error:", error);
      alert("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
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
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="advance">Advance</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="pay-in">Pay In</option>
                <option value="pay-out">Pay Out</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Direction
              </label>
              <input
                type="text"
                value={formData.direction.toUpperCase()}
                className="w-full p-2 border border-border rounded bg-accent"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Party
              </label>
              <input
                type="text"
                value={
                  formData.party.charAt(0).toUpperCase() +
                  formData.party.slice(1)
                }
                className="w-full p-2 border border-border rounded bg-accent"
                readOnly
              />
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
                "Add Transaction"
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
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
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
      case "partially-delivered":
        return "bg-warning/20 text-warning border border-warning/30";
      case "cancelled":
        return "bg-danger/20 text-danger border border-danger/30";
      case "refunded":
        return "bg-danger/20 text-danger border border-danger/30";
      default:
        return "bg-text-muted/20 text-text-muted border border-text-muted/30";
    }
  };

  const getProductStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-action/20 text-action border border-action/30";
      case "pending":
        return "bg-warning/20 text-warning border border-warning/30";
      case "refund":
        return "bg-danger/20 text-danger border border-danger/30";
      default:
        return "bg-text-muted/20 text-text-muted border border-text-muted/30";
    }
  };

  const getTransactionBadgeClass = (direction: string, party: string) => {
    if (direction === "in") {
      return "bg-action/20 text-action border border-action/30";
    } else {
      if (party === "customer") {
        return "bg-warning/20 text-warning border border-warning/30";
      } else {
        return "bg-danger/20 text-danger border border-danger/30";
      }
    }
  };

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setShowEditProductModal(true);
  };

  // Calculate payment summaries
  const calculatePaymentSummaries = () => {
    if (!consignment) return null;

    const customerPayments = consignment.transactions
      .filter(
        (t) =>
          t.party === "customer" &&
          t.direction === "in" &&
          t.status === "completed"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const supplierPayments = consignment.transactions
      .filter(
        (t) =>
          t.party === "supplier" &&
          t.direction === "out" &&
          t.status === "completed"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const customerRefunds = consignment.transactions
      .filter(
        (t) =>
          t.party === "customer" &&
          t.direction === "out" &&
          t.status === "completed"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = customerPayments;
    const totalPaid = supplierPayments + customerRefunds;
    const netCashFlow = totalReceived - totalPaid;

    return {
      customerPayments,
      supplierPayments,
      customerRefunds,
      totalReceived,
      totalPaid,
      netCashFlow,
    };
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

  const paymentSummaries = calculatePaymentSummaries();

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

      {/* Financial Summary Cards */}
      {paymentSummaries && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customer Payments */}
          <div className="card bg-action/5 border-action/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-action/20">
                <FaMoneyBillWave className="w-5 h-5 text-action" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Customer Payments</p>
                <p className="text-xl font-bold text-action">
                  ${paymentSummaries.customerPayments.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier Payments */}
          <div className="card bg-warning/5 border-warning/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <FaShippingFast className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Supplier Payments</p>
                <p className="text-xl font-bold text-warning">
                  ${paymentSummaries.supplierPayments.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Refunds */}
          <div className="card bg-danger/5 border-danger/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-danger/20">
                <RiRefundFill className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Customer Refunds</p>
                <p className="text-xl font-bold text-danger">
                  ${paymentSummaries.customerRefunds.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div
            className={`card ${
              paymentSummaries.netCashFlow >= 0
                ? "bg-action/5 border-action/20"
                : "bg-danger/5 border-danger/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  paymentSummaries.netCashFlow >= 0
                    ? "bg-action/20"
                    : "bg-danger/20"
                }`}
              >
                <FaMoneyBillWave
                  className={`w-5 h-5 ${
                    paymentSummaries.netCashFlow >= 0
                      ? "text-action"
                      : "text-danger"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Net Cash Flow</p>
                <p
                  className={`text-xl font-bold ${
                    paymentSummaries.netCashFlow >= 0
                      ? "text-action"
                      : "text-danger"
                  }`}
                >
                  ${paymentSummaries.netCashFlow.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Status
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Qty
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Delivered
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Refunded
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Buying
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Selling
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Profit
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
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEditProduct(i)}
                      className="text-primary hover:text-primary-hover transition-colors"
                    >
                      <BiEdit className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-3 text-text-secondary capitalize">
                    {p.category}
                  </td>
                  <td className="p-3 text-text-secondary">{p.brand}</td>
                  <td className="p-3 text-text-secondary">{p.model}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getProductStatusBadgeClass(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{p.quantity}</td>
                  <td className="p-3 text-text-secondary">
                    {p.deliveredQuantity || 0}
                  </td>
                  <td className="p-3 text-text-secondary">
                    {p.refundedQuantity || 0}
                  </td>
                  <td className="p-3 text-text-secondary">
                    ${p.buyingPrice.toFixed(2)}
                  </td>
                  <td className="p-3 text-text-secondary">
                    ${p.sellingPrice.toFixed(2)}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      (p.profit || 0) >= 0 ? "text-action" : "text-danger"
                    }`}
                  >
                    ${(p.profit || 0).toFixed(2)}
                  </td>
                  <td className="p-3 font-semibold text-text-primary">
                    ${p.totalsellingCost.toFixed(2)}
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
            onClick={() => setShowAddTransactionModal(true)}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <BiEdit className="w-4 h-4" /> Add Transaction
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
                  Direction
                </th>
                <th className="p-3 text-text-primary font-semibold text-left">
                  Party
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
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getTransactionBadgeClass(
                        t.direction,
                        t.party
                      )}`}
                    >
                      {t.direction}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary capitalize">
                    {t.party}
                  </td>
                  <td className="p-3 text-text-secondary capitalize">
                    {t.method}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      t.direction === "in" ? "text-action" : "text-danger"
                    }`}
                  >
                    ${t.amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-text-muted">{t.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">
            Cost Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Product Cost:</span>
              <span className="font-semibold text-text-primary">
                ${consignment.totalProductCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Selling Price:</span>
              <span className="font-semibold text-text-primary">
                ${consignment.totalSellingPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping Cost:</span>
              <span className="font-semibold text-text-primary">
                ${consignment.shippingCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-text-secondary font-semibold">
                Total Amount:
              </span>
              <span className="font-bold text-primary">
                ${consignment.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4 border-b border-border pb-2">
            Profit Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Gross Profit:</span>
              <span
                className={`font-semibold ${
                  consignment.grossProfit >= 0 ? "text-action" : "text-danger"
                }`}
              >
                ${consignment.grossProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping Cost:</span>
              <span className="font-semibold text-text-primary">
                -${consignment.shippingCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-text-secondary font-semibold">
                Net Profit:
              </span>
              <span
                className={`font-bold ${
                  consignment.netProfit >= 0 ? "text-action" : "text-danger"
                }`}
              >
                ${consignment.netProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Profit Margin:</span>
              <span
                className={`font-semibold ${
                  consignment.profitMargin >= 0 ? "text-action" : "text-danger"
                }`}
              >
                {consignment.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
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

      {showAddTransactionModal && (
        <AddTransactionModal
          onClose={() => setShowAddTransactionModal(false)}
          onAdd={fetchConsignment}
        />
      )}
    </div>
  );
};

export default ConsignmentDetails;

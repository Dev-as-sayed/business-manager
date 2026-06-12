"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TbLoader2 } from "react-icons/tb";
import { useToast } from "@/context/ToastProvider";

type Props = {
  onClose: () => void;
  onAdd: () => void;
};

const AddProductModal = ({ onClose, onAdd }: Props) => {
  const [formData, setFormData] = useState({
    category: "mobile",
    brand: "",
    model: "",
    specs: "",
    quantity: 1,
    buyingPrice: 0,
    sellingPrice: 0,
    status: "pending" as string,
  });
  const { toast } = useToast();
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

      if (res.ok) {
        toast("success", "Product added");
        onAdd();
        onClose();
      } else {
        const data = await res.json();
        toast("error", data.message || "Failed to add product");
      }
    } catch {
      toast("error", "Failed to add product");
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
            <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
            <select value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
              <option value="accessory">Accessory</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="refunded">Refund</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Brand</label>
            <input type="text" required value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Model</label>
            <input type="text" required value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Specifications</label>
            <textarea value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
              <input type="number" required min="1" value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Buying Price</label>
              <input type="number" required step="0.01" min="0" value={formData.buyingPrice}
                onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) })}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Selling Price</label>
            <input type="number" required step="0.01" min="0" value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center">
              {loading ? <TbLoader2 className="w-4 h-4 animate-spin" /> : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

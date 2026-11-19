"use client";

import { useState } from "react";
import { format } from "date-fns";
import { TbLoader2 } from "react-icons/tb";
import { Consignment } from "@/lib/types";
import { useToast } from "@/context/ToastProvider";
import { apiFetch } from "@/lib/api";

type Props = {
  consignment: Consignment;
  onClose: () => void;
  onUpdate: () => void;
};

const EditConsignmentModal = ({ consignment, onClose, onUpdate }: Props) => {
  const { toast } = useToast();
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
      await apiFetch(`/consignments/${consignment._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      toast("success", "Consignment updated");
      onUpdate();
      onClose();
    } catch (error) {
      toast("error", error instanceof Error ? error.message : "Update failed");
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
            <label className="block text-sm font-medium text-text-primary mb-1">Shipping Date</label>
            <input
              type="date"
              value={formData.shippingDate ? format(new Date(formData.shippingDate), "yyyy-MM-dd") : ""}
              onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Delivery Date</label>
            <input
              type="date"
              value={formData.deliveryDate ? format(new Date(formData.deliveryDate), "yyyy-MM-dd") : ""}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Shipping Cost</label>
            <input
              type="number" step="0.01" value={formData.shippingCost}
              onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
            <label className="block text-sm font-medium text-text-primary mb-1">Destination</label>
            <input type="text" value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center">
              {loading ? <TbLoader2 className="w-4 h-4 animate-spin" /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConsignmentModal;

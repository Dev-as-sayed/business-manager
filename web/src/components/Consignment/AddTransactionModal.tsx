"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TbLoader2 } from "react-icons/tb";
import { useToast } from "@/context/ToastProvider";
import { apiFetch } from "@/lib/api";

type Props = {
  onClose: () => void;
  onAdd: () => void;
};

const AddTransactionModal = ({ onClose, onAdd }: Props) => {
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleTypeChange = (type: string) => {
    let direction: "in" | "out" = "in";
    let party: "customer" | "supplier" | "company" = "customer";

    switch (type) {
      case "advance":
      case "payment":
        direction = "in"; party = "customer"; break;
      case "pay-out":
        direction = "out"; party = "supplier"; break;
      case "refund":
        direction = "out"; party = "customer"; break;
      case "pay-in":
        direction = "in"; party = "company"; break;
    }

    setFormData((prev) => ({ ...prev, type, direction, party }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch(`/consignments/${id}/payment`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast("success", "Transaction added");
      onAdd();
      onClose();
    } catch (error) {
      toast(
        "error",
        error instanceof Error ? error.message : "Failed to add transaction"
      );
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
            <label className="block text-sm font-medium text-text-primary mb-1">Transaction ID</label>
            <input type="text" required value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
            <input type="date" required value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount</label>
            <input type="number" required step="0.01" min="0" value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Method</label>
              <select value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile">Mobile</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
              <select value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="advance">Advance</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="pay-in">Pay In</option>
                <option value="pay-out">Pay Out</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Note</label>
            <textarea value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary" rows={2} />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 px-4 border border-border rounded hover:bg-accent transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center">
              {loading ? <TbLoader2 className="w-4 h-4 animate-spin" /> : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;

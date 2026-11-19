"use client";

import { motion } from "framer-motion";
import { TbLoader2 } from "react-icons/tb";

type Props = {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
};

const ConfirmDialog = ({ open, title, message, loading, onConfirm, onCancel, confirmLabel = "Delete" }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background p-6 rounded-xl w-full max-w-sm mx-4 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <TbLoader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmDialog;

"use client";

import { BiPrinter } from "react-icons/bi";
import { motion } from "framer-motion";

interface PrintButtonProps {
  label?: string;
}

const PrintButton = ({ label = "Print" }: PrintButtonProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handlePrint}
      className="flex items-center gap-2 px-4 py-3 bg-accent text-text-secondary hover:text-text-primary rounded-xl font-medium transition-colors no-print"
      title="Print"
    >
      <BiPrinter className="w-5 h-5" />
      {label}
    </motion.button>
  );
};

export default PrintButton;

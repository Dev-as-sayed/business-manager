"use client";

import { useEffect, useState } from "react";
import { BiPlus, BiPackage, BiDollar, BiCalendar } from "react-icons/bi";
import { BsTrash2, BsArrowRight } from "react-icons/bs";
import { TbLoader2 } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";

const AddNewConsignment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<
    "basic" | "products" | "transactions"
  >("basic");

  const [consignment, setConsignment] = useState({
    consignmentId: `CNG-${Date.now()}`,
    admin: user?.id || "",
    supplier: "",
    customer: "",
    destination: "Bangladesh",
    startDate: new Date().toISOString().split("T")[0],
    shippingDate: "",
    deliveryDate: "",
    shippingCost: 0,
    status: "pending" as
      | "pending"
      | "in-transit"
      | "delivered"
      | "cancelled"
      | "partially-delivered"
      | "refunded",
    products: [
      {
        category: "",
        brand: "",
        model: "",
        specs: "",
        buyingPrice: 0,
        sellingPrice: 0,
        quantity: 1,
        totalbuyingCost: 0,
        totalsellingCost: 0,
        status: "pending" as
          | "pending"
          | "delivered"
          | "refunded"
          | "returned"
          | "damaged",
        deliveredQuantity: 0,
        refundedQuantity: 0,
        profit: 0,
        profitMargin: 0,
      },
    ],
    transactions: [
      {
        transactionId: `TXN-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        method: "cash" as "cash" | "bank" | "mobile" | "card" | "other",
        type: "advance" as
          | "advance"
          | "payment"
          | "refund"
          | "pay-in"
          | "pay-out",
        direction: "in" as "in" | "out",
        party: "customer" as "customer" | "supplier" | "company",
        note: "",
        addBy: user?.id || "",
        status: "completed" as "pending" | "completed" | "failed",
      },
    ],
    totalAmount: 0,
    totalAdvance: 0,
    totalDue: 0,
    totalProductCost: 0,
    totalSellingPrice: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    totalReceived: 0,
    totalPaid: 0,
    productStatus: {
      total: 1,
      delivered: 0,
      pending: 1,
      refunded: 0,
    },
  });

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchSuppliers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/users?role=customer");
      const data = await res.json();
      setCustomers(data.users || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/users?role=supplier");
      const data = await res.json();
      setSuppliers(data.users || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // Calculate totals automatically
  const calculateProductTotals = (products: typeof consignment.products) => {
    return products.map((product) => ({
      ...product,
      totalbuyingCost: product.buyingPrice * product.quantity,
      totalsellingCost: product.sellingPrice * product.quantity,
      profit: (product.sellingPrice - product.buyingPrice) * product.quantity,
      profitMargin:
        product.buyingPrice > 0
          ? ((product.sellingPrice - product.buyingPrice) /
              product.buyingPrice) *
            100
          : 0,
    }));
  };

  // Update product status summary
  const updateProductStatusSummary = (
    products: typeof consignment.products
  ) => {
    return {
      total: products.length,
      delivered: products.filter((p) => p.status === "delivered").length,
      pending: products.filter((p) => p.status === "pending").length,
      refunded: products.filter((p) => p.status === "refunded").length,
    };
  };

  // ✅ Handle main form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setConsignment((prev) => ({
      ...prev,
      [name]: name === "shippingCost" ? Number(value) : value,
    }));
  };

  // ✅ Handle product changes
  const handleProductChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const updatedProducts = [...consignment.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]:
        name === "quantity" ||
        name === "buyingPrice" ||
        name === "sellingPrice" ||
        name === "deliveredQuantity" ||
        name === "refundedQuantity"
          ? Number(value)
          : value,
    };

    const productsWithTotals = calculateProductTotals(updatedProducts);
    const productStatus = updateProductStatusSummary(productsWithTotals);

    setConsignment((prev) => ({
      ...prev,
      products: productsWithTotals,
      productStatus,
    }));
  };

  // ✅ Add/remove product
  const addProduct = () => {
    const newProducts = [
      ...consignment.products,
      {
        category: "",
        brand: "",
        model: "",
        specs: "",
        buyingPrice: 0,
        sellingPrice: 0,
        quantity: 1,
        totalbuyingCost: 0,
        totalsellingCost: 0,
        status: "pending" as const,
        deliveredQuantity: 0,
        refundedQuantity: 0,
        profit: 0,
        profitMargin: 0,
      },
    ];

    const productsWithTotals = calculateProductTotals(newProducts);
    const productStatus = updateProductStatusSummary(productsWithTotals);

    setConsignment((prev) => ({
      ...prev,
      products: productsWithTotals,
      productStatus,
    }));
  };

  const removeProduct = (index: number) => {
    if (consignment.products.length === 1) return;
    const updated = [...consignment.products];
    updated.splice(index, 1);

    const productsWithTotals = calculateProductTotals(updated);
    const productStatus = updateProductStatusSummary(productsWithTotals);

    setConsignment((prev) => ({
      ...prev,
      products: productsWithTotals,
      productStatus,
    }));
  };

  // ✅ Handle transaction changes
  const handleTransactionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedTransactions = [...consignment.transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [name]: name === "amount" ? Number(value) : value,
      addBy: user?.id || "", // Always set the current user as addBy
    };
    setConsignment((prev) => ({ ...prev, transactions: updatedTransactions }));
  };

  // Auto-set direction and party based on transaction type
  const handleTransactionTypeChange = (index: number, type: string) => {
    const updatedTransactions = [...consignment.transactions];

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

    updatedTransactions[index] = {
      ...updatedTransactions[index],
      type: type as any,
      direction,
      party,
    };

    setConsignment((prev) => ({ ...prev, transactions: updatedTransactions }));
  };

  // ✅ Add/remove transaction
  const addTransaction = () => {
    setConsignment((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        {
          transactionId: `TXN-${Date.now()}-${prev.transactions.length + 1}`,
          date: new Date().toISOString().split("T")[0],
          amount: 0,
          method: "cash",
          type: "advance",
          direction: "in",
          party: "customer",
          note: "",
          addBy: user?.id || "",
          status: "completed",
        },
      ],
    }));
  };

  const removeTransaction = (index: number) => {
    if (consignment.transactions.length === 1) return;
    const updated = [...consignment.transactions];
    updated.splice(index, 1);
    setConsignment((prev) => ({ ...prev, transactions: updated }));
  };

  // ✅ Submit consignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Let the server handle the calculations via the pre-save hook
      const res = await fetch("/api/consignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consignment),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Consignment created successfully! Redirecting...",
        });
        setTimeout(() => {
          window.location.href = "/dashbord/consignments";
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create consignment",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary values
  const totalProductsValue = consignment.products.reduce(
    (sum, product) => sum + product.totalsellingCost,
    0
  );

  const totalProductCost = consignment.products.reduce(
    (sum, product) => sum + product.totalbuyingCost,
    0
  );

  const customerPayments = consignment.transactions
    .filter(
      (t) =>
        t.party === "customer" &&
        t.direction === "in" &&
        t.status === "completed"
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const supplierPayments = consignment.transactions
    .filter(
      (t) =>
        t.party === "supplier" &&
        t.direction === "out" &&
        t.status === "completed"
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const grossProfit = totalProductsValue - totalProductCost;
  const netProfit = grossProfit - consignment.shippingCost;
  const profitMargin =
    totalProductCost > 0 ? (netProfit / totalProductCost) * 100 : 0;

  const balanceDue =
    totalProductsValue + consignment.shippingCost - customerPayments;

  const sectionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <BiPackage className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Create New Consignment
            </h1>
          </div>
          <p className="text-text-secondary">
            Add a new consignment with products and transactions
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {["basic", "products", "transactions"].map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => setActiveSection(step as any)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-200 ${
                    activeSection === step
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-accent text-text-muted"
                  }`}
                >
                  {index + 1}
                </button>
                {index < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full ${
                      activeSection === "products" && index === 0
                        ? "bg-primary"
                        : activeSection === "transactions"
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeSection === "basic" && (
                  <motion.div
                    key="basic"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="card"
                  >
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <BiCalendar />
                      Basic Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Consignment ID
                        </label>
                        <input
                          name="consignmentId"
                          value={consignment.consignmentId}
                          onChange={handleChange}
                          className="input w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={consignment.status}
                          onChange={handleChange}
                          className="input w-full bg-black"
                          required
                        >
                          <option value="pending">Pending</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="partially-delivered">
                            Partially Delivered
                          </option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Supplier
                        </label>
                        <select
                          name="supplier"
                          value={consignment.supplier}
                          onChange={handleChange}
                          className="input w-full bg-black"
                          required
                        >
                          <option value="">Select Supplier</option>
                          {suppliers.map((supplier: any) => (
                            <option key={supplier._id} value={supplier._id}>
                              {supplier.name} ({supplier.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Customer
                        </label>
                        <select
                          name="customer"
                          value={consignment.customer}
                          onChange={handleChange}
                          className="input w-full bg-black"
                          required
                        >
                          <option value="">Select Customer</option>
                          {customers.map((customer: any) => (
                            <option key={customer._id} value={customer._id}>
                              {customer.name} ({customer.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Destination
                        </label>
                        <input
                          name="destination"
                          value={consignment.destination}
                          onChange={handleChange}
                          className="input w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={consignment.startDate}
                          onChange={handleChange}
                          className="input w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Shipping Cost ($)
                        </label>
                        <input
                          type="number"
                          name="shippingCost"
                          value={consignment.shippingCost}
                          onChange={handleChange}
                          className="input w-full"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Shipping Date
                        </label>
                        <input
                          type="date"
                          name="shippingDate"
                          value={consignment.shippingDate}
                          onChange={handleChange}
                          className="input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Delivery Date
                        </label>
                        <input
                          type="date"
                          name="deliveryDate"
                          value={consignment.deliveryDate}
                          onChange={handleChange}
                          className="input w-full"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveSection("products")}
                        className="btn-primary flex items-center gap-2"
                      >
                        Continue to Products
                        <BsArrowRight />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeSection === "products" && (
                  <motion.div
                    key="products"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <BiPackage />
                        Products ({consignment.products.length})
                      </h2>
                      <motion.button
                        type="button"
                        onClick={addProduct}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <BiPlus size={16} />
                        Add Product
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {consignment.products.map((product, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-border rounded-xl p-4 bg-background"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-text-primary">
                              Product {index + 1}
                            </h3>
                            {consignment.products.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeProduct(index)}
                                className="btn-ghost text-danger hover:bg-danger/10 p-2"
                              >
                                <BsTrash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Category
                              </label>
                              <select
                                name="category"
                                value={product.category}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm bg-black"
                                required
                              >
                                <option value="mobile">Mobile</option>
                                <option value="laptop">Laptop</option>
                                <option value="accessory">Accessory</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Status
                              </label>
                              <select
                                name="status"
                                value={product.status}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm bg-black"
                                required
                              >
                                <option value="pending">Pending</option>
                                <option value="delivered">Delivered</option>
                                <option value="refunded">Refunded</option>
                                <option value="returned">Returned</option>
                                <option value="damaged">Damaged</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Brand
                              </label>
                              <input
                                name="brand"
                                placeholder="Brand"
                                value={product.brand}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Model
                              </label>
                              <input
                                name="model"
                                placeholder="Model"
                                value={product.model}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Quantity
                              </label>
                              <input
                                name="quantity"
                                type="number"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                min="1"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Delivered Qty
                              </label>
                              <input
                                name="deliveredQuantity"
                                type="number"
                                value={product.deliveredQuantity}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                min="0"
                                max={product.quantity}
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Refunded Qty
                              </label>
                              <input
                                name="refundedQuantity"
                                type="number"
                                value={product.refundedQuantity}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                min="0"
                                max={product.quantity}
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Buying Price
                              </label>
                              <input
                                name="buyingPrice"
                                type="number"
                                step="0.01"
                                value={product.buyingPrice}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                required
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Selling Price
                              </label>
                              <input
                                name="sellingPrice"
                                type="number"
                                step="0.01"
                                value={product.sellingPrice}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input text-sm"
                                required
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Total Buying
                              </label>
                              <input
                                type="text"
                                value={`$${product.totalbuyingCost.toFixed(2)}`}
                                className="input text-sm bg-accent"
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Total Selling
                              </label>
                              <input
                                type="text"
                                value={`$${product.totalsellingCost.toFixed(
                                  2
                                )}`}
                                className="input text-sm bg-accent"
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Profit
                              </label>
                              <input
                                type="text"
                                value={`$${product.profit.toFixed(2)}`}
                                className={`input text-sm ${
                                  product.profit >= 0
                                    ? "bg-action/10"
                                    : "bg-danger/10"
                                }`}
                                readOnly
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Profit Margin
                              </label>
                              <input
                                type="text"
                                value={`${product.profitMargin.toFixed(1)}%`}
                                className={`input text-sm ${
                                  product.profitMargin >= 0
                                    ? "bg-action/10"
                                    : "bg-danger/10"
                                }`}
                                readOnly
                              />
                            </div>

                            <div className="lg:col-span-4">
                              <label className="block text-xs text-text-muted mb-1">
                                Specifications
                              </label>
                              <textarea
                                name="specs"
                                placeholder="Product specifications"
                                value={product.specs}
                                onChange={(e) => handleProductChange(index, e)}
                                className="input h-20 text-sm w-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveSection("basic")}
                        className="btn-ghost"
                      >
                        Back to Basic Info
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection("transactions")}
                        className="btn-primary flex items-center gap-2"
                      >
                        Continue to Transactions
                        <BsArrowRight />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeSection === "transactions" && (
                  <motion.div
                    key="transactions"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <BiDollar />
                        Transactions ({consignment.transactions.length})
                      </h2>
                      <motion.button
                        type="button"
                        onClick={addTransaction}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <BiPlus size={16} />
                        Add Transaction
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {consignment.transactions.map((transaction, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-border rounded-xl p-4 bg-background"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-text-primary">
                              Transaction {index + 1}
                              <span
                                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                  transaction.direction === "in"
                                    ? "bg-action/10 text-action"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {transaction.direction === "in" ? "IN" : "OUT"}{" "}
                                - {transaction.party}
                              </span>
                            </h3>
                            {consignment.transactions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTransaction(index)}
                                className="btn-ghost text-danger hover:bg-danger/10 p-2"
                              >
                                <BsTrash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Transaction ID
                              </label>
                              <input
                                name="transactionId"
                                value={transaction.transactionId}
                                onChange={(e) =>
                                  handleTransactionChange(index, e)
                                }
                                className="input text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                name="date"
                                value={transaction.date}
                                onChange={(e) =>
                                  handleTransactionChange(index, e)
                                }
                                className="input text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Amount ($)
                              </label>
                              <input
                                type="number"
                                name="amount"
                                step="0.01"
                                value={transaction.amount}
                                onChange={(e) =>
                                  handleTransactionChange(index, e)
                                }
                                className="input text-sm"
                                required
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Method
                              </label>
                              <select
                                name="method"
                                value={transaction.method}
                                onChange={(e) =>
                                  handleTransactionChange(index, e)
                                }
                                className="input text-sm bg-black"
                                required
                              >
                                <option value="cash">Cash</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="card">Card</option>
                                <option value="mobile">Mobile Payment</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Type
                              </label>
                              <select
                                name="type"
                                value={transaction.type}
                                onChange={(e) =>
                                  handleTransactionTypeChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="input text-sm bg-black"
                                required
                              >
                                <option value="advance">Advance</option>
                                <option value="payment">Payment</option>
                                <option value="refund">Refund</option>
                                <option value="pay-in">Pay In</option>
                                <option value="pay-out">Pay Out</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-text-muted mb-1">
                                Status
                              </label>
                              <select
                                name="status"
                                value={transaction.status}
                                onChange={(e) =>
                                  handleTransactionChange(index, e)
                                }
                                className="input text-sm bg-black"
                                required
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                              </select>
                            </div>

                            <div className="lg:col-span-3">
                              <label className="block text-xs text-text-muted mb-1">
                                Notes
                              </label>
                              <input
                                name="note"
                                placeholder="Additional notes..."
                                value={transaction.note}
                                onChange={(e) =>
                                  handleTransactionChange(index, e)
                                }
                                className="input text-sm w-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setActiveSection("products")}
                        className="btn-ghost"
                      >
                        Back to Products
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <TbLoader2 className="animate-spin" size={18} />
                            Creating Consignment...
                          </>
                        ) : (
                          "Create Consignment"
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    message.type === "success"
                      ? "bg-action/10 text-action border-action/20"
                      : "bg-danger/10 text-danger border-danger/20"
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card sticky top-6"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Summary
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Products Value
                    </h4>
                    <div className="text-2xl font-bold text-text-primary">
                      ${totalProductsValue.toFixed(2)}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {consignment.products.length} product(s)
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Product Cost
                    </h4>
                    <div className="text-xl font-semibold text-text-primary">
                      ${totalProductCost.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Shipping Cost
                    </h4>
                    <div className="text-xl font-semibold text-text-primary">
                      ${consignment.shippingCost.toFixed(2)}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Total Amount
                    </h4>
                    <div className="text-xl font-bold text-primary">
                      $
                      {(totalProductsValue + consignment.shippingCost).toFixed(
                        2
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Customer Payments
                    </h4>
                    <div className="text-xl font-semibold text-text-primary">
                      ${customerPayments.toFixed(2)}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {
                        consignment.transactions.filter(
                          (t) => t.party === "customer" && t.direction === "in"
                        ).length
                      }{" "}
                      transaction(s)
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Supplier Payments
                    </h4>
                    <div className="text-xl font-semibold text-text-primary">
                      ${supplierPayments.toFixed(2)}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {
                        consignment.transactions.filter(
                          (t) => t.party === "supplier" && t.direction === "out"
                        ).length
                      }{" "}
                      transaction(s)
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium text-text-secondary mb-2">
                      Balance Due
                    </h4>
                    <div
                      className={`text-xl font-bold ${
                        balanceDue > 0 ? "text-warning" : "text-action"
                      }`}
                    >
                      ${Math.abs(balanceDue).toFixed(2)}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {balanceDue > 0
                        ? "Amount due from customer"
                        : balanceDue < 0
                        ? "Overpayment"
                        : "Fully paid"}
                    </p>
                  </div>

                  <div className="bg-accent rounded-lg p-3">
                    <h4 className="text-sm font-medium text-text-primary mb-1">
                      Profit Summary
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Gross Profit:</span>
                        <span
                          className={`font-semibold ${
                            grossProfit >= 0 ? "text-action" : "text-danger"
                          }`}
                        >
                          ${grossProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Net Profit:</span>
                        <span
                          className={`font-semibold ${
                            netProfit >= 0 ? "text-action" : "text-danger"
                          }`}
                        >
                          ${netProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Profit Margin:</span>
                        <span
                          className={`font-semibold ${
                            profitMargin >= 0 ? "text-action" : "text-danger"
                          }`}
                        >
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent rounded-lg p-3">
                    <h4 className="text-sm font-medium text-text-primary mb-1">
                      Product Status
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">
                          {consignment.productStatus.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivered:</span>
                        <span className="font-semibold text-action">
                          {consignment.productStatus.delivered}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-semibold text-warning">
                          {consignment.productStatus.pending}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refunded:</span>
                        <span className="font-semibold text-danger">
                          {consignment.productStatus.refunded}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewConsignment;

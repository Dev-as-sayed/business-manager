"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BiPackage, BiCalendar, BiDollar } from "react-icons/bi";
import { BsTrash2, BsArrowRight } from "react-icons/bs";
import { TbLoader2 } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";

type ConsignmentForm = {
  consignmentId: string;
  admin: string;
  supplier: string;
  customer: string;
  destination: string;
  startDate: string;
  shippingDate: string;
  deliveryDate: string;
  shippingCost: number;
  status: string;
  products: any[];
  transactions: any[];
};

const sectionVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const UpdateConsignment = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeSection, setActiveSection] = useState<"basic" | "products" | "transactions">("basic");
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [consignment, setConsignment] = useState<ConsignmentForm>({
    consignmentId: "",
    admin: "",
    supplier: "",
    customer: "",
    destination: "Bangladesh",
    startDate: "",
    shippingDate: "",
    deliveryDate: "",
    shippingCost: 0,
    status: "pending",
    products: [],
    transactions: [],
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchConsignment(), fetchCustomers(), fetchSuppliers()]);
  }, [id]);

  const fetchConsignment = async () => {
    try {
      setFetching(true);
      const res = await fetch(`/api/consignments/${id}`);
      const data = await res.json();
      if (data.success && data.consignment) {
        const c = data.consignment;
        setConsignment({
          consignmentId: c.consignmentId || "",
          admin: c.admin?._id || c.admin || "",
          supplier: c.supplier?._id || c.supplier || "",
          customer: c.customer?._id || c.customer || "",
          destination: c.destination || "Bangladesh",
          startDate: c.startDate ? c.startDate.split("T")[0] : "",
          shippingDate: c.shippingDate ? c.shippingDate.split("T")[0] : "",
          deliveryDate: c.deliveryDate ? c.deliveryDate.split("T")[0] : "",
          shippingCost: c.shippingCost || 0,
          status: c.status || "pending",
          products: c.products || [],
          transactions: c.transactions || [],
        });
      }
    } catch (err) {
      console.error("Error fetching consignment:", err);
      toast("error", "Failed to load consignment");
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/users?role=customer");
      const data = await res.json();
      setCustomers(data.users || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/users?role=supplier");
      const data = await res.json();
      setSuppliers(data.users || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConsignment((prev) => ({
      ...prev,
      [name]: name === "shippingCost" ? Number(value) : value,
    }));
  };

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = [...consignment.products];
    updated[index] = {
      ...updated[index],
      [name]: ["quantity", "buyingPrice", "sellingPrice", "deliveredQuantity", "refundedQuantity"].includes(name) ? Number(value) : value,
    };
    setConsignment((prev) => ({ ...prev, products: updated }));
  };

  const addProduct = () => {
    setConsignment((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        { category: "", brand: "", model: "", specs: "", buyingPrice: 0, sellingPrice: 0, quantity: 1, status: "pending", deliveredQuantity: 0, refundedQuantity: 0 },
      ],
    }));
  };

  const removeProduct = (index: number) => {
    if (consignment.products.length <= 1) return;
    const updated = [...consignment.products];
    updated.splice(index, 1);
    setConsignment((prev) => ({ ...prev, products: updated }));
  };

  const handleTransactionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = [...consignment.transactions];
    updated[index] = { ...updated[index], [name]: name === "amount" ? Number(value) : value };
    setConsignment((prev) => ({ ...prev, transactions: updated }));
  };

  const handleTransactionTypeChange = (index: number, type: string) => {
    const updated = [...consignment.transactions];
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
    updated[index] = { ...updated[index], type, direction, party };
    setConsignment((prev) => ({ ...prev, transactions: updated }));
  };

  const addTransaction = () => {
    setConsignment((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        { transactionId: `TXN-${Date.now()}`, date: new Date().toISOString().split("T")[0], amount: 0, method: "cash", type: "advance", direction: "in", party: "customer", note: "", addBy: user?.id || "", status: "completed" },
      ],
    }));
  };

  const removeTransaction = (index: number) => {
    if (consignment.transactions.length <= 1) return;
    const updated = [...consignment.transactions];
    updated.splice(index, 1);
    setConsignment((prev) => ({ ...prev, transactions: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/consignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consignment),
      });
      const data = await res.json();
      if (res.ok) {
        toast("success", "Consignment updated! Redirecting...");
        setTimeout(() => router.push("/dashbord/consignments"), 1500);
      } else {
        toast("error", data.message || "Failed to update");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <TbLoader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <BiPackage className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Update Consignment</h1>
          </div>
          <p className="text-text-secondary">Modify consignment #{consignment.consignmentId}</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {["basic", "products", "transactions"].map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => setActiveSection(step as any)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    activeSection === step ? "bg-primary text-primary-foreground shadow-lg" : "bg-accent text-text-muted"
                  }`}
                >
                  {index + 1}
                </button>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded-full ${
                    activeSection === step ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeSection === "basic" && (
                  <motion.div key="basic" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <BiCalendar /> Basic Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Consignment ID</label>
                        <input name="consignmentId" value={consignment.consignmentId} onChange={handleChange} className="input w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                        <select name="status" value={consignment.status} onChange={handleChange} className="input w-full" required>
                          {["pending", "in-transit", "delivered", "cancelled", "partially-delivered", "refunded"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Customer</label>
                        <select name="customer" value={consignment.customer} onChange={handleChange} className="input w-full" required>
                          <option value="">Select customer</option>
                          {customers.map((c: any) => (
                            <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Supplier</label>
                        <select name="supplier" value={consignment.supplier} onChange={handleChange} className="input w-full" required>
                          <option value="">Select supplier</option>
                          {suppliers.map((s: any) => (
                            <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Destination</label>
                        <input name="destination" value={consignment.destination} onChange={handleChange} className="input w-full" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Shipping Cost</label>
                        <input name="shippingCost" type="number" value={consignment.shippingCost} onChange={handleChange} className="input w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                        <input name="startDate" type="date" value={consignment.startDate} onChange={handleChange} className="input w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Shipping Date</label>
                        <input name="shippingDate" type="date" value={consignment.shippingDate} onChange={handleChange} className="input w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Delivery Date</label>
                        <input name="deliveryDate" type="date" value={consignment.deliveryDate} onChange={handleChange} className="input w-full" />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button type="button" onClick={() => setActiveSection("products")}
                        className="btn-primary flex items-center gap-2">
                        Next: Products <BsArrowRight />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeSection === "products" && (
                  <motion.div key="products" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <BiPackage /> Products ({consignment.products.length})
                      </h2>
                      <button type="button" onClick={addProduct} className="btn-secondary text-sm">+ Add Product</button>
                    </div>
                    {consignment.products.map((product, index) => (
                      <div key={index} className="p-4 bg-accent rounded-xl mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-text-primary">Product #{index + 1}</h3>
                          <button type="button" onClick={() => removeProduct(index)}
                            className="text-red-500 hover:text-red-600">
                            <BsTrash2 />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <select name="category" value={product.category} onChange={(e) => handleProductChange(index, e)} className="input" required>
                            <option value="">Category</option>
                            <option value="mobile">Mobile</option>
                            <option value="laptop">Laptop</option>
                            <option value="accessory">Accessory</option>
                            <option value="other">Other</option>
                          </select>
                          <input name="brand" placeholder="Brand" value={product.brand} onChange={(e) => handleProductChange(index, e)} className="input" required />
                          <input name="model" placeholder="Model" value={product.model} onChange={(e) => handleProductChange(index, e)} className="input" required />
                          <input name="specs" placeholder="Specifications" value={product.specs || ""} onChange={(e) => handleProductChange(index, e)} className="input" />
                          <input name="buyingPrice" type="number" placeholder="Buying Price" value={product.buyingPrice} onChange={(e) => handleProductChange(index, e)} className="input" required />
                          <input name="sellingPrice" type="number" placeholder="Selling Price" value={product.sellingPrice} onChange={(e) => handleProductChange(index, e)} className="input" required />
                          <input name="quantity" type="number" placeholder="Quantity" value={product.quantity} onChange={(e) => handleProductChange(index, e)} className="input" required />
                          <select name="status" value={product.status} onChange={(e) => handleProductChange(index, e)} className="input">
                            <option value="pending">Pending</option>
                            <option value="delivered">Delivered</option>
                            <option value="refunded">Refunded</option>
                            <option value="returned">Returned</option>
                            <option value="damaged">Damaged</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setActiveSection("basic")}
                        className="btn-secondary">Back</button>
                      <button type="button" onClick={() => setActiveSection("transactions")}
                        className="btn-primary flex items-center gap-2">
                        Next: Transactions <BsArrowRight />
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeSection === "transactions" && (
                  <motion.div key="transactions" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <BiDollar /> Transactions ({consignment.transactions.length})
                      </h2>
                      <button type="button" onClick={addTransaction} className="btn-secondary text-sm">+ Add Transaction</button>
                    </div>
                    {consignment.transactions.map((txn, index) => (
                      <div key={index} className="p-4 bg-accent rounded-xl mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-text-primary">Transaction #{index + 1}</h3>
                          <button type="button" onClick={() => removeTransaction(index)}
                            className="text-red-500 hover:text-red-600"><BsTrash2 /></button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <input name="transactionId" value={txn.transactionId} onChange={(e) => handleTransactionChange(index, e)} className="input" required />
                          <input name="date" type="date" value={txn.date ? txn.date.split("T")[0] : ""} onChange={(e) => handleTransactionChange(index, e)} className="input" />
                          <input name="amount" type="number" placeholder="Amount" value={txn.amount} onChange={(e) => handleTransactionChange(index, e)} className="input" required />
                          <select name="method" value={txn.method} onChange={(e) => handleTransactionChange(index, e)} className="input">
                            <option value="cash">Cash</option>
                            <option value="bank">Bank</option>
                            <option value="mobile">Mobile</option>
                            <option value="card">Card</option>
                            <option value="other">Other</option>
                          </select>
                          <select name="type" value={txn.type} onChange={(e) => handleTransactionTypeChange(index, e.target.value)} className="input">
                            <option value="advance">Advance</option>
                            <option value="payment">Payment</option>
                            <option value="refund">Refund</option>
                            <option value="pay-in">Pay-in</option>
                            <option value="pay-out">Pay-out</option>
                          </select>
                          <input name="note" placeholder="Note" value={txn.note || ""} onChange={(e) => handleTransactionChange(index, e)} className="input" />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setActiveSection("products")}
                        className="btn-secondary">Back</button>
                      <button type="submit" disabled={saving}
                        className="btn-primary flex items-center gap-2">
                        {saving ? <TbLoader2 className="animate-spin" /> : null}
                        {saving ? "Saving..." : "Update Consignment"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Sidebar */}
            <div className="card h-fit">
              <h3 className="font-semibold text-text-primary mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Products</span>
                  <span className="font-medium">{consignment.products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Transactions</span>
                  <span className="font-medium">{consignment.transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping Cost</span>
                  <span className="font-medium">${consignment.shippingCost.toLocaleString()}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className="font-medium capitalize">{consignment.status}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateConsignment;

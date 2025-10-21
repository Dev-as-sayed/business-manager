"use client";

import { useState } from "react";
import { BiPlus } from "react-icons/bi";
import { BsTrash2 } from "react-icons/bs";
import { TbLoader2 } from "react-icons/tb";

const AddNewConsignment = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [consignment, setConsignment] = useState({
    consignmentId: "",
    supplier: "",
    customer: "",
    destination: "",
    startDate: "",
    shippingDate: "",
    deliveryDate: "",
    shippingCost: 0,
    products: [
      {
        category: "mobile",
        brand: "",
        model: "",
        specs: "",
        buyingPrice: 0,
        sellingPrice: 0,
        quantity: 1,
      },
    ],
    transactions: [
      {
        transactionId: "",
        date: "",
        amount: 0,
        method: "cash",
        type: "advance",
        note: "",
      },
    ],
  });

  // ✅ handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setConsignment((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ handle product changes
  const handleProductChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedProducts = [...consignment.products];
    updatedProducts[index] = { ...updatedProducts[index], [name]: value };
    setConsignment((prev) => ({ ...prev, products: updatedProducts }));
  };

  // ✅ add/remove product
  const addProduct = () => {
    setConsignment((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          category: "mobile",
          brand: "",
          model: "",
          specs: "",
          buyingPrice: 0,
          sellingPrice: 0,
          quantity: 1,
        },
      ],
    }));
  };

  const removeProduct = (index: number) => {
    const updated = [...consignment.products];
    updated.splice(index, 1);
    setConsignment((prev) => ({ ...prev, products: updated }));
  };

  // ✅ handle transaction changes
  const handleTransactionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedTransactions = [...consignment.transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      [name]: value,
    };
    setConsignment((prev) => ({ ...prev, transactions: updatedTransactions }));
  };

  // ✅ add/remove transaction
  const addTransaction = () => {
    setConsignment((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        {
          transactionId: "",
          date: "",
          amount: 0,
          method: "cash",
          type: "advance",
          note: "",
        },
      ],
    }));
  };

  const removeTransaction = (index: number) => {
    const updated = [...consignment.transactions];
    updated.splice(index, 1);
    setConsignment((prev) => ({ ...prev, transactions: updated }));
  };

  // ✅ submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/consignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consignment),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Consignment added successfully!");
        setConsignment({
          consignmentId: "",
          supplier: "",
          customer: "",
          destination: "",
          startDate: "",
          shippingDate: "",
          deliveryDate: "",
          shippingCost: 0,
          products: [
            {
              category: "mobile",
              brand: "",
              model: "",
              specs: "",
              buyingPrice: 0,
              sellingPrice: 0,
              quantity: 1,
            },
          ],
          transactions: [
            {
              transactionId: "",
              date: "",
              amount: 0,
              method: "cash",
              type: "advance",
              note: "",
            },
          ],
        });
      } else {
        setMessage("❌ " + data.message);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMessage("❌ Failed to create consignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Add New Consignment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="consignmentId"
            placeholder="Consignment ID"
            value={consignment.consignmentId}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="supplier"
            placeholder="Supplier ID"
            value={consignment.supplier}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="customer"
            placeholder="Customer ID"
            value={consignment.customer}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            name="destination"
            placeholder="Destination"
            value={consignment.destination}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="startDate"
            value={consignment.startDate}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="shippingCost"
            placeholder="Shipping Cost"
            value={consignment.shippingCost}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>

        {/* Products */}
        <div>
          <h3 className="font-semibold mt-4 mb-2 flex items-center gap-2">
            Products{" "}
            <button
              type="button"
              onClick={addProduct}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              <BiPlus size={14} />
              Add
            </button>
          </h3>
          {consignment.products.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-2 mb-2 border p-2 rounded"
            >
              <select
                name="category"
                value={p.category}
                onChange={(e) => handleProductChange(i, e)}
                className="border p-2 rounded"
              >
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
                <option value="accessory">Accessory</option>
                <option value="other">Other</option>
              </select>
              <input
                name="brand"
                placeholder="Brand"
                value={p.brand}
                onChange={(e) => handleProductChange(i, e)}
                className="border p-2 rounded"
              />
              <input
                name="model"
                placeholder="Model"
                value={p.model}
                onChange={(e) => handleProductChange(i, e)}
                className="border p-2 rounded"
              />
              <input
                name="buyingPrice"
                type="number"
                placeholder="Buying"
                value={p.buyingPrice}
                onChange={(e) => handleProductChange(i, e)}
                className="border p-2 rounded"
              />
              <input
                name="sellingPrice"
                type="number"
                placeholder="Selling"
                value={p.sellingPrice}
                onChange={(e) => handleProductChange(i, e)}
                className="border p-2 rounded"
              />
              <input
                name="quantity"
                type="number"
                placeholder="Qty"
                value={p.quantity}
                onChange={(e) => handleProductChange(i, e)}
                className="border p-2 rounded"
              />
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeProduct(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <BsTrash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div>
          <h3 className="font-semibold mt-4 mb-2 flex items-center gap-2">
            Transactions{" "}
            <button
              type="button"
              onClick={addTransaction}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              <BiPlus size={14} />
              Add
            </button>
          </h3>
          {consignment.transactions.map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-2 mb-2 border p-2 rounded"
            >
              <input
                name="transactionId"
                placeholder="Transaction ID"
                value={t.transactionId}
                onChange={(e) => handleTransactionChange(i, e)}
                className="border p-2 rounded"
              />
              <input
                type="date"
                name="date"
                value={t.date}
                onChange={(e) => handleTransactionChange(i, e)}
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={t.amount}
                onChange={(e) => handleTransactionChange(i, e)}
                className="border p-2 rounded"
              />
              <select
                name="method"
                value={t.method}
                onChange={(e) => handleTransactionChange(i, e)}
                className="border p-2 rounded"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile">Mobile</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
              <select
                name="type"
                value={t.type}
                onChange={(e) => handleTransactionChange(i, e)}
                className="border p-2 rounded"
              >
                <option value="advance">Advance</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </select>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeTransaction(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <BsTrash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <TbLoader2 className="animate-spin" size={18} />
          ) : (
            "Add Consignment"
          )}
        </button>

        {message && <p className="mt-2 text-sm">{message}</p>}
      </form>
    </div>
  );
};

export default AddNewConsignment;

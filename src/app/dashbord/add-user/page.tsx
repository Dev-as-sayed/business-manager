"use client";

import { useState } from "react";
import { RiLoader2Line } from "react-icons/ri";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    address: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 🧠 Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🚀 Submit user registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add user");
      }

      setMessage({ type: "success", text: "User added successfully!" });
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
        phone: "",
        address: "",
        avatar: "",
      });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-secondary-background p-8 rounded-2xl shadow-card border border-border">
        <h2 className="text-2xl font-semibold text-center mb-6 text-text-primary">
          Add New User
        </h2>

        {message && (
          <div
            className={`text-center mb-4 p-3 rounded-lg border ${
              message.type === "success"
                ? "bg-action/10 text-action border-action/20"
                : "bg-danger/10 text-danger border-danger/20"
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input w-full bg-background text-text-primary placeholder-text-muted focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input w-full bg-background text-text-primary placeholder-text-muted focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input w-full bg-background text-text-primary placeholder-text-muted focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input w-full bg-background text-text-primary focus:ring-primary focus:border-primary"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>

          <div>
            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="input w-full bg-background text-text-primary placeholder-text-muted focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="input w-full bg-background text-text-primary placeholder-text-muted focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <input
              name="avatar"
              placeholder="Avatar URL (optional)"
              value={formData.avatar}
              onChange={handleChange}
              className="input w-full bg-background text-text-primary placeholder-text-muted focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full bg-primary text-primary-foreground hover:bg-primary-hover flex justify-center items-center py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RiLoader2Line className="animate-spin mr-2 h-5 w-5" />
                Adding User...
              </>
            ) : (
              "Add User"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;

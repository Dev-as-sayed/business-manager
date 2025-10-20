"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { RiLoader2Fill } from "react-icons/ri";

const AuthPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  // 🧠 State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🚀 Handle Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // ✅ Save token & user info in context
      login(data.token, data.user);

      // 🧭 Redirect to dashboard or home
      router.push("/dashboard");
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-accent p-8 rounded-2xl shadow-xl border border-border">
        <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">
          Sign In to Your Account
        </h1>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-lg transition"
          >
            {loading ? (
              <RiLoader2Fill className="w-4 h-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-primary hover:text-primary-hover font-medium"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

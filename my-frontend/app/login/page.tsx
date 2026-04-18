// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-semibold text-slate-900"
        >
          Clinician Login
        </motion.h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access patient predictions and reports.
        </p>

        {/* form OPEN */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
           {/* Inputs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-xs font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </motion.div>

          {/* Error animation */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-600 mt-1"
            >
              {error}
            </motion.p>
          )}

          {/* Button animation */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Log in"}
          </motion.button>
        </form>

        <p className="mt-3 text-xs text-slate-500">
          Need an account?{" "}
          <a href="/signup" className="text-slate-900 font-medium">
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settings-store";

export default function ForgotPasswordPage() {
  const { settings } = useSettingsStore();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(API.auth.forgotPassword, { email });
      if (data.success) {
        setSent(true);
        toast.success("Reset link sent!");
      } else {
        toast.error(data.message || "Failed to send reset link.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-playfair text-[#CF1432]">{settings.appName || "SG"}</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {sent ? "Check your email for the reset link." : "Enter your email to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Button type="submit" loading={loading} size="lg" className="w-full rounded-full mt-2">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            If <span className="font-semibold text-gray-700">{email}</span> is registered, you will receive a password reset link shortly.
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-[#CF1432] font-semibold hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

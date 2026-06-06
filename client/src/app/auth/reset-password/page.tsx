"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settings-store";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { settings } = useSettingsStore();

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    if (password.length < 6)  { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { data } = await api.post(API.auth.resetPassword, { token, newPassword: password });
      if (data.success) {
        toast.success("Password reset! Please login.");
        router.push("/auth/login");
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        Invalid or missing reset token.{" "}
        <Link href="/auth/forgot-password" className="text-[#CF1432] font-semibold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-playfair text-[#CF1432]">{settings.appName || "SG"}</h1>
          <p className="text-gray-500 mt-2 text-sm">Enter your new password</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type={showPw ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPw(!showPw)} className="cursor-pointer">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <Button type="submit" loading={loading} size="lg" className="w-full rounded-full mt-2">
            Reset Password
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-[#CF1432] font-semibold hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

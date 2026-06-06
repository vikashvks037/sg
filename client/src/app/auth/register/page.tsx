"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { useAuth } from "@/hooks/use-auth";
import { useSettingsStore } from "@/store/settings-store";

export default function RegisterPage() {
  const { register } = useAuth();
  const { settings } = useSettingsStore();
  const [form, setForm] = useState({ userName: "", email: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(form);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-playfair text-[#CF1432]">{settings.appName || "SG"}</h1>
          <p className="text-gray-500 mt-2 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Username" placeholder="johndoe" value={form.userName} onChange={set("userName")} required leftIcon={<User className="w-4 h-4" />} />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required leftIcon={<Mail className="w-4 h-4" />} />
          <Input label="Phone" type="tel" placeholder="+91 9999999999" value={form.phone} onChange={set("phone")} leftIcon={<Phone className="w-4 h-4" />} />
          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            placeholder="Create a strong password"
            value={form.password}
            onChange={set("password")}
            required
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Button type="submit" loading={loading} size="lg" className="w-full rounded-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#CF1432] font-semibold hover:underline">Sign in</Link>
        </p>
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Shop</Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import Notice from "@/components/ui/Notice";
import { api, setSession, getSession } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s && (s.role === "Admin" || s.role === "Super Admin")) router.replace("/admin/dashboard");
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<{
        access_token: string;
        role: string;
        id: number;
        name: string;
        email: string;
      }>("/auth/admin/login", { email, password });
      setSession(data);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="paper-texture flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="stamp-badge mx-auto mb-4 inline-flex border-ink text-ink text-xs">Headquarters</span>
          <h1 className="font-display text-2xl font-bold text-ink">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-ink/10 bg-paper-card p-7 shadow-card">
          {error && <Notice kind="error">{error}</Notice>}
          <Input
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@department.gov"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/50">
          Field center instead?{" "}
          <Link href="/login/center" className="font-semibold text-stamp hover:underline">
            Center login
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-xs text-ink/40 hover:underline">
            ← Back
          </Link>
        </p>
      </div>
    </main>
  );
}

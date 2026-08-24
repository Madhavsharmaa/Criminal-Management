"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

const NAV = [
  { href: "/center/dashboard", label: "Dashboard" },
  { href: "/center/criminals", label: "Criminal Records" },
  { href: "/center/remarks", label: "My Remarks" },
  { href: "/center/change-password", label: "Change Password" },
];

export default function CenterDashboardPage() {
  const session = useRequireAuth(["Center"], "/login/center");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (session) api.get<DashboardStats>("/dashboard/stats").then(setStats).catch(() => {});
  }, [session]);

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel="Center" userName={session.name} loginPath="/login/center">
      <header className="mb-8">
        <p className="case-label text-brass-dark">Overview</p>
        <h1 className="font-display text-3xl font-bold text-ink">Welcome, {session.name}</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="font-display text-4xl font-extrabold text-ink">{stats?.total_criminals ?? "—"}</p>
          <p className="case-label mt-2 text-ink/40">Criminal Records</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-4xl font-extrabold text-ink">{stats?.my_remarks ?? "—"}</p>
          <p className="case-label mt-2 text-ink/40">Remarks Logged By You</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-4xl font-extrabold text-ink">{stats?.total_categories ?? "—"}</p>
          <p className="case-label mt-2 text-ink/40">Categories</p>
        </Card>
      </div>
    </AppShell>
  );
}

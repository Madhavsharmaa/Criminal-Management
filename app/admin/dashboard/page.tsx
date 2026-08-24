"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/criminals", label: "Criminal Records" },
  { href: "/admin/scan", label: "Face Scan" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/centers", label: "Centers" },
  { href: "/admin/remarks", label: "Remarks" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/admins", label: "Administrators" },
  { href: "/admin/change-password", label: "Change Password" },
];

const STAT_LABELS: Record<string, string> = {
  total_admins: "Administrators",
  total_centers: "Centers",
  total_criminals: "Criminal Records",
  total_categories: "Categories",
  total_locations: "Locations",
  total_remarks: "Remarks Logged",
  total_reports: "Reports Filed",
};

export default function AdminDashboardPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api
      .get<DashboardStats>("/dashboard/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, [session]);

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-8">
        <p className="case-label text-brass-dark">Overview</p>
        <h1 className="font-display text-3xl font-bold text-ink">Welcome back, {session.name}</h1>
      </header>

      {error && <p className="text-sm text-stamp">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats &&
          Object.entries(stats)
            .filter(([k]) => k !== "role")
            .map(([key, value]) => (
              <Card key={key} className="text-center">
                <p className="font-display text-4xl font-extrabold text-ink">{value}</p>
                <p className="case-label mt-2 text-ink/40">{STAT_LABELS[key] || key}</p>
              </Card>
            ))}
      </div>
    </AppShell>
  );
}

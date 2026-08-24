"use client";

import AppShell from "@/components/layout/AppShell";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { useRequireAuth } from "@/lib/useAuth";

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

export default function AdminChangePasswordPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Account</p>
        <h1 className="font-display text-3xl font-bold text-ink">Change Password</h1>
      </header>
      <ChangePasswordForm email={session.email} />
    </AppShell>
  );
}

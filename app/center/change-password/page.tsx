"use client";

import AppShell from "@/components/layout/AppShell";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { useRequireAuth } from "@/lib/useAuth";

const NAV = [
  { href: "/center/dashboard", label: "Dashboard" },
  { href: "/center/criminals", label: "Criminal Records" },
  { href: "/center/remarks", label: "My Remarks" },
  { href: "/center/change-password", label: "Change Password" },
];

export default function CenterChangePasswordPage() {
  const session = useRequireAuth(["Center"], "/login/center");
  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel="Center" userName={session.name} loginPath="/login/center">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Account</p>
        <h1 className="font-display text-3xl font-bold text-ink">Change Password</h1>
      </header>
      <ChangePasswordForm email={session.email} />
    </AppShell>
  );
}

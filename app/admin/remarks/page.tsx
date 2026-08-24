"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Remark } from "@/lib/types";

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

export default function RemarksPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    try {
      const rows = await api.get<Remark[]>("/remarks");
      setRemarks(rows.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load remarks");
    }
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this remark?")) return;
    try {
      await api.delete(`/remarks/${id}`);
      setNotice("Remark deleted.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete remark");
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Field Notes</p>
        <h1 className="font-display text-3xl font-bold text-ink">Remarks</h1>
        <p className="mt-1 text-sm text-ink/60">Notes logged by field centers against criminal records.</p>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <Card padded={false}>
        <table className="w-full text-left text-sm">
          <thead className="case-label text-ink/40">
            <tr className="border-b border-ink/10">
              <th className="px-4 py-3">Criminal</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Remark</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {remarks.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0 align-top">
                <td className="px-4 py-3 font-medium text-ink">{r.criminal_name}</td>
                <td className="px-4 py-3 font-mono text-ink/60">{r.date}</td>
                <td className="px-4 py-3 font-mono text-ink/60">{r.time}</td>
                <td className="px-4 py-3 text-ink/70">{r.description}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="text-xs font-semibold text-stamp hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {remarks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/40">
                  No remarks logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}

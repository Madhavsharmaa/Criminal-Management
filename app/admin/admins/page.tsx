"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Admin } from "@/lib/types";

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

const emptyForm = { name: "", email: "", mobile: "", password: "", role: "Admin" };

export default function AdminsPage() {
  const session = useRequireAuth(["Super Admin"], "/login/admin");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      setAdmins(await api.get<Admin[]>("/admins"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load administrators");
    }
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await api.post("/admins", form);
      setCreateOpen(false);
      setForm(emptyForm);
      setNotice("Administrator added.");
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not add administrator");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Admin) {
    if (!confirm(`Remove administrator "${a.name}"?`)) return;
    setError(null);
    try {
      await api.delete(`/admins/${a.id}`);
      setNotice("Administrator removed.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove administrator");
    }
  }

  if (!session) return null;

  // Only a Super Admin can even reach this page (per useRequireAuth above),
  // but non-super-admins hitting the API directly get a clean 403 from the backend too.
  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="case-label text-brass-dark">Access Control</p>
          <h1 className="font-display text-3xl font-bold text-ink">Administrators</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Add Administrator</Button>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <Card padded={false}>
        <table className="w-full text-left text-sm">
          <thead className="case-label text-ink/40">
            <tr className="border-b border-ink/10">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{a.name}</td>
                <td className="px-4 py-3 text-ink/60">{a.email}</td>
                <td className="px-4 py-3 font-mono text-ink/60">{a.mobile}</td>
                <td className="px-4 py-3 text-ink/60">{a.role}</td>
                <td className="px-4 py-3 text-right">
                  {a.id !== session.id && (
                    <button onClick={() => handleDelete(a)} className="text-xs font-semibold text-stamp hover:underline">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Administrator">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          {formError && <Notice kind="error">{formError}</Notice>}
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input label="Mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option>Admin</option>
            <option>Super Admin</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Add administrator
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

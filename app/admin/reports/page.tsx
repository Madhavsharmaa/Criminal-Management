"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Report } from "@/lib/types";

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

const emptyForm = { title: "", description: "", criminal_name: "", contact: "", email: "", address: "" };

export default function ReportsPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    setReports(await api.get<Report[]>("/reports"));
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
      await api.post("/reports", form);
      setCreateOpen(false);
      setForm(emptyForm);
      setNotice("Report filed.");
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not file report");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this report?")) return;
    setError(null);
    try {
      await api.delete(`/reports/${id}`);
      setNotice("Report deleted.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete report");
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="case-label text-brass-dark">Incident Log</p>
          <h1 className="font-display text-3xl font-bold text-ink">Reports</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ File Report</Button>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <div className="grid gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="case-label text-brass-dark">{r.date}</p>
                <h2 className="font-display text-lg font-bold text-ink">{r.title}</h2>
              </div>
              <button onClick={() => handleDelete(r.id)} className="text-xs font-semibold text-stamp hover:underline">
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm text-ink/70">{r.description}</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-3 text-xs text-ink/50">
              <div>
                <dt className="case-label">Subject</dt>
                <dd className="mt-1 text-ink">{r.criminal_name}</dd>
              </div>
              <div>
                <dt className="case-label">Contact</dt>
                <dd className="mt-1 font-mono text-ink">{r.contact}</dd>
              </div>
              <div>
                <dt className="case-label">Email</dt>
                <dd className="mt-1 text-ink">{r.email}</dd>
              </div>
            </dl>
          </Card>
        ))}
        {reports.length === 0 && (
          <Card>
            <p className="text-center text-ink/40">No reports filed yet.</p>
          </Card>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="File Report" wide>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          {formError && (
            <div className="sm:col-span-2">
              <Notice kind="error">{formError}</Notice>
            </div>
          )}
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input
            label="Related criminal name"
            required
            value={form.criminal_name}
            onChange={(e) => setForm({ ...form, criminal_name: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <Input
            label="Contact number"
            required
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <Input
            label="Contact email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              File report
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

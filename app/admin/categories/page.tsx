"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Field";
import Notice from "@/components/ui/Notice";
import { useRequireAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

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

export default function CategoriesPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setCategories(await api.get<Category[]>("/categories"));
  }

  useEffect(() => {
    if (session) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post("/categories", { name, description });
      setName("");
      setDescription("");
      setNotice("Category added.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(catName: string) {
    if (!confirm(`Delete category "${catName}"?`)) return;
    setError(null);
    try {
      await api.delete(`/categories/${encodeURIComponent(catName)}`);
      setNotice("Category deleted.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6">
        <p className="case-label text-brass-dark">Taxonomy</p>
        <h1 className="font-display text-3xl font-bold text-ink">Categories</h1>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="case-label mb-4 text-brass-dark">Add category</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <TextArea
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" loading={saving}>
              Add category
            </Button>
          </form>
        </Card>

        <Card padded={false}>
          <table className="w-full text-left text-sm">
            <thead className="case-label text-ink/40">
              <tr className="border-b border-ink/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.name} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-ink/60">{c.description}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.name)} className="text-xs font-semibold text-stamp hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink/40">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}

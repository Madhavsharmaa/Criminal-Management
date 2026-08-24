"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, Select, TextArea } from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import Notice from "@/components/ui/Notice";
import StampBadge from "@/components/ui/StampBadge";
import { useRequireAuth } from "@/lib/useAuth";
import { api, uploadUrl } from "@/lib/api";
import type { Category, Criminal } from "@/lib/types";

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

const emptyForm = {
  name: "",
  gender: "Male",
  dob: "",
  mobile: "",
  address: "",
  family_member: "",
  relation_type: "",
  member_contact: "",
  category: "",
};

export default function AdminCriminalsPage() {
  const session = useRequireAuth(["Admin", "Super Admin"], "/login/admin");
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Criminal | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);

  async function loadAll(q?: string) {
    setLoading(true);
    setError(null);
    try {
      const [c, cats] = await Promise.all([
        api.get<Criminal[]>(`/criminals${q ? `?q=${encodeURIComponent(q)}` : ""}`),
        api.get<Category[]>("/categories"),
      ]);
      setCriminals(c);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function search(e: FormEvent) {
    e.preventDefault();
    loadAll(query);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);
      await api.postForm("/criminals", fd);
      setCreateOpen(false);
      setForm(emptyForm);
      setImageFile(null);
      setNotice("Criminal record added.");
      loadAll(query);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not save record");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(c: Criminal) {
    setEditTarget(c);
    setEditForm({
      name: c.name,
      gender: c.gender,
      dob: c.dob,
      mobile: c.mobile,
      address: c.address,
      family_member: c.family_member,
      relation_type: c.relation_type || "",
      member_contact: c.member_contact,
      category: c.category,
    });
    setEditError(null);
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditError(null);
    setSaving(true);
    try {
      await api.put(`/criminals/${editTarget.id}`, editForm);
      setEditTarget(null);
      setNotice("Record updated.");
      loadAll(query);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not update record");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Criminal) {
    if (!confirm(`Delete the record for ${c.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/criminals/${c.id}`);
      setNotice("Record deleted.");
      loadAll(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record");
    }
  }

  if (!session) return null;

  return (
    <AppShell navItems={NAV} roleLabel={session.role} userName={session.name} loginPath="/login/admin">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="case-label text-brass-dark">Records</p>
          <h1 className="font-display text-3xl font-bold text-ink">Criminal Records</h1>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Add Criminal</Button>
      </header>

      {notice && <div className="mb-4"><Notice kind="success">{notice}</Notice></div>}
      {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

      <Card padded={false} className="mb-6">
        <form onSubmit={search} className="flex gap-3 p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, mobile, category, address…"
            className="flex-1 rounded-md border border-ink/15 bg-paper-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stamp/40"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {query && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setQuery("");
                loadAll();
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="case-label text-ink/40">
              <tr className="border-b border-ink/10">
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Id</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Dataset</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink/40">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && criminals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink/40">
                    No records found.
                  </td>
                </tr>
              )}
              {criminals.map((c) => {
                const photo = uploadUrl(c.image);
                return (
                  <tr key={c.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-dim/40">
                    <td className="px-4 py-3">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt={c.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/10 text-xs text-ink/40">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink/60">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link href={`/admin/criminals/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StampBadge>{c.category}</StampBadge>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink/60">{c.mobile}</td>
                    <td className="px-4 py-3 text-ink/60">{c.dataset_count} photo(s)</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/criminals/${c.id}`} className="text-xs font-semibold text-brass-dark hover:underline">
                          Face ID
                        </Link>
                        <button onClick={() => openEdit(c)} className="text-xs font-semibold text-ink/60 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(c)} className="text-xs font-semibold text-stamp hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Criminal" wide>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          {createError && (
            <div className="sm:col-span-2">
              <Notice kind="error">{createError}</Notice>
            </div>
          )}
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </Select>
          <Input
            label="Date of birth"
            type="date"
            required
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />
          <Input
            label="Mobile"
            required
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Address"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <Input
            label="Family member"
            required
            value={form.family_member}
            onChange={(e) => setForm({ ...form, family_member: e.target.value })}
          />
          <Input
            label="Relation"
            placeholder="Father / Mother / Guardian…"
            value={form.relation_type}
            onChange={(e) => setForm({ ...form, relation_type: e.target.value })}
          />
          <Input
            label="Member contact"
            required
            value={form.member_contact}
            onChange={(e) => setForm({ ...form, member_contact: e.target.value })}
          />
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category…</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <label className="case-label text-ink/60">Photo (must contain a detectable face)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1.5 block w-full text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit ${editTarget?.name || ""}`} wide>
        <form onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
          {editError && (
            <div className="sm:col-span-2">
              <Notice kind="error">{editError}</Notice>
            </div>
          )}
          <Input label="Name" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Select label="Gender" value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </Select>
          <Input
            label="Date of birth"
            type="date"
            required
            value={editForm.dob}
            onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
          />
          <Input
            label="Mobile"
            required
            value={editForm.mobile}
            onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Address"
              required
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
            />
          </div>
          <Input
            label="Family member"
            required
            value={editForm.family_member}
            onChange={(e) => setEditForm({ ...editForm, family_member: e.target.value })}
          />
          <Input
            label="Relation"
            value={editForm.relation_type}
            onChange={(e) => setEditForm({ ...editForm, relation_type: e.target.value })}
          />
          <Input
            label="Member contact"
            required
            value={editForm.member_contact}
            onChange={(e) => setEditForm({ ...editForm, member_contact: e.target.value })}
          />
          <Select
            label="Category"
            required
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

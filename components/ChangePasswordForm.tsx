"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import Notice from "@/components/ui/Notice";
import { api } from "@/lib/api";

export default function ChangePasswordForm({ email }: { email: string }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", { old_password: oldPassword, new_password: newPassword });
      setNotice("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-md">
      <h2 className="case-label mb-4 text-brass-dark">Update your password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {notice && <Notice kind="success">{notice}</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
        <Input label="Email" value={email} disabled />
        <Input
          label="Current password"
          type="password"
          required
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          required
          minLength={4}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" loading={saving}>
          Update password
        </Button>
      </form>
    </Card>
  );
}

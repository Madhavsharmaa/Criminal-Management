"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "./api";

export interface Session {
  token: string;
  role: string;
  name: string;
  email: string;
  id: number;
}

/**
 * Redirects to the right login page if there's no session, or if the role
 * doesn't match what this area of the app requires.
 */
export function useRequireAuth(allowedRoles: string[], loginPath: string): Session | null {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || !allowedRoles.includes(s.role)) {
      router.replace(loginPath);
      return;
    }
    setSession(s);
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return checked ? session : null;
}

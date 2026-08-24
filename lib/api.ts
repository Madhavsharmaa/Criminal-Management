export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("cfm_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("cfm_token", token);
  else window.localStorage.removeItem("cfm_token");
}

export function setSession(data: { access_token: string; role: string; id: number; name: string; email: string }) {
  setToken(data.access_token);
  window.localStorage.setItem("cfm_role", data.role);
  window.localStorage.setItem("cfm_name", data.name);
  window.localStorage.setItem("cfm_email", data.email);
  window.localStorage.setItem("cfm_id", String(data.id));
}

export function clearSession() {
  setToken(null);
  ["cfm_role", "cfm_name", "cfm_email", "cfm_id"].forEach((k) => window.localStorage.removeItem(k));
}

export function getSession() {
  if (typeof window === "undefined") return null;
  const token = getToken();
  if (!token) return null;
  return {
    token,
    role: window.localStorage.getItem("cfm_role") || "",
    name: window.localStorage.getItem("cfm_name") || "",
    email: window.localStorage.getItem("cfm_email") || "",
    id: Number(window.localStorage.getItem("cfm_id") || 0),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (!(options.body instanceof FormData) && !headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") {
      const isCenter = window.location.pathname.startsWith("/center");
      window.location.href = isCenter ? "/login/center" : "/login/admin";
    }
    throw new ApiError("Session expired, please log in again", 401);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: "GET" }),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  postForm: <T,>(path: string, formData: FormData) => request<T>(path, { method: "POST", body: formData }),
  putForm: <T,>(path: string, formData: FormData) => request<T>(path, { method: "PUT", body: formData }),
  put: <T,>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function uploadUrl(filename?: string | null) {
  if (!filename) return null;
  return `${API_URL}/uploads/criminals/${filename}`;
}

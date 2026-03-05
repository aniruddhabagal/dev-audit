/**
 * Typed API client for the DevAudit backend.
 *
 * All methods auto-attach the backend JWT from the NextAuth session.
 * Base URL comes from NEXT_PUBLIC_API_URL env var.
 */

import type {
  AuditCreate,
  AuditListItem,
  AuditResponse,
  UserResponse,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Core fetch helper ────────────────────────────────────

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchWithAuth<T>(
  path: string,
  token: string | undefined,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail || "Request failed", res.status);
  }

  return res.json() as Promise<T>;
}

// ── Public API methods ───────────────────────────────────

export async function startAudit(
  repoUrl: string,
  token: string
): Promise<AuditResponse> {
  const body: AuditCreate = { repo_url: repoUrl };
  return fetchWithAuth<AuditResponse>("/api/v1/audits/start", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAudit(
  id: string,
  token: string
): Promise<AuditResponse> {
  return fetchWithAuth<AuditResponse>(`/api/v1/audits/${id}`, token);
}

export async function listAudits(
  token: string,
  skip = 0,
  limit = 20
): Promise<AuditListItem[]> {
  return fetchWithAuth<AuditListItem[]>(
    `/api/v1/audits/?skip=${skip}&limit=${limit}`,
    token
  );
}

export async function getMe(token: string): Promise<UserResponse> {
  return fetchWithAuth<UserResponse>("/api/v1/auth/me", token);
}

export { ApiError };

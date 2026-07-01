/**
 * Shared API client for the FastAPI backend.
 *
 * - Sends cookies (credentials: "include") so the backend can verify the
 *   Better Auth session.
 * - Generates and propagates an X-Request-ID for tracing.
 * - Unwraps the standard { data, error, meta } envelope.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://ott-streaming-platform.onrender.com";

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export class ApiClientError extends Error {
  constructor(public readonly error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
  }
}

function requestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Math.random().toString(16).slice(2);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": requestId(),
      ...(init.headers || {}),
    },
  });

  let body: { data: T | null; error: ApiError | null } | null = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok || (body && body.error)) {
    const error: ApiError = body?.error ?? {
      code: "NETWORK_ERROR",
      message: `Request failed (${res.status})`,
      status: res.status,
    };
    throw new ApiClientError(error);
  }

  return (body?.data as T) ?? (null as T);
}

export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  email_verified: boolean;
}

export const api = {
  me: () => apiFetch<MeResponse>("/api/v1/auth/me"),
  health: () => apiFetch<{ status: string; service: string; version: string }>("/api/v1/health"),
};

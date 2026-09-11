/**
 * HTTP client.
 * Built on axios — the only place in the project that creates an axios instance.
 * All service modules must go through `api`; never create axios instances directly.
 *
 * Token refresh:
 *   When the backend returns 401 { code: "TOKEN_EXPIRED" }, this client
 *   transparently calls POST /auth/refresh-session (the browser sends the
 *   HttpOnly refresh cookie automatically), updates the Supabase session,
 *   and retries the original request exactly once.
 *
 *   A module-level refresh lock prevents concurrent TOKEN_EXPIRED responses
 *   from each firing their own refresh request (the backend rotates the
 *   refresh token, making it single-use).
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { config } from "@/lib/constants/config";
import { createSupabaseBrowserClient } from "@/services/supabase/client";
import type { RefreshSessionResponse } from "@/types/auth.types";

// ---------------------------------------------------------------------------
// Extend InternalAxiosRequestConfig to carry our retry flag
// ---------------------------------------------------------------------------

interface RequestConfigWithRetry extends InternalAxiosRequestConfig {
  /** True after a token refresh has already been attempted for this request. */
  _retry?: boolean;
  /** True for the refresh request itself — prevents infinite refresh loops. */
  _isRefreshRequest?: boolean;
}

// ---------------------------------------------------------------------------
// Shared refresh lock
//
// Only one refresh request may be in-flight at a time.
// Other requests that encounter TOKEN_EXPIRED while a refresh is running are
// queued here and resolved/rejected once the single refresh completes.
// ---------------------------------------------------------------------------

let isRefreshing = false;

type RefreshCallback = (accessToken: string) => void;
type RefreshRejectCallback = (error: unknown) => void;

let refreshSubscribers: Array<{
  resolve: RefreshCallback;
  reject: RefreshRejectCallback;
}> = [];

/**
 * Notify all queued requests of the outcome of the single refresh call.
 * On success: each callback re-attaches the new token and retries.
 * On failure: each callback propagates the error so callers can reject.
 */
function resolveRefreshSubscribers(newAccessToken: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(newAccessToken));
  refreshSubscribers = [];
}

function rejectRefreshSubscribers(error: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
}

/**
 * Queue this request to retry once an in-flight refresh completes.
 * Returns a promise that resolves with the new access token or rejects.
 */
function waitForRefresh(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    refreshSubscribers.push({ resolve, reject });
  });
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  /**
   * withCredentials must be true so the browser automatically includes
   * the HttpOnly refresh-token cookie when calling POST /auth/refresh-session.
   * It is safe to enable globally — cross-origin credentialed requests are
   * still subject to the server's CORS Access-Control-Allow-Credentials header.
   */
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Request interceptor — URL normalisation (unchanged from original)
// ---------------------------------------------------------------------------

api.interceptors.request.use((requestConfig) => {
  if (requestConfig.url) {
    if (requestConfig.url.startsWith("/api/v1/")) {
      requestConfig.url = requestConfig.url.replace(/^\/api\/v1\//, "/");
    } else if (requestConfig.url.startsWith("/api/v1")) {
      requestConfig.url = requestConfig.url.replace(/^\/api\/v1/, "/");
    } else if (requestConfig.url.startsWith("/v1/")) {
      requestConfig.url = requestConfig.url.replace(/^\/v1\//, "/");
    } else if (requestConfig.url.startsWith("/v1")) {
      requestConfig.url = requestConfig.url.replace(/^\/v1/, "/");
    }
  }
  return requestConfig;
});

// ---------------------------------------------------------------------------
// Request interceptor — attach current access token
//
// Reads the active Supabase session and attaches the access_token as a Bearer
// header. Runs only in the browser (server-side requests go through a
// different path and do not use this axios instance for auth).
// ---------------------------------------------------------------------------

api.interceptors.request.use(async (requestConfig: RequestConfigWithRetry) => {
  // Skip attaching a token to the refresh request itself — it already carries
  // the expired token explicitly to satisfy the backend's middleware check.
  if (requestConfig._isRefreshRequest) {
    return requestConfig;
  }

  if (typeof window === "undefined") {
    // Server-side: no browser session available; skip.
    return requestConfig;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      requestConfig.headers = requestConfig.headers ?? {};
      requestConfig.headers["Authorization"] = `Bearer ${session.access_token}`;
    }
  } catch {
    // Non-fatal — unauthenticated requests are still allowed through.
  }

  return requestConfig;
});

// ---------------------------------------------------------------------------
// Response interceptor — silent token refresh on TOKEN_EXPIRED
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  // Pass-through for successful responses
  (response) => response,

  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;

    // ── Guard: only handle 401 TOKEN_EXPIRED ────────────────────────────
    // Any other 401 (TOKEN_MISSING, invalid credentials, permissions, etc.)
    // is passed through to the caller unchanged.
    const is401TokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED";

    if (
      !is401TokenExpired ||
      !originalRequest ||
      originalRequest._isRefreshRequest  // never retry the refresh call itself
    ) {
      return Promise.reject(error);
    }

    // ── Guard: retry each original request at most once ──────────────────
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ── A refresh is already in-flight — queue this request ──────────────
    if (isRefreshing) {
      try {
        const newToken = await waitForRefresh();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        originalRequest._retry = true;
        return api(originalRequest);
      } catch (queueError) {
        return Promise.reject(queueError);
      }
    }

    // ── This request wins the race — perform the single refresh ──────────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get the current (expired) access token to satisfy the backend's
      // Authorization header requirement even for refresh calls.
      let expiredToken: string | undefined;
      if (typeof window !== "undefined") {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data: { session } } = await supabase.auth.getSession();
          expiredToken = session?.access_token;
        } catch {
          // Proceed without it — backend may still accept the cookie alone.
        }
      }

      // Call the refresh endpoint. The browser automatically sends the
      // HttpOnly refresh-token cookie because withCredentials is true.
      // _isRefreshRequest prevents the interceptor from recursing here.
      const refreshResponse = await api.post<RefreshSessionResponse>(
        "/auth/refresh-session",
        {},
        {
          _isRefreshRequest: true,
          headers: expiredToken
            ? { Authorization: `Bearer ${expiredToken}` }
            : {},
        } as RequestConfigWithRetry,
      );

      const newSession = refreshResponse.data?.session;

      if (!newSession?.access_token || !newSession?.refresh_token) {
        // Backend returned success HTTP status but no usable session —
        // treat this the same as a failed refresh.
        throw new Error("Refresh response contained no session.");
      }

      // Update the Supabase session with the rotated tokens.
      // This fires the TOKEN_REFRESHED event, which AuthProvider.onAuthStateChange
      // already handles to update the Zustand auth store — no manual store update needed.
      const supabase = createSupabaseBrowserClient();
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
      });

      if (setSessionError) {
        throw setSessionError;
      }

      // Unblock all queued requests with the new token
      isRefreshing = false;
      resolveRefreshSubscribers(newSession.access_token);

      // Retry the original request with the new token
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers["Authorization"] = `Bearer ${newSession.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      // ── Refresh failed — log out the user cleanly ─────────────────────
      isRefreshing = false;
      rejectRefreshSubscribers(refreshError);

      // Sign out via Supabase — this fires SIGNED_OUT, which AuthProvider
      // handles by calling clear() + resetting cart/wishlist stores.
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        // Ignore signOut errors — we're already in a broken session state.
      }

      // Redirect to login (router is not available in non-React module scope).
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  },
);

// ---------------------------------------------------------------------------
// ApiError — typed error wrapper
// ---------------------------------------------------------------------------

/**
 * Typed error wrapper for API failures.
 *
 * Normalises axios errors into a structured shape that auth hooks can catch
 * and classify without importing axios directly.
 *
 * Extra fields beyond the original:
 *   retryAfter   — parsed value of the Retry-After response header (seconds),
 *                  or null when absent.  Auth flows MUST use this instead of
 *                  any hardcoded constant whenever it is present.
 *   responseCode — the body-level `responseCode` field echoed by the backend
 *                  (e.g. 200, 400, 429, 500).  HTTP status and body responseCode
 *                  can differ — the backend controller maps non-200 AuthModel
 *                  results to HTTP 400 regardless of the body responseCode.
 */
export class ApiError extends Error {
  /** HTTP status code (0 when there was no response — e.g. network error). */
  public readonly status: number;
  /** Optional error code returned by the backend (e.g. "TOKEN_EXPIRED"). */
  public readonly code: string | undefined;
  /**
   * Value of the Retry-After response header parsed as an integer number of
   * seconds, or null when the header is absent or unparseable.
   */
  public readonly retryAfter: number | null;
  /**
   * Body-level `responseCode` field returned by the backend.
   * Distinct from the HTTP status — the controller converts many non-200
   * AuthModel results into HTTP 400 while leaving `responseCode` at its
   * original value (e.g. 500 for network/Supabase failures).
   */
  public readonly responseCode: number | null;

  constructor(
    status: number,
    message: string,
    code?: string,
    retryAfter: number | null = null,
    responseCode: number | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
    this.responseCode = responseCode;
  }

  /** Build an ApiError from an unknown catch value. */
  static from(err: unknown): ApiError {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{
        message?: string;
        code?: string;
        responseCode?: number;
      }>;
      const status = axiosErr.response?.status ?? 0;
      const message =
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        `HTTP ${status}`;
      const code = axiosErr.response?.data?.code;

      // Parse Retry-After header — Axios normalises header names to lowercase.
      const retryAfterRaw = axiosErr.response?.headers?.["retry-after"];
      const retryAfter =
        typeof retryAfterRaw === "string" && /^\d+$/.test(retryAfterRaw.trim())
          ? parseInt(retryAfterRaw.trim(), 10)
          : null;

      // Body-level responseCode (may differ from HTTP status).
      const responseCode =
        typeof axiosErr.response?.data?.responseCode === "number"
          ? axiosErr.response.data.responseCode
          : null;

      return new ApiError(status, message, code, retryAfter, responseCode);
    }
    if (err instanceof ApiError) return err;
    return new ApiError(0, "Something went wrong.");
  }
}

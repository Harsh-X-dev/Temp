export type LoginStep = "phone" | "otp" | "create_profile" | "success";

/** Validated 10-digit Indian phone number (digits only, no country code). */
export type Phone = string;

/** Array of 6 single-digit strings for OTP input boxes. */
export type OtpDigits = [string, string, string, string, string, string];

// ---------------------------------------------------------------------------
// API response shapes — aligned with the backend contract
// ---------------------------------------------------------------------------

/** POST /api/auth/send-otp — success */
export interface SendOtpResponse {
  success?: boolean;
  /** HTTP-style status code returned in the response body (e.g. 200, 400). */
  responseCode: number;
  message: string;
  /**
   * Opaque session identifier issued by the OTP provider.
   * Present on success; null on failure.
   */
  verificationId: string | null;
}

/**
 * Supabase session returned by the backend after OTP verification.
 * Used to call supabase.auth.setSession() on the client.
 */
export interface BackendSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Minimal user object returned by the backend after OTP verification.
 * Full profile is fetched separately from Supabase after setSession().
 */
export interface  BackendUser {
  id: string;
  phone: string;
  [key: string]: unknown;
}

/** POST /api/auth/verify-otp — success */
export interface VerifyOtpResponse {
  /** HTTP-style status code returned in the response body (e.g. 200, 400). */
  responseCode: number;
  message: string;
  /**
   * Verification outcome returned by the OTP provider.
   * "VERIFICATION_COMPLETED" on success; null on failure.
   */
  verificationStatus: string | null;
  /**
   * Supabase session tokens. Present on successful verification.
   * Call supabase.auth.setSession() with these values immediately.
   */
  session: BackendSession | null;
  /**
   * Minimal user record from the backend. Use for immediate UI feedback only.
   * Full profile should be fetched from Supabase after setSession().
   */
  user: BackendUser | null;
}

export interface ApiError {
  status: number;
  message: string;
  /** Optional error code returned by the backend (e.g. "TOKEN_EXPIRED", "TOKEN_MISSING"). */
  code?: string;
}

/**
 * POST /api/v1/auth/refresh-session — response shape.
 * The backend rotates the refresh token on every successful call.
 * The new session must be applied immediately via supabase.auth.setSession().
 */
export interface RefreshSessionResponse {
  responseCode: number;
  message: string;
  session: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number;
    refresh_token_expires_in: number;
  } | null;
}


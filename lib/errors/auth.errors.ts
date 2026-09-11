/**
 * Centralised authentication error classifier.
 *
 * Architecture:
 *   Axios error / any unknown value
 *     → ApiError.from(err)           (normalise into typed shape)
 *     → classifyAuthError(err, ctx)  (map to user-facing AuthErrorResult)
 *     → hook reads { category, inlineMessage, toastTitle, toastDescription,
 *                    retryAfterSeconds }
 *     → setError(inlineMessage) + toast.error(toastTitle, toastDescription)
 *
 * Rules (from backend contract):
 *   1. HTTP status is checked first.
 *   2. Body `responseCode` is checked next — it can differ from HTTP status
 *      because the backend controller converts non-200 AuthModel results into
 *      HTTP 400 while leaving responseCode at its original value (500 for
 *      network / Supabase failures, provider-supplied codes for MC errors).
 *   3. Message patterns are used to distinguish specific 429 sub-types.
 *   4. Known provider identifiers (e.g. WRONG_OTP_PROVIDED) are mapped to
 *      friendly strings and NEVER shown to users verbatim.
 *   5. Retry-After header value is always used as-is — never replaced with a
 *      hardcoded constant.
 *   6. Unknown errors fall into a safe generic category.
 *
 * DO NOT:
 *   - Guess backend error messages not listed in the contract.
 *   - Assume HTTP 400 means "wrong OTP".
 *   - Replace Retry-After with a fixed constant.
 */

import { ApiError } from "@/services/http";

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

/** Category identifiers — used internally for logic branching, not shown to users. */
export type AuthErrorCategory =
  // Send OTP categories
  | "INVALID_MOBILE"
  | "RESEND_COOLDOWN"
  | "MOBILE_RATE_LIMIT"
  | "IP_RATE_LIMIT"
  | "GLOBAL_RATE_LIMIT"
  | "PROVIDER_SEND_FAILURE"
  | "SERVER_ERROR"
  // Verify OTP categories
  | "WRONG_OTP"
  | "INVALID_OTP_FORMAT"
  | "MISSING_VERIFICATION_ID"
  | "VERIFY_RATE_LIMIT"
  | "AUTH_SESSION_FAILURE"
  // Shared
  | "NETWORK_ERROR"
  | "UNKNOWN";

/** The classifier always returns this shape. */
export interface AuthErrorResult {
  /** Internal identifier — do NOT render this in the UI. */
  category: AuthErrorCategory;
  /** Short sentence shown inline below the relevant input. */
  inlineMessage: string;
  /** Sonner toast title (short, ≤ 4 words). */
  toastTitle: string;
  /** Sonner toast description (one sentence). */
  toastDescription: string;
  /**
   * When set, the caller MUST use this as the countdown duration instead of
   * any hardcoded constant.  Derived from the Retry-After response header.
   */
  retryAfterSeconds: number | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** True when the message starts with the backend's validation field prefix. */
function isValidationMessage(msg: string, field: string): boolean {
  return msg.startsWith(`${field}:`);
}

/**
 * Classify an HTTP 429 response for the send-OTP context.
 * Uses the body message to distinguish the three possible 429 sub-types.
 */
function classify429SendOtp(
  message: string,
  retryAfterSeconds: number | null,
): AuthErrorResult {
  // Global API rate limiter — message does NOT necessarily contain responseCode.
  // Pattern: "Rate limit exceeded. Too many requests. Please slow down."
  if (/rate limit exceeded/i.test(message)) {
    return {
      category: "GLOBAL_RATE_LIMIT",
      inlineMessage: "Too many requests. Please slow down.",
      toastTitle: "Too many requests",
      toastDescription: "Please slow down.",
      retryAfterSeconds,
    };
  }

  // Cooldown: "Please wait X seconds before requesting a new OTP."
  if (/please wait \d+ second/i.test(message)) {
    return {
      category: "RESEND_COOLDOWN",
      inlineMessage: message,
      toastTitle: "Too many requests",
      toastDescription: message,
      retryAfterSeconds,
    };
  }

  // Mobile rate limit: "Maximum OTP limit reached for this number. Please try again after X minute(s)."
  if (/maximum otp limit/i.test(message)) {
    return {
      category: "MOBILE_RATE_LIMIT",
      inlineMessage: message,
      toastTitle: "Too many requests",
      toastDescription: message,
      retryAfterSeconds,
    };
  }

  // IP rate limit: "Too many OTP requests from this IP. Please try again after X minute(s)."
  if (/too many otp requests from this ip/i.test(message)) {
    return {
      category: "IP_RATE_LIMIT",
      inlineMessage: message,
      toastTitle: "Too many requests",
      toastDescription: message,
      retryAfterSeconds,
    };
  }

  // Unknown 429 — safe fallback.
  return {
    category: "UNKNOWN",
    inlineMessage: "Too many requests. Please try again later.",
    toastTitle: "Too many requests",
    toastDescription: "Please try again later.",
    retryAfterSeconds,
  };
}

/**
 * Classify an HTTP 429 response for the verify-OTP context.
 */
function classify429VerifyOtp(
  message: string,
  retryAfterSeconds: number | null,
): AuthErrorResult {
  // Global API rate limiter.
  if (/rate limit exceeded/i.test(message)) {
    return {
      category: "GLOBAL_RATE_LIMIT",
      inlineMessage: "Too many requests. Please slow down.",
      toastTitle: "Too many requests",
      toastDescription: "Please slow down.",
      retryAfterSeconds,
    };
  }

  // Verify rate limit: "Too many invalid verification attempts. Please request a new OTP after X minute(s)."
  if (/too many invalid verification/i.test(message)) {
    return {
      category: "VERIFY_RATE_LIMIT",
      inlineMessage: message,
      toastTitle: "Too many attempts",
      toastDescription: message,
      retryAfterSeconds,
    };
  }

  // Unknown 429 — safe fallback.
  return {
    category: "UNKNOWN",
    inlineMessage: "Too many requests. Please try again later.",
    toastTitle: "Too many requests",
    toastDescription: "Please try again later.",
    retryAfterSeconds,
  };
}

// ---------------------------------------------------------------------------
// Public classifier
// ---------------------------------------------------------------------------

/**
 * Classify any thrown value from the auth API calls into a structured
 * AuthErrorResult that contains friendly user-facing strings and the
 * Retry-After duration when applicable.
 *
 * @param err     - The unknown value caught by a try/catch block.
 * @param context - Which API call produced the error.
 */
export function classifyAuthError(
  err: unknown,
  context: "send_otp" | "verify_otp",
): AuthErrorResult {
  const apiErr = ApiError.from(err);
  const {
    status,
    message,
    retryAfter: retryAfterSeconds,
    responseCode,
  } = apiErr;

  // ── 0: No network response ────────────────────────────────────────────────
  if (status === 0) {
    return {
      category: "NETWORK_ERROR",
      inlineMessage:
        "Network error. Please check your connection and try again.",
      toastTitle: "Connection error",
      toastDescription:
        "Please check your internet connection and try again.",
      retryAfterSeconds: null,
    };
  }

  // ── 1: Rate limiting (HTTP 429) ───────────────────────────────────────────
  if (status === 429) {
    return context === "send_otp"
      ? classify429SendOtp(message, retryAfterSeconds)
      : classify429VerifyOtp(message, retryAfterSeconds);
  }

  // ── 2: HTTP 400 — requires body responseCode inspection ───────────────────
  //
  // IMPORTANT: The backend controller converts non-200 AuthModel results into
  // HTTP 400 regardless of internal cause.  Do NOT treat HTTP 400 as a
  // specific category without also inspecting responseCode and message.
  if (status === 400) {
    // ── 2a: Body responseCode 500 → network or Supabase internal failure ───
    //        message patterns: "Network error connecting to …"
    //                          "Authentication error: …"
    if (responseCode === 500) {
      return {
        category:
          context === "verify_otp" ? "AUTH_SESSION_FAILURE" : "SERVER_ERROR",
        inlineMessage: "Something went wrong. Please try again.",
        toastTitle: "Something went wrong",
        toastDescription: "Please try again in a moment.",
        retryAfterSeconds: null,
      };
    }

    // ── 2b: Validation field errors (prefix pattern "field: message") ──────
    if (context === "send_otp") {
      if (isValidationMessage(message, "mobileNumber")) {
        const detail = message.replace(/^mobileNumber:\s*/i, "");
        return {
          category: "INVALID_MOBILE",
          inlineMessage: detail,
          toastTitle: "Invalid phone number",
          toastDescription: detail,
          retryAfterSeconds: null,
        };
      }

      // Non-validation HTTP 400 from send-otp — Message Central send failure
      // or a network timeout converted by the controller.
      return {
        category: "PROVIDER_SEND_FAILURE",
        inlineMessage: "Could not send OTP. Please try again.",
        toastTitle: "OTP send failed",
        toastDescription: "Could not send OTP. Please try again.",
        retryAfterSeconds: null,
      };
    }

    if (context === "verify_otp") {
      if (isValidationMessage(message, "mobileNumber")) {
        const detail = message.replace(/^mobileNumber:\s*/i, "");
        return {
          category: "INVALID_MOBILE",
          inlineMessage: detail,
          toastTitle: "Invalid phone number",
          toastDescription: detail,
          retryAfterSeconds: null,
        };
      }

      if (isValidationMessage(message, "code")) {
        const detail = message.replace(/^code:\s*/i, "");
        return {
          category: "INVALID_OTP_FORMAT",
          inlineMessage: detail,
          toastTitle: "Invalid OTP",
          toastDescription: detail,
          retryAfterSeconds: null,
        };
      }

      if (isValidationMessage(message, "verificationId")) {
        return {
          category: "MISSING_VERIFICATION_ID",
          inlineMessage:
            "Session expired. Please go back and request a new OTP.",
          toastTitle: "Session expired",
          toastDescription: "Please go back and request a new OTP.",
          retryAfterSeconds: null,
        };
      }

      // ── 2c: Wrong / invalid OTP from the provider ──────────────────────
      //
      // The provider message is dynamic (e.g. "WRONG_OTP_PROVIDED").
      // We deliberately do NOT display it verbatim.
      // Any HTTP 400 + non-500 responseCode from verify-otp that is NOT a
      // known validation field error is treated as a wrong-OTP scenario.
      return {
        category: "WRONG_OTP",
        inlineMessage:
          "Incorrect OTP. Please check the code and try again.",
        toastTitle: "Incorrect OTP",
        toastDescription: "Please check the code and try again.",
        retryAfterSeconds: null,
      };
    }
  }

  // ── 3: Any other HTTP error → generic server error ────────────────────────
  return {
    category: "UNKNOWN",
    inlineMessage: "Something went wrong. Please try again.",
    toastTitle: "Something went wrong",
    toastDescription: "Please try again in a moment.",
    retryAfterSeconds: null,
  };
}

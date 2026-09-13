/**
 * Auth service — the only module that calls lib/api.ts for auth operations.
 * Hooks call this service; they never call the API client directly.
 *
 * Backend field contract:
 *   send-otp  : request  { mobileNumber }
 *               response { responseCode, message, verificationId }
 *   verify-otp: request  { mobileNumber, code, verificationId }
 *               response { responseCode, message, verificationStatus }
 */
import { api } from "@/services/http";
import type { SendOtpResponse, VerifyOtpResponse } from "@/types/auth.types";
import { PHONE_PREFIX } from "@/lib/constants/auth";

/**
 * Request an OTP to be sent to the given phone number.
 * @param phone - 10-digit number without country code (country code is prepended here).
 * @returns The full SendOtpResponse including verificationId for the next step.
 */
export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const res = await api.post<SendOtpResponse>("/auth/send-otp", {
    mobileNumber: `${PHONE_PREFIX}${phone}`,
  });
  return res.data;
}

/**
 * Verify the OTP entered by the user.
 * @param phone          - 10-digit number without country code.
 * @param otp            - 6-digit OTP string (concatenated from OtpDigits array).
 * @param verificationId - Session identifier returned by sendOtp.
 */
export async function verifyOtp(
  phone: string,
  otp: string,
  verificationId: string,
): Promise<VerifyOtpResponse> {
  const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", {
    mobileNumber: `${PHONE_PREFIX}${phone}`,
    code: otp,
    verificationId,
  });
  return res.data;
}

export interface LogoutResponse {
  success: boolean;
  responseCode: number;
  message: string;
}

/**
 * Logout session on the backend.
 * Clears the refresh_token HttpOnly cookie and revokes the active session on the server.
 *
 * Endpoint: POST /api/v1/auth/logout
 * Headers: Authorization: Bearer <access_token>
 * Body: {}
 */
export async function logoutSession(accessToken?: string): Promise<LogoutResponse | null> {
  try {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const res = await api.post<LogoutResponse>("/auth/logout", {}, { headers });
    return res.data;
  } catch (error) {
    console.warn("[auth.service] logoutSession error:", error);
    return null;
  }
}


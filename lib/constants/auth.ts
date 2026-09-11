/** Number of digit boxes in the OTP input. */
export const OTP_LENGTH = 6 as const;

/** Seconds to wait before the user may request a new OTP. */
export const RESEND_SECONDS = 30 as const;

/** Indian country dialing code prefix shown in the phone input. */
export const PHONE_PREFIX = "+91" as const;

/** Expected length of a valid Indian mobile number (digits only). */
export const PHONE_LENGTH = 10 as const;

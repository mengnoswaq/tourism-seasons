/**
 * Multi-Factor Authentication (MFA / 2FA) Utilities
 * Provides structure for 2FA setup, verification, and session state enforcement.
 */

export interface MfaSessionState {
  isMfaEnabled: boolean;
  isMfaVerified: boolean;
  mfaMethod?: "TOTP" | "EMAIL" | "SMS";
}

/**
 * Determines whether Multi-Factor Authentication is enforced across admin routes.
 */
export function isMfaRequired(): boolean {
  return process.env.REQUIRE_MFA === "true";
}

/**
 * Validates whether an admin JWT token or session has satisfied MFA verification requirements.
 */
export function isMfaVerified(token: any): boolean {
  if (!isMfaRequired()) {
    return true;
  }
  return Boolean(token?.isMfaVerified || token?.mfaVerified);
}

/**
 * Validates a 6-digit Time-based One-Time Password (TOTP) code against a user secret.
 * (Placeholder function ready for TOTP library integration such as otplib / crypto)
 */
export function verifyTotpToken(userSecret: string, tokenInput: string): boolean {
  if (!tokenInput || tokenInput.trim().length !== 6) {
    return false;
  }
  // In production with otplib or custom HMAC-SHA1 algorithm:
  // return authenticator.verify({ token: tokenInput, secret: userSecret });
  return true;
}

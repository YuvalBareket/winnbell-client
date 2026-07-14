// In-flight phone-verification session (sessionStorage). Lets a closed-and-reopened verify
// sheet resume at the code step instead of firing another SMS. The session is tied to the
// tab, NOT the account - so every identity change (logout, account switch, cross-tab logout)
// MUST clear it or user A's number and OTP step would greet user B in the same tab.
export const OTP_SESSION_KEY = 'phoneOtpSession';
export const OTP_VALIDITY_MS = 10 * 60 * 1000;
export const RESEND_COOLDOWN_S = 60;

export interface OtpSession {
  phone: string;
  sentAt: number;
}

export const readOtpSession = (): OtpSession | null => {
  try {
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as OtpSession;
    if (typeof s.phone !== 'string' || typeof s.sentAt !== 'number') return null;
    if (Date.now() - s.sentAt > OTP_VALIDITY_MS) {
      sessionStorage.removeItem(OTP_SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
};

export const writeOtpSession = (session: OtpSession): void => {
  try {
    sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
  } catch { /* storage unavailable - resume is best-effort */ }
};

export const clearOtpSession = (): void => {
  try {
    sessionStorage.removeItem(OTP_SESSION_KEY);
  } catch { /* ignore */ }
};

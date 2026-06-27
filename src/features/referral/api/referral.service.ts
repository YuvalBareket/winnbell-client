import { api } from '../../../shared/api/client';

export interface ReferralResolveResponse {
  referrerName: string | null;
}

export interface ReferralLinkResponse {
  code: string;
  link: string;
}

/**
 * Resolve a referral code to get the referrer's first name (for social proof on landing page).
 * Public endpoint, no auth required.
 */
export const resolveReferralCode = async (code: string): Promise<ReferralResolveResponse> => {
  const response = await api.get<ReferralResolveResponse>('/referral/resolve', {
    params: { ref: code },
  });
  return response.data;
};

/**
 * Get the logged-in user's referral code, then build the full shareable link on the client
 * from the current origin (window.location.origin + /join?ref=), the same way the business
 * flyer link is built. The server returns only the code. Requires authentication.
 */
export const getReferralLink = async (): Promise<ReferralLinkResponse> => {
  const response = await api.get<{ code: string }>('/referral/link');
  const { code } = response.data;
  return { code, link: `${window.location.origin}/join?ref=${code}` };
};

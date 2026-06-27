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
 * Get the logged-in user's referral link and code.
 * Requires authentication.
 */
export const getReferralLink = async (): Promise<ReferralLinkResponse> => {
  const response = await api.get<ReferralLinkResponse>('/referral/link');
  return response.data;
};

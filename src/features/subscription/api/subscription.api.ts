import { api } from '../../../shared/api/client';
import type { SubscriptionDetails, FoundingAvailability, SubscriptionInvoice } from '../types/subscription.types';

export const fetchSubscription = (): Promise<SubscriptionDetails | null> =>
  api.get('/business/subscription').then(r => r.data);

export const cancelSubscription = (): Promise<{
  removedFromDraw: boolean;
  refundType: 'full' | 'prorated' | 'none';
  refundAmount: number;
}> => api.post('/business/subscription/cancel').then(r => r.data);

export const resumeSubscription = (): Promise<void> =>
  api.post('/business/subscription/resume').then(r => r.data);

export const fetchFoundingAvailability = (): Promise<FoundingAvailability> =>
  api.get('/business/subscription/founding-availability').then(r => r.data);

export const updateSubscriptionPlan = (entries_per_location: number) =>
  api.put('/business/subscription/plan', { entries_per_location });

export const fetchSubscriptionInvoices = (): Promise<SubscriptionInvoice[]> =>
  api.get('/business/subscription/invoices').then(r => r.data);

// Opt out of (or back into) the campaign already paid for. No refund either way.
export const skipCampaignApi = (skip: boolean): Promise<{ skipped: boolean }> =>
  api.post('/business/subscription/skip-campaign', { skip }).then(r => r.data);

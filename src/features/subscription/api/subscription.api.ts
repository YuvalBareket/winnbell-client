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

// Stripe setup session to save a new card; outstanding invoices are retried with it.
export const updatePaymentMethodApi = (): Promise<{ url: string }> =>
  api.post('/business/subscription/update-payment-method').then(r => r.data);

// Founding second-year renewal (Special Terms Section 6): a payment checkout for one
// additional 12-month term at the original founding price. Final 30 days of the term only.
export const foundingRenewalApi = (): Promise<{ url: string }> =>
  api.post('/business/subscription/founding-renewal').then(r => r.data);

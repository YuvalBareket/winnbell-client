import { api } from '../../../shared/api/client';
import type { SubscriptionDetails, FoundingAvailability, SubscriptionInvoice } from '../types/subscription.types';

export const fetchSubscription = (): Promise<SubscriptionDetails | null> =>
  api.get('/business/subscription').then(r => r.data);

// `immediate` is the owner's dialog choice: true = also remove from participation now
// (off the map, not in the paid upcoming campaign, no refund); false = keep everything
// already paid for, the plan just does not renew.
export const cancelSubscription = (immediate: boolean): Promise<{
  removedFromDraw: boolean;
  refundType: 'full' | 'prorated' | 'none';
  refundAmount: number;
  immediateRemoval: boolean;
}> => api.post('/business/subscription/cancel', { immediate }).then(r => r.data);

export const resumeSubscription = (): Promise<void> =>
  api.post('/business/subscription/resume').then(r => r.data);

export const fetchFoundingAvailability = (): Promise<FoundingAvailability> =>
  api.get('/business/subscription/founding-availability').then(r => r.data);

export const updateSubscriptionPlan = (entries_per_location: number) =>
  api.put('/business/subscription/plan', { entries_per_location });

export const fetchSubscriptionInvoices = (): Promise<SubscriptionInvoice[]> =>
  api.get('/business/subscription/invoices').then(r => r.data);

// Founding only: cancel participation entirely (no refund, off the map, no upcoming
// campaigns) or reactivate while the founding term still runs.
export const setParticipationApi = (paused: boolean): Promise<{ paused: boolean }> =>
  api.post('/business/subscription/participation', { paused }).then(r => r.data);

// Stripe setup session to save a new card; outstanding invoices are retried with it.
export const updatePaymentMethodApi = (): Promise<{ url: string }> =>
  api.post('/business/subscription/update-payment-method').then(r => r.data);

// Founding one-time renewal (Special Terms Section 6): a payment checkout for one
// additional term at the original founding price. Final 30 days of the term only.
export const foundingRenewalApi = (): Promise<{ url: string }> =>
  api.post('/business/subscription/founding-renewal').then(r => r.data);

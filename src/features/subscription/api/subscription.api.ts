import { api } from '../../../shared/api/client';
import type { SubscriptionDetails } from '../types/subscription.types';

export const fetchSubscription = (): Promise<SubscriptionDetails> =>
  api.get('/business/subscription').then(r => r.data);

export const cancelSubscription = (): Promise<{ removedFromDraw: boolean; refundType: 'full' | 'partial_40' | 'none'; refundAmount: number }> =>
  api.post('/business/subscription/cancel').then(r => r.data);

export const resumeSubscription = (): Promise<void> =>
  api.post('/business/subscription/resume').then(r => r.data);

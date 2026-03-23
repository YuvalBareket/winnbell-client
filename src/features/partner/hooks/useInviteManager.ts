// client/src/features/partner/hooks/useInviteManager.ts
import { useMutation } from '@tanstack/react-query';
import { createInviteLink } from '../api/business.api';

export const useInviteManager = () => {
  return useMutation({
    mutationFn: (locationId: number) => createInviteLink(locationId),
    onSuccess: (data) => {
      // 1. Copy to clipboard immediately when the API returns the link
      navigator.clipboard.writeText(data.inviteLink);
    },
    onError: (error: unknown) => {
      console.error('Failed to generate link:', error);
    },
  });
};

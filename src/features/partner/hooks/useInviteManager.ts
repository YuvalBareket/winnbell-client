// client/src/features/partner/hooks/useInviteManager.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInviteLink, removeLocationManager } from '../api/business.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

export const useInviteManager = () => {
  return useMutation({
    mutationFn: (locationId: number) => createInviteLink(locationId),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.inviteLink).catch(() => {});
    },
    onError: (error: unknown) => {
      console.error('Failed to generate link:', error);
    },
  });
};

export const useRemoveManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: number) => removeLocationManager(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
    },
  });
};

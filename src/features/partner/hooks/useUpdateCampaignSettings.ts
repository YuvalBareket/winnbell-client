import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCampaignSettingsApi } from '../api/business.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import type { UpdateCampaignSettingsInput } from '../api/business.api';

export const useUpdateCampaignSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCampaignSettingsInput) => updateCampaignSettingsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
    },
  });
};

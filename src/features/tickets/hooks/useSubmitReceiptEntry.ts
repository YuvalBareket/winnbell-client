import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { submitReceiptEntry } from '../api/ticketsApi';
import type { ReceiptEntryPayload, ReceiptEntryResponse } from '../api/ticketsApi';

export const useSubmitReceiptEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<ReceiptEntryResponse, AxiosError<{ message: string }>, ReceiptEntryPayload>({
    mutationFn: (payload: ReceiptEntryPayload) => submitReceiptEntry(payload),
    onSuccess: () => {
      // tickets.all (['tickets']) prefix-matches riskLevel, mine, freeStatus — one call covers all
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.riskLevel });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { submitReceiptEntry } from '../api/ticketsApi';
import type { ReceiptEntryPayload, ReceiptEntryResponse } from '../api/ticketsApi';

export const useSubmitReceiptEntry = (callbacks?: {
  onSuccess?: (data: ReceiptEntryResponse) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReceiptEntryPayload) => submitReceiptEntry(payload),
    onSuccess: (data) => {
      // tickets.all (['tickets']) prefix-matches riskLevel, mine, freeStatus — one call covers all
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      callbacks?.onSuccess?.(data);
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.riskLevel });
      callbacks?.onError?.(err);
    },
  });
};

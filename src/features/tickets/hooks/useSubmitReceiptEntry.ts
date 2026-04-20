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
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      callbacks?.onSuccess?.(data);
    },
    onError: (err: any) => {
      callbacks?.onError?.(err);
    },
  });
};

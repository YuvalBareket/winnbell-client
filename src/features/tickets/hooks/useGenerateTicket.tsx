// src/hooks/useTickets.ts
import { useMutation } from '@tanstack/react-query';
import { generateBusinessTicket } from '../api/ticketsApi';

// The hook for the Business to ISSUE a code
export const useGenerateTicket = () => {
  return useMutation({
    mutationFn: generateBusinessTicket,
    onSuccess: (data) => {
      // Optional: Invalidate business stats if you have a "Tickets Issued Today" counter
      // queryClient.invalidateQueries({ queryKey: ['business-stats'] });
      console.log('New ticket issued:', data.code);
    },
    onError: (error: any) => {
      console.error(
        'Issue Error:',
        error.response?.data?.message || 'Server error',
      );
    },
  });
};

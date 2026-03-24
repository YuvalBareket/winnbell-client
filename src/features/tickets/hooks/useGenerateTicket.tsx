import { useMutation } from '@tanstack/react-query';
import { generateBusinessTicket } from '../api/ticketsApi';

export const useGenerateTicket = () => {
  return useMutation({
    mutationFn: (locationId: number) => generateBusinessTicket(locationId),
    onError: (error: unknown) => {
      console.error('Issue Error:', error);
    },
  });
};

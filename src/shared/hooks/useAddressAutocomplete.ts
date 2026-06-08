import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { autoCompleteAddress, getAddressCoords } from '../api/addressAutocomplete';
import type { AddressCoords } from '../api/addressAutocomplete';
import { useDebounce } from './useDebounce';

export type AddressOption = {
  label: string;
  placeId: string;
};

export const useAddressAutocomplete = () => {
  const [inputValue, setInputValue] = useState('');
  const [coordsLoading, setCoordsLoading] = useState(false);

  const debouncedInput = useDebounce(inputValue.trim(), 800);
  const enabled = debouncedInput.length >= 3;

  const { data: options = [], isPending, error } = useQuery({
    queryKey: ['address-autocomplete', debouncedInput],
    queryFn: () => autoCompleteAddress(debouncedInput),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  return {
    inputValue,
    setInputValue,

    options: enabled ? options : [],
    loading: enabled && isPending,
    coordsLoading,

    error: error ?? null,

    fetchCoords: async (placeId: string): Promise<AddressCoords> => {
      setCoordsLoading(true);
      try {
        return await getAddressCoords(placeId);
      } finally {
        setCoordsLoading(false);
      }
    },

    clear: () => {
      setInputValue('');
    },

    refetchNow: () => {},
  };
};

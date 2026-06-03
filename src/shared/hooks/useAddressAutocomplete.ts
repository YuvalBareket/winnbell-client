import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { autoCompleteAddress, getAddressCoords } from '../api/addressAutocomplete';
import type { AddressCoords } from '../api/addressAutocomplete';

export type AddressOption = {
  label: string;
  placeId: string;
};

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export const useAddressAutocomplete = () => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AddressOption[]>([]);
  const [coordsLoading, setCoordsLoading] = useState(false);

  const lastQueryRef = useRef('');

  const searchMutation = useMutation({
    mutationFn: autoCompleteAddress,
    onSuccess: (data, text) => {
      if (text !== lastQueryRef.current) return;
      setOptions(Array.isArray(data) ? data : []);
    },
    onError: () => {
      setOptions([]);
    },
  });

  const run = (text: string) => {
    const q = text.trim();
    lastQueryRef.current = q;

    if (q.length < 3) {
      setOptions([]);
      return;
    }

    searchMutation.mutate(q);
  };

  const debouncedRun = useMemo(() => debounce(run, 800), []);

  useEffect(() => {
    debouncedRun(inputValue);
  }, [inputValue, debouncedRun]);

  return {
    inputValue,
    setInputValue,

    options,
    loading: searchMutation.isPending,
    coordsLoading,

    error: searchMutation.error,

    fetchCoords: async (placeId: string): Promise<AddressCoords> => {
      setCoordsLoading(true);
      try {
        return await getAddressCoords(placeId);
      } finally {
        setCoordsLoading(false);
      }
    },

    clear: () => {
      lastQueryRef.current = '';
      setInputValue('');
      setOptions([]);
    },

    refetchNow: () => run(inputValue),
  };
};

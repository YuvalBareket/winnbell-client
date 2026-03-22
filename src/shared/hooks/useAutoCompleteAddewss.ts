import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { autoCompleteAddress } from '../api/addressAutocomplete';

type AddressOption = {
  label: string;
  lat: number;
  lon: number;
};

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export const useAddressAutocomplete = () => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AddressOption[]>([]);

  const lastQueryRef = useRef('');
  const skipNextRef = useRef(false);

  const mutation = useMutation({
    mutationFn: autoCompleteAddress,
    onSuccess: (data, text) => {
      if (text !== lastQueryRef.current) return;

      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

      setOptions(results);
    },
    onError: () => {
      setOptions([]);
    },
  });

  const run = async (text: string) => {
    const q = text.trim();
    lastQueryRef.current = q;

    if (q.length < 3) {
      setOptions([]);
      return;
    }

    mutation.mutate(q);
  };

  const debouncedRun = useMemo(() => debounce(run, 800), []);

  useEffect(() => {
    debouncedRun(inputValue);
  }, [inputValue, debouncedRun]);

  return {
    inputValue,
    setInputValue,

    options,
    loading: mutation.isPending,

    error: mutation.error,
    markSelected: () => {
      skipNextRef.current = true;
    },

    clear: () => {
      lastQueryRef.current = '';
      setInputValue('');
      setOptions([]);
    },

    refetchNow: () => run(inputValue),
  };
};

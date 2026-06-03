import { useEffect, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import type { AddressOption } from '../hooks/useAddressAutocomplete';

type ResolvedAddress = {
  label: string;
  lat: number;
  lon: number;
};

type Props = {
  onSelect?: (value: ResolvedAddress | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: ResolvedAddress | null;
  defaultValue?: ResolvedAddress | null;
};

const AddressAutoComplete = ({
  onSelect,
  label = 'address',
  placeholder = 'start typing...',
  disabled = false,
  value,
  defaultValue,
}: Props) => {
  const {
    setInputValue: setQuery,
    options,
    loading,
    coordsLoading,
    fetchCoords,
  } = useAddressAutocomplete();

  const isControlled = value !== undefined;

  // Local option selection — separate from the resolved ResolvedAddress
  const [selectedOption, setSelectedOption] = useState<AddressOption | null>(null);
  const [input, setInput] = useState(
    isControlled ? (value?.label || '') : (defaultValue?.label || '')
  );

  // Sync input text when controlled value changes externally (e.g. parent clears selection)
  useEffect(() => {
    if (!isControlled) return;
    setSelectedOption(null);
    setInput(value?.label || '');
  }, [isControlled, value]);

  return (
    <Autocomplete<AddressOption, false, false, false>
      sx={{ minWidth: '200px' }}
      disabled={disabled}
      value={selectedOption}
      inputValue={input}
      options={options}
      loading={loading || coordsLoading}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o?.label || ''}
      isOptionEqualToValue={(a, b) => a?.placeId === b?.placeId}
      onOpen={() => {
        if (input.trim()) setQuery(input);
      }}
      onInputChange={(_, v, reason) => {
        if (reason === 'input') {
          setInput(v);
          setQuery(v);
        }
        if (reason === 'clear') {
          setInput('');
          setSelectedOption(null);
          onSelect?.(null);
        }
        // reason === 'reset' happens on selection — let onChange handle it
      }}
      onChange={(_, option) => {
        if (!option) {
          setSelectedOption(null);
          setInput('');
          onSelect?.(null);
          return;
        }
        setSelectedOption(option);
        setInput(option.label);
        fetchCoords(option.placeId)
          .then((coords) => {
            onSelect?.(coords);
          })
          .catch(() => {
            // Coords fetch failed — clear selection so the user can retry
            setSelectedOption(null);
            setInput('');
            onSelect?.(null);
          });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          onBlur={() => {
            // Reset to last confirmed selection label
            const confirmed = isControlled ? (value?.label || '') : (selectedOption?.label || '');
            setInput(confirmed);
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(loading || coordsLoading) ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AddressAutoComplete;

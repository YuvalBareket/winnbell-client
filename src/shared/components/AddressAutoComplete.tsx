import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useAddressAutocomplete } from '../hooks/useAutoCompleteAddewss';

type AddressOption = {
  label: string;
  lat: number;
  lon: number;
  raw?: any;
};

type Props = {
  onSelect?: (value: AddressOption | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;

  value?: AddressOption | null;
  defaultValue?: AddressOption | null;
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
    markSelected,
  } = useAddressAutocomplete();

  const isControlled = value !== undefined;

  const initial = useMemo(() => {
    if (isControlled) return value ?? null;
    return defaultValue ?? null;
  }, [isControlled, value, defaultValue]);

  const [selected, setSelected] = useState<AddressOption | null>(initial);
  const [input, setInput] = useState(initial?.label || '');

  useEffect(() => {
    if (isControlled) {
      setSelected(value ?? null);
      setInput(value?.label || '');
      return;
    }

    setSelected(defaultValue ?? null);
    setInput(defaultValue?.label || '');
  }, [isControlled, value, defaultValue]);

  const current = isControlled ? (value ?? null) : selected;

  return (
    <Autocomplete<AddressOption, false, false, false>
      sx={{ minWidth: '200px' }}
      disabled={disabled}
      value={current}
      inputValue={input}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={(o) => o?.label || ''}
      isOptionEqualToValue={(a, b) => {
        if (!a || !b) return false;
        return a.label === b.label && a.lat === b.lat && a.lon === b.lon;
      }}
      onOpen={() => {
        if (input.trim()) setQuery(input);
      }}
      onInputChange={(_, v, reason) => {
        setInput(v);
        if (reason === 'input') setQuery(v);
        // If user clears the field, clear the selection too
        if (reason === 'clear') {
          if (!isControlled) setSelected(null);
          onSelect?.(null);
        }
      }}
      onChange={(_, v) => {
        markSelected();
        if (!isControlled) setSelected(v);
        setInput(v?.label || '');
        onSelect?.(v);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          onBlur={() => {
            // Reset input to the last confirmed selection — prevents saving free text
            setInput(current?.label || '');
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
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

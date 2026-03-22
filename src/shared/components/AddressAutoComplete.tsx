import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useAddressAutocomplete } from '../hooks/useAutoCompleteAddewss';

type AddressOption = {
  label: string;
  lat: number | null;
  lon: number | null;
  raw?: any;
  isFreeText?: boolean;
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

  const makeFreeText = (text: string): AddressOption => ({
    label: text,
    lat: null,
    lon: null,
    isFreeText: true,
    raw: { freeText: true },
  });

  const commitFreeTextIfNeeded = () => {
    const text = input.trim();
    if (!text) return;

    // if user already selected an option with same label, don't overwrite
    const current = isControlled ? value : selected;
    if (current?.label === text) return;

    const free = makeFreeText(text);

    if (!isControlled) setSelected(free);
    onSelect?.(free);
  };

  return (
    <Autocomplete<AddressOption, false, false, true>
      sx={{ minWidth: '200px' }}
      disabled={disabled}
      freeSolo
      clearOnBlur={false}
      value={isControlled ? (value ?? null) : selected}
      inputValue={input}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o?.label || '')}
      isOptionEqualToValue={(a, b) => {
        if (!a || !b) return false;
        return a.label === b.label && a.lat === b.lat && a.lon === b.lon;
      }}
      onOpen={() => {
        if (input.trim()) setQuery(input);
      }}
      onInputChange={(_, v, reason) => {
        setInput(v);
        // avoid spamming when clearing/resetting
        if (reason === 'input') setQuery(v);
      }}
      onChange={(_, v) => {
        markSelected();

        if (typeof v === 'string') {
          const free = makeFreeText(v.trim());
          if (!isControlled) setSelected(free);
          setInput(free.label);
          onSelect?.(free);
          return;
        }

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
            // if they just typed and left the field, accept it
            commitFreeTextIfNeeded();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // accept typed value even if no option selected
              commitFreeTextIfNeeded();
            }
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

import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateView } from '@mui/x-date-pickers/models';
import type { SxProps, Theme } from '@mui/material/styles';
import dayjs from 'dayjs';

interface AppDatePickerProps {
  /** Calendar date as a `YYYY-MM-DD` string, or '' when empty. */
  value: string;
  /** Emits a `YYYY-MM-DD` string, or '' when cleared/invalid. */
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  openTo?: DateView;
  views?: DateView[];
  /** sx forwarded to the field, so each page keeps its own input styling. */
  sx?: SxProps<Theme>;
}

/**
 * Thin wrapper over the MUI X DatePicker: converts to/from the `YYYY-MM-DD` strings the
 * forms store and pins the display format to USA month/day/year (MM/DD/YYYY). It is
 * intentionally style-agnostic - each page passes its own `sx` so the field matches the
 * rest of that page's inputs, exactly like the native fields it replaced.
 */
const AppDatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  helperText,
  label,
  fullWidth = true,
  size = 'medium',
  openTo,
  views,
  sx,
}: AppDatePickerProps) => {
  const parsed = value ? dayjs(value) : null;
  // Open on a click anywhere in the field, not just the calendar icon.
  const [open, setOpen] = useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        format="MM/DD/YYYY"
        value={parsed}
        onChange={(v) => onChange(v && v.isValid() ? v.format('YYYY-MM-DD') : '')}
        minDate={minDate ? dayjs(minDate) : undefined}
        maxDate={maxDate ? dayjs(maxDate) : undefined}
        disabled={disabled}
        openTo={openTo}
        views={views}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        slotProps={{
          textField: {
            fullWidth,
            size,
            error,
            helperText,
            onClick: () => { if (!disabled) setOpen(true); },
            sx: [
              { '& .MuiPickersInputBase-root': { cursor: 'pointer' } },
              ...(Array.isArray(sx) ? sx : [sx]),
            ],
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default AppDatePicker;

// src/shared/utils/date.ts

/**
 * Calculates the difference in days between a future date and today.
 * Returns 0 if the date has passed or is today.
 */
export const calculateDaysLeft = (dateString: string | undefined): number => {
  if (!dateString) return 0;

  // draw_date is midnight America/New_York expressed as a UTC timestamp. Pure epoch math:
  // the old setHours(0,0,0,0) floored both sides to the VIEWER'S local midnight, which for
  // anyone west of Eastern (incl. Florida panhandle CST) shifted the boundary a whole day
  // and showed "Ends today" a day early. Ceil counts any remaining fraction as a day, so
  // for Eastern viewers the result is identical to the old behavior.
  const diffDays = Math.ceil((new Date(dateString).getTime() - Date.now()) / 86_400_000);

  return diffDays > 0 ? diffDays : 0;
};

/**
 * Today's date as YYYY-MM-DD in the USER'S timezone. toISOString() is UTC - for a US user
 * after 8pm Eastern that is already TOMORROW, which made date fields default to (and
 * accept) a date the user has not reached yet.
 */
export const localDateString = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Formats a number into a USD currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number as compact USD (K/M suffix). Matches GrowthDashboard behavior.
 * Examples: 1500 -> "$1.5K", 1_500_000 -> "$1.5M", 999 -> "$999"
 */
export const formatCompactCurrency = (val: number): string => {
  const absVal = Math.abs(val);
  if (absVal >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (absVal >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
};

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a date string ("YYYY-MM-DD" or a longer ISO string) as "Mon D" using the calendar date
 * in the string itself. Avoids the day-off-by-one that new Date(iso).toLocaleDateString() causes:
 * a UTC-midnight bucket parsed and rendered in a UTC-negative timezone shows the previous day.
 */
export const formatShortDay = (iso: string): string => {
  const m = String(iso).slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(iso);
  return `${SHORT_MONTHS[Number(m[2]) - 1]} ${Number(m[3])}`;
};

/**
 * Formats ISO date strings into readable formats used in the Ticket List
 */
// src/shared/utils/date.ts

// src/shared/utils/date.ts

export const formatTicketDate = (dateString: string) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };

  const date = new Date(dateString);

  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
};

/** Format "2024-03" → "Mar '24" */
export const formatMonth = (m: string): string => {
  const [y, mo] = m.split('-');
  const d = new Date(Number(y), Number(mo) - 1);
  return d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
};

/** Format date string → "Mar 5, 2024" (USA month/day order) */
export const formatDateShort = (d: string): string =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days <= 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  // Past a month a "148 days ago" count is hard to read, so show the actual
  // date instead (USA month/day order).
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Format a draw date (ISO string) as "Month D" in ET. Draw dates are stored at midnight ET,
 * so we show only the date (a time component would render a misleading "12:00 AM"). */
export const formatDrawDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'America/New_York' });
};

/** The campaign convention is "opens midnight America/New_York on the 1st", but the stored
 * start_date timestamp is not always exactly that instant. This returns the UTC epoch of
 * midnight NY on the timestamp's NY calendar date, so a countdown and formatDrawDate always
 * agree with each other and with the convention. Null for a missing/invalid input. */
export const nyMidnightUtcMs = (dateStr: string | null | undefined): number | null => {
  if (!dateStr) return null;
  const src = new Date(dateStr);
  if (!Number.isFinite(src.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(src);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const y = get('year'), m = get('month'), d = get('day');
  if (!y || !m || !d) return null;
  // Midnight NY is 04:00 or 05:00 UTC depending on DST. Start from the EST guess and
  // subtract however far into the NY day that instant actually lands (0h in EST, 1h in EDT).
  const guess = Date.UTC(y, m - 1, d, 5, 0, 0);
  const nyHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', hourCycle: 'h23' }).format(guess));
  return guess - nyHour * 3_600_000;
};

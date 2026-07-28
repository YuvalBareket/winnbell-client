// src/shared/utils/date.ts

/**
 * Calculates the difference in days between a future date and today.
 * Returns 0 if the date has passed or is today.
 */
export const calculateDaysLeft = (dateString: string | undefined): number => {
  if (!dateString) return 0;

  const drawDate = new Date(dateString);
  const today = new Date();

  // Set both to midnight to ensure we count full days
  drawDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = drawDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
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

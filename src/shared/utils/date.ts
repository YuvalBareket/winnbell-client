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
 * Formats ISO date strings into readable formats used in the Ticket List
 */
// src/shared/utils/date.ts

// src/shared/utils/date.ts

export const formatTicketDate = (dateString: string) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };

  // Remove the 'Z' if it exists so JavaScript treats it as local 'Wall Time'
  const localString = dateString.replace('Z', '');
  const date = new Date(localString);

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

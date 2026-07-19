// Month-boundary helpers for the campaign modals, working on the YYYY-MM-DD strings
// that <input type=date> produces. The server normalises draw_date to the LAST day of
// its month, so client-side validation must compare against that boundary, not the raw
// day the admin happened to type.

export const firstOfMonth = (d: string): string => (d ? `${d.slice(0, 7)}-01` : '');

export const lastOfMonth = (d: string): string => {
  if (!d) return '';
  const [y, m] = d.split('-').map(Number);
  // Date.UTC with 1-based month and day 0 = last day of month m.
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
};

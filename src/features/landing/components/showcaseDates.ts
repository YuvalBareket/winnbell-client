// Dates for the landing phone mockups - they track the real calendar so the demos
// never look stale. Computed once per page load.

export const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const TODAY = new Date();
export const DAYS_AGO_3 = new Date(TODAY.getTime() - 3 * 24 * 60 * 60 * 1000);
export const RECEIPT_DATE = TODAY.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const DAYS_LEFT = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate() - TODAY.getDate();
export const CAMPAIGN_ENDS =
  DAYS_LEFT === 0 ? 'Campaign ends today' : `Campaign ends in ${DAYS_LEFT} ${DAYS_LEFT === 1 ? 'day' : 'days'}`;
// The business campaign card's wording ("X days left" / "Ends today", like CampaignCard in the app).
export const DAYS_LEFT_LABEL =
  DAYS_LEFT === 0 ? 'Ends today' : `${DAYS_LEFT} ${DAYS_LEFT === 1 ? 'day' : 'days'} left`;

// Short month names for the last six months ending with the current one (chart x-axis).
export const LAST_6_MONTHS = Array.from({ length: 6 }, (_, i) =>
  new Date(TODAY.getFullYear(), TODAY.getMonth() - 5 + i, 1).toLocaleDateString('en-US', { month: 'short' })
);

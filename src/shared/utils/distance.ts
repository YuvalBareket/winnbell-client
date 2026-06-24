const KM_TO_MILES = 0.621371;

// Formats a kilometre distance (from haversine) into imperial units for display.
// Uses feet under 0.1 mi so very-close businesses do not read as "0.0 mi".
export const formatDistanceMiles = (km: number): string => {
  const miles = km * KM_TO_MILES;
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
};

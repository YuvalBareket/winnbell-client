// Overlapping-pin spread for the maps (consumer Nearby + admin oversight).
//
// Adjacent storefronts (same strip mall, next-door addresses) sit meters apart, which is
// sub-pixel at normal zoom - their markers stack and only the top one is visible. The map
// rules forbid clustering, so instead: locations within the same ~60m cell are fanned
// apart by a PIXEL offset baked into each marker's icon anchor. Because the anchor is
// screen-space, the separation is constant at every zoom BY CONSTRUCTION - markers keep
// their true geographic position, nothing is repositioned during zoom gestures, and the
// map stays perfectly smooth (this replaced an earlier approach that moved marker
// positions per zoom level and janked the animation).
//
// Deterministic (members sorted by id) so pins never shuffle between renders. The
// rendered pin sits ~a pin-width from its true spot - visually still "at" the right
// building at any zoom where the group overlapped in the first place.

export interface SpreadInput {
  id: number;
  lat: number;
  lng: number;
}

/** Screen-space icon offset in pixels: +dx renders the pin further right, +dy further
 *  down. Apply by SUBTRACTING from the icon anchor (anchor moves opposite the image). */
export interface PixelOffset {
  dx: number;
  dy: number;
}

/** ~66m in latitude degrees: storefront neighbors share a cell, distinct addresses
 *  further apart never group. (Groups straddling a cell edge fall back to today's
 *  overlap behavior - acceptable, and never worse than before.) */
const CELL_DEG = 0.0006;

/** Returns pixel offsets ONLY for pins that are part of an overlap group - solo pins
 *  are omitted so callers never touch markers that don't need adjusting. */
export const spreadOffsets = (
  items: SpreadInput[],
  radiusPx = 14,
): Map<number, PixelOffset> => {
  const out = new Map<number, PixelOffset>();
  const groups = new Map<string, SpreadInput[]>();

  for (const it of items) {
    if (!Number.isFinite(it.lat) || !Number.isFinite(it.lng)) continue;
    const key = `${Math.round(it.lat / CELL_DEG)}:${Math.round(it.lng / CELL_DEG)}`;
    const group = groups.get(key);
    if (group) group.push(it);
    else groups.set(key, [it]);
  }

  for (const group of groups.values()) {
    if (group.length === 1) continue; // solo pin: rendered exactly at its true spot
    const sorted = [...group].sort((a, b) => a.id - b.id);
    sorted.forEach((it, i) => {
      const angle = (2 * Math.PI * i) / sorted.length; // i=0 east, then around the circle
      out.set(it.id, {
        dx: Math.round(radiusPx * Math.cos(angle)),
        // Screen y grows downward; negate so i=1 of a pair goes up-left vs down-right etc.
        dy: Math.round(radiusPx * Math.sin(angle)),
      });
    });
  }

  return out;
};

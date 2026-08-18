// Overlapping-pin spread for the maps (consumer Nearby + admin oversight).
//
// Adjacent storefronts (same strip mall, next-door addresses) sit meters apart, which is
// sub-pixel at normal zoom - their markers stack and only the top one is visible. The map
// rules forbid clustering, so instead: locations within ~66m of each other are fanned
// apart by a PIXEL offset baked into each marker's icon anchor. Because the anchor is
// screen-space, the separation is constant at every zoom BY CONSTRUCTION - markers keep
// their true geographic position, nothing is repositioned during zoom gestures, and the
// map stays perfectly smooth (this replaced an earlier approach that moved marker
// positions per zoom level and janked the animation).
//
// Grouping is by TRUE PROXIMITY (single-linkage clustering), not a fixed lat/lng grid, so
// two shops ~20m apart that happen to straddle a grid line still group and fan (the old
// grid approach missed those - they showed as one pin until fully zoomed in).
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

/** Neighbor threshold in latitude degrees (~66m). Two pins closer than this are treated
 *  as an overlap group. Longitude is scaled by cos(latitude) so the metric is ~isotropic
 *  in meters rather than stretched near the poles. */
const GROUP_DIST_DEG = 0.0006;

/** True when a and b are within GROUP_DIST_DEG of each other. */
const areNeighbors = (a: SpreadInput, b: SpreadInput): boolean => {
  const cosLat = Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  const dLat = a.lat - b.lat;
  const dLng = (a.lng - b.lng) * cosLat;
  return Math.hypot(dLat, dLng) <= GROUP_DIST_DEG;
};

/** Returns pixel offsets ONLY for pins that are part of an overlap group - solo pins
 *  are omitted so callers never touch markers that don't need adjusting. */
export const spreadOffsets = (
  items: SpreadInput[],
  radiusPx = 14,
): Map<number, PixelOffset> => {
  const out = new Map<number, PixelOffset>();
  const pins = items.filter((it) => Number.isFinite(it.lat) && Number.isFinite(it.lng));

  // Single-linkage clustering via union-find: any two pins within GROUP_DIST_DEG join the
  // same group, so a chain of close storefronts fans as one. n <= 30 (the map row budget),
  // so the O(n^2) neighbor pass is trivial.
  const parent = new Map<number, number>();
  pins.forEach((p) => parent.set(p.id, p.id));
  const find = (x: number): number => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let cur = x; // path-compress so repeated finds stay flat
    while (parent.get(cur) !== root) { const next = parent.get(cur)!; parent.set(cur, root); cur = next; }
    return root;
  };
  for (let i = 0; i < pins.length; i++) {
    for (let j = i + 1; j < pins.length; j++) {
      if (areNeighbors(pins[i], pins[j])) parent.set(find(pins[i].id), find(pins[j].id));
    }
  }

  const groups = new Map<number, SpreadInput[]>();
  for (const p of pins) {
    const root = find(p.id);
    const group = groups.get(root);
    if (group) group.push(p);
    else groups.set(root, [p]);
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

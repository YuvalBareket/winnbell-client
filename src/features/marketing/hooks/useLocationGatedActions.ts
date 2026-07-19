import { useEffect, useRef } from 'react';

interface Options<K extends string> {
  /** A location is already selected - actions are allowed to run */
  ready: boolean;
  /** The parent's location-picker dialog open state */
  pickerOpen: boolean;
  /** Opens the location picker */
  requestLocation: () => void;
  /** Increments every time the user actually PICKS a location in the parent's dialog.
   *  Distinguishes "picked" from "dismissed" - a resumed action only fires on a pick. */
  pickVersion: number;
  /** Ask for the location on EVERY action, even when one is already selected.
   *  Parents enable this when there is a real choice (owner with 2+ locations);
   *  managers and single-location businesses keep the immediate behavior. */
  alwaysAsk?: boolean;
  /** The gated actions, keyed by name. Recreated every render so resumed actions
   *  always see fresh props (e.g. the scanUrl that includes the picked location). */
  actions: Record<K, () => void>;
}

/**
 * Generic "pick a location, then continue" gate for the marketing page.
 *
 * Call the returned runner with an action key: the action runs immediately when a
 * location is chosen (unless alwaysAsk), otherwise the picker opens and the SAME
 * action resumes automatically the moment the user picks a location - no second
 * click. Closing the picker without choosing forgets the click.
 */
export function useLocationGatedActions<K extends string>({ ready, pickerOpen, requestLocation, pickVersion, alwaysAsk = false, actions }: Options<K>) {
  // Refs, not state: nothing rendered depends on the pending key, and the resume
  // effect must invoke the action version from the render AFTER the location was
  // picked, never the stale closure from click time. The sync effect is declared
  // BEFORE the resume effect - effects run in declaration order, so the resume
  // always sees fresh actions.
  const pendingRef = useRef<{ key: K; versionAtRequest: number } | null>(null);
  const actionsRef = useRef(actions);
  useEffect(() => { actionsRef.current = actions; });

  useEffect(() => {
    if (pickerOpen || pendingRef.current === null) return;
    const { key, versionAtRequest } = pendingRef.current;
    pendingRef.current = null;
    // Resume only when the picker closed BECAUSE a location was picked; a plain
    // dismissal (backdrop/escape) leaves pickVersion unchanged and cancels the click.
    if (ready && pickVersion !== versionAtRequest) actionsRef.current[key]();
  }, [pickerOpen, ready, pickVersion]);

  return (key: K) => {
    if (ready && !alwaysAsk) { actionsRef.current[key](); return; }
    pendingRef.current = { key, versionAtRequest: pickVersion };
    requestLocation();
  };
}

import { useEffect, useRef } from 'react';

interface Options<K extends string> {
  /** A location is already selected - actions can run immediately */
  ready: boolean;
  /** The parent's location-picker dialog open state */
  pickerOpen: boolean;
  /** Opens the location picker */
  requestLocation: () => void;
  /** The gated actions, keyed by name. Recreated every render so resumed actions
   *  always see fresh props (e.g. the scanUrl that includes the picked location). */
  actions: Record<K, () => void>;
}

/**
 * Generic "pick a location, then continue" gate for the marketing page.
 *
 * Call the returned runner with an action key: if a location is already chosen the
 * action runs immediately; otherwise the picker opens and the SAME action resumes
 * automatically the moment the picker closes with a location chosen - no second
 * click. Closing the picker without choosing forgets the click.
 */
export function useLocationGatedActions<K extends string>({ ready, pickerOpen, requestLocation, actions }: Options<K>) {
  // Refs, not state: nothing rendered depends on the pending key, and the resume
  // effect must invoke the action version from the render AFTER the location was
  // picked, never the stale closure from click time. The sync effect is declared
  // BEFORE the resume effect - effects run in declaration order, so the resume
  // always sees fresh actions.
  const pendingKeyRef = useRef<K | null>(null);
  const actionsRef = useRef(actions);
  useEffect(() => { actionsRef.current = actions; });

  useEffect(() => {
    if (pickerOpen || pendingKeyRef.current === null) return;
    const key = pendingKeyRef.current;
    pendingKeyRef.current = null;
    if (ready) actionsRef.current[key]();
  }, [pickerOpen, ready]);

  return (key: K) => {
    if (ready) { actionsRef.current[key](); return; }
    pendingKeyRef.current = key;
    requestLocation();
  };
}

import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Resets the window to the top on forward navigation, so a new route never inherits the
 * previous page's scroll position. Rendered once at the app root (inside the Router).
 *
 * Deliberate behaviour:
 *  - Fires on PUSH / REPLACE (link and button clicks, role redirects) only. On POP
 *    (browser Back / Forward) it does nothing, so returning to a page keeps the position
 *    the user is coming back to - the browser's own restoration handles that.
 *  - Skipped when the URL carries a hash (#section), so in-page anchor links still land on
 *    their target instead of the top.
 *  - Keyed on pathname, so a tab or filter change that only rewrites the query string
 *    (?foo=bar) on the SAME page does not jump to the top.
 *
 * The app scrolls the window (MainLayout flows naturally beneath the fixed sidebar and
 * bottom-nav), so window.scrollTo is the right target. useLayoutEffect runs before paint so
 * there is no visible jump.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP') return;
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollToTop;

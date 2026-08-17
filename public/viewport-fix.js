// Viewport zoom-cap fix - loaded as an external PARSE-BLOCKING script from index.html
// (external because the CSP has no 'unsafe-inline'/hashes for script-src; an inline
// version was silently blocked in production, which disabled this fix on Android).
//
// - The viewport meta ships WITH maximum-scale=1: iOS browsers (Safari AND Chrome-on-iOS)
//   only reliably honor the cap when present at parse time; it exists purely to stop the
//   auto-zoom on focused inputs under 16px. iOS has ignored maximum-scale for USER pinch
//   zoom since iOS 10, so zooming still works there.
// - This script REMOVES the cap on every non-iOS platform (Android honors dynamic viewport
//   changes) because a capped viewport blocks Android pinch-zoom - a WCAG 2.1 AA violation
//   and a standard ADA-lawsuit-scanner finding. Runtime scanners therefore see a clean
//   viewport. Touch-capable "Mac" UA = modern iPad.
(function () {
  var isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
  if (!isIOS) {
    var wbViewport = document.querySelector('meta[name="viewport"]');
    if (wbViewport) wbViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
})();

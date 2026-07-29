import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// SPA SEO: per-route <title> for the PUBLIC pages (Google renders JS and reads the updated
// title, so each page gets its own headline in search results instead of the shared static
// one from index.html). Authed app routes are robots-disallowed, so they just keep the brand
// default. Render once near the top of AppRoutes.
const DEFAULT_TITLE = 'Winnbell - Shop Local. Win Monthly Cash Prizes.';

const PAGE_TITLES: Record<string, string> = {
  '/': DEFAULT_TITLE,
  '/for-business': 'Winnbell for Business - Bring Customers Back',
  '/login': 'Sign In - Winnbell',
  '/register': 'Create Your Account - Winnbell',
  '/contact': 'Contact Us - Winnbell',
  '/rules': 'Official Rules - Winnbell',
  '/terms': 'Terms of Service - Winnbell',
  '/privacy': 'Privacy Policy - Winnbell',
  '/cancellation': 'Cancellation and Refund Policy - Winnbell',
  '/business-agreement': 'Business Agreement - Winnbell',
  '/business-guidelines': 'Business Guidelines - Winnbell',
  '/founding-terms': 'Founding Partner Terms - Winnbell',
};

const PageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Exact match first, then prefix match for parameterized routes (/login/:role,
    // /register/:role, /rules/:drawId).
    const prefix = '/' + pathname.split('/')[1];
    document.title = PAGE_TITLES[pathname] ?? PAGE_TITLES[prefix] ?? DEFAULT_TITLE;
  }, [pathname]);

  return null;
};

export default PageTitle;

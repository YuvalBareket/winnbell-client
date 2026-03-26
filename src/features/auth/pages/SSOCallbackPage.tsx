import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

// Handles the OAuth redirect from Google/Apple.
// Clerk processes the callback and redirects to "/" when done.
// The useClerkSync hook in AppRoutes will pick up the session and update Redux.
const SSOCallbackPage = () => (
  <AuthenticateWithRedirectCallback />
);

export default SSOCallbackPage;

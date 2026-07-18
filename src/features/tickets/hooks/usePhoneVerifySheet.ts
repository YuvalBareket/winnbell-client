import { useRef, useState } from 'react';
import type PhoneVerifySheet from '../components/PhoneVerifySheet';

type Context = 'free' | 'receipt' | 'promo' | 'referral' | 'generic';

type SheetProps = React.ComponentProps<typeof PhoneVerifySheet>;

/**
 * Soft phone-verification prompt for entry actions. `requirePhone(context, action)` runs the
 * action immediately when the phone is already verified; otherwise it opens the sheet and
 * resumes the action after a successful verification (with the referral-bonus congrats dialog
 * interposed when the verify response granted one). Dismissing the sheet simply drops the
 * action - the user keeps browsing, the entry waits for next time.
 */
export const usePhoneVerifySheet = (options: {
  isPhoneVerified: boolean;
  onPhoneVerifiedChange: () => void | Promise<unknown>;
  showReferralBonusDialog: (onComplete: () => void) => void;
}) => {
  const [sheetState, setSheetState] = useState<{ open: boolean; context: Context; pendingCode?: string }>({
    open: false,
    context: 'generic',
  });
  // The continuation lives in a ref: it never affects rendering, and reading it from state
  // inside callbacks created stale-closure/memoization headaches.
  const pendingActionRef = useRef<(() => void | Promise<void>) | undefined>(undefined);

  const requirePhone = (
    context: Context,
    action?: () => void | Promise<void>,
    pendingCode?: string,
  ) => {
    if (options.isPhoneVerified) {
      action?.();
      return;
    }
    pendingActionRef.current = action;
    setSheetState({ open: true, context, pendingCode });
  };

  const handleVerified = async (referralBonusGranted: boolean) => {
    // Refresh the verification status (risk-level query) before resuming.
    await options.onPhoneVerifiedChange();

    const resume = () => {
      pendingActionRef.current?.();
      pendingActionRef.current = undefined;
    };
    if (referralBonusGranted) {
      // Congrats dialog first; the entry action resumes when it is dismissed.
      options.showReferralBonusDialog(resume);
    } else {
      resume();
    }
  };

  const sheetProps: SheetProps = {
    open: sheetState.open,
    onClose: () => setSheetState((prev) => ({ ...prev, open: false })),
    onVerified: handleVerified,
    context: sheetState.context,
    pendingCode: sheetState.pendingCode,
  };

  return { sheetProps, requirePhone };
};

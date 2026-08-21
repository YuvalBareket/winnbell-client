// Shared admin-facing labels for receipt entries. Extracted so the Entries page and the
// User/Business detail drawers read from ONE source (a label added in one place, e.g.
// date_unreadable_review, no longer has to be mirrored by hand across components).

// 'code' stays only to label legacy tickets from the removed code entry mode.
export const SOURCE_LABELS: Record<string, string> = {
  code: 'Code',
  receipt: 'Receipt',
  free: 'Weekly',
  promo: 'Promo',
  referral: 'Referral',
};

export const QUARANTINE_LABELS: Record<string, string> = {
  high_risk_user: 'High risk user',
  ocr_pending: 'Image pending review',
  ocr_validation_failed: 'Image rejected',
  ocr_error_pending_review: 'OCR error - pending review',
  shared_receipt_suspected: 'Shared receipt',
  superseded_by_verified_image: 'Duplicate receipt',
  superseded_by_admin_decision: 'Superseded (admin)',
  contest_pending: 'Under review',
  contest_not_won: 'Not verified',
  duplicate_document: 'Duplicate document',
  date_unreadable_review: 'Date unreadable - held for review',
};

export const RISK_FLAG_LABELS: Record<string, string> = {
  duplicate_identifier_cross_user: 'Cross-user duplicate',
  high_submission_velocity: 'High velocity (4+/day)',
  elevated_submission_velocity: 'Elevated velocity (3+/day)',
  sustained_weekly_velocity: 'High weekly volume',
  sustained_monthly_volume: 'High monthly volume',
  rapid_submission: 'Rapid re-submit (under 30s)',
  sequential_guessing: 'Sequential guessing',
  threshold_probing: 'Threshold probing',
  amount_outlier: 'Amount outlier (3x+ avg)',
  suspiciously_fast_input: 'Suspiciously fast input',
  superseded_duplicate_receipt: 'Duplicate receipt (owner verified theirs)',
  duplicate_document: 'Reused receipt (different number, same image)',
  same_business_receipt_velocity: 'Many verified receipts at one business (24h)',
};

// Short chip label for the OCR/image validation lifecycle status.
export const IMAGE_STATUS_LABELS: Record<string, string> = {
  passed: 'OCR ok',
  failed: 'OCR fail',
  ocr_error: 'OCR err',
  pending: 'OCR pending',
};

import { useCallback } from 'react';
import { scanReceiptImage, type ReceiptScanResult } from '../api/ticketsApi';

/** What the read produced for the form. `null` = unread (nothing parsed OR the read
    service failed) - never an error state, so a read outage cannot block an entry. */
export interface ReadReceiptFields {
  identifier: string | null;
  amount: number | null;
  date: string | null;
}

// Runs after useUploadReceiptImage resolves, keyed by the returned URL. The server caches
// the underlying model read, so submit-time validation reuses this same call.
export function useReadReceipt() {
  const readReceipt = useCallback(async (receiptImageUrl: string): Promise<ReadReceiptFields | null> => {
    try {
      const result: ReceiptScanResult = await scanReceiptImage(receiptImageUrl);
      if (!result.ok) return null;
      const fields: ReadReceiptFields = {
        identifier: result.identifier ?? null,
        amount: result.amount ?? null,
        date: result.date ?? null,
      };
      if (!fields.identifier && fields.amount === null && fields.date === null) return null;
      return fields;
    } catch {
      return null;
    }
  }, []);
  return { readReceipt };
}

import { useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { Close, CloudUpload, Visibility } from '@mui/icons-material';
import {
  PRIMARY_MAIN, SUCCESS_RECEIPT, SUCCESS_RECEIPT_BG_LIGHT, SUCCESS_RECEIPT_BG_MEDIUM,
  SUCCESS_RECEIPT_BG_HOVER, SUCCESS_RECEIPT_DARK, ALPHA_BLACK_60, ALPHA_BLACK_85
} from '../../../shared/colors';

interface Props {
  primaryColor: string;
  receiptImageUrl: string | null;
  setReceiptImageUrl: (url: string | null) => void;
  isUploading: boolean;
  uploadError: string | null;
  onUpload: (file: File) => Promise<string | null | undefined>;
}

const ReceiptImageUploadField: React.FC<Props> = ({
  primaryColor,
  receiptImageUrl,
  setReceiptImageUrl,
  isUploading,
  uploadError,
  onUpload,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <Box>
      {/* No `capture` attr: mobile browsers then offer camera, photo library, AND
          files in one chooser instead of forcing the camera. PDFs are rendered to
          an image by the upload hook. */}
      <input
        id="receipt-image-input"
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = await onUpload(file);
          if (url) setReceiptImageUrl(url);
        }}
      />
      <Box
        component="label"
        htmlFor="receipt-image-input"
        sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          p: 2, borderRadius: 2.5,
          border: '1.5px dashed',
          borderColor: receiptImageUrl ? SUCCESS_RECEIPT : `${primaryColor || PRIMARY_MAIN}50`,
          bgcolor: receiptImageUrl ? SUCCESS_RECEIPT_BG_LIGHT : `${primaryColor || PRIMARY_MAIN}06`,
          cursor: isUploading ? 'wait' : 'pointer',
          transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
          '&:hover': {
            borderColor: receiptImageUrl ? SUCCESS_RECEIPT : primaryColor || PRIMARY_MAIN,
            bgcolor: receiptImageUrl ? SUCCESS_RECEIPT_BG_MEDIUM : `${primaryColor || PRIMARY_MAIN}10`,
          },
        }}
      >
        {isUploading ? (
          <>
            <CircularProgress size={22} sx={{ color: primaryColor || PRIMARY_MAIN, flexShrink: 0 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Uploading…</Typography>
              <Typography variant="caption" color="text.secondary">Please wait</Typography>
            </Box>
          </>
        ) : receiptImageUrl ? (
          <>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: `2px solid ${SUCCESS_RECEIPT}` }}>
              <Box component="img" src={receiptImageUrl} alt="receipt" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: SUCCESS_RECEIPT_DARK }}>Receipt attached</Typography>
              <Typography variant="caption" sx={{ color: SUCCESS_RECEIPT }}>Tap to replace</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => { e.preventDefault(); setPreviewOpen(true); }}
              sx={{ color: SUCCESS_RECEIPT_DARK, bgcolor: SUCCESS_RECEIPT_BG_MEDIUM, '&:hover': { bgcolor: SUCCESS_RECEIPT_BG_HOVER } }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              bgcolor: `${primaryColor || PRIMARY_MAIN}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CloudUpload sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Attach your receipt</Typography>
              <Typography variant="caption" color="text.secondary">Take a photo, or upload an image or PDF</Typography>
            </Box>
          </>
        )}
      </Box>
      {uploadError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block', pl: 0.5 }}>
          {uploadError}
        </Typography>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 1, position: 'relative', bgcolor: 'common.black' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: ALPHA_BLACK_60, color: 'common.white', '&:hover': { bgcolor: ALPHA_BLACK_85 } }}
          >
            <Close fontSize="small" />
          </IconButton>
          {receiptImageUrl && (
            <Box component="img" src={receiptImageUrl} alt="Receipt preview" sx={{ width: '100%', display: 'block', borderRadius: 0.5 }} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ReceiptImageUploadField;

import { useState } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { Close, CloudUpload, Visibility } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';

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
      <input
        id="receipt-image-input"
        type="file"
        accept="image/*"
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
          borderColor: receiptImageUrl ? '#16a34a' : `${primaryColor || PRIMARY_MAIN}50`,
          bgcolor: receiptImageUrl ? '#f0fdf4' : `${primaryColor || PRIMARY_MAIN}06`,
          cursor: isUploading ? 'wait' : 'pointer',
          transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
          '&:hover': {
            borderColor: receiptImageUrl ? '#16a34a' : primaryColor || PRIMARY_MAIN,
            bgcolor: receiptImageUrl ? '#dcfce7' : `${primaryColor || PRIMARY_MAIN}10`,
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
            <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: '2px solid #16a34a' }}>
              <Box component="img" src={receiptImageUrl} alt="receipt" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d' }}>Receipt attached</Typography>
              <Typography variant="caption" sx={{ color: '#16a34a' }}>Tap to replace</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => { e.preventDefault(); setPreviewOpen(true); }}
              sx={{ color: '#15803d', bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' } }}
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
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Attach receipt photo</Typography>
              <Typography variant="caption" color="text.secondary">Tap to take a photo or upload from gallery</Typography>
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
        <DialogContent sx={{ p: 1, position: 'relative', bgcolor: '#000' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}
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

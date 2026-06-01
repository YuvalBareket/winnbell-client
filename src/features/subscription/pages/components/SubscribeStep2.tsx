import { useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Check, Edit } from '@mui/icons-material';
import CanvasAnnotationEditor from '../../../../shared/components/CanvasAnnotationEditor';

interface Props {
  imgFile: File | null;
  setImgFile: (f: File | null) => void;
  existingImageUrl: string | undefined;
  isSaving: boolean;
  onSave: (blob: Blob) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const SubscribeStep2 = ({
  imgFile,
  setImgFile,
  existingImageUrl,
  isSaving,
  onSave,
  onContinue,
  onSkip,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

      {!imgFile && existingImageUrl ? (
        <>
          {/* Already uploaded - show preview */}
          <Box sx={{ borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, lineHeight: 0 }}>
            <Box component='img' src={existingImageUrl} alt='Current receipt example'
              sx={{ display: 'block', width: '100%', maxHeight: 320, objectFit: 'contain' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 2, p: 1.5, mb: 2.5 }}>
            <Check sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
            <Typography variant='body2' fontWeight={600} color='success.main'>
              Receipt example already uploaded
            </Typography>
          </Box>

          <Button fullWidth variant='contained' size='large' onClick={onContinue}
            sx={{ py: 1.875, fontWeight: 800, fontSize: '1rem', textTransform: 'none', mb: 1.5, boxShadow: '0 4px 14px rgba(2,146,183,0.3)' }}>
            Looks good, continue →
          </Button>

          <input ref={fileInputRef} type='file' accept='image/*' hidden
            onChange={(e) => { if (e.target.files?.[0]) setImgFile(e.target.files[0]); }} />

          <Button fullWidth variant='outlined' size='small' startIcon={<Edit />} onClick={() => fileInputRef.current?.click()}
            sx={{ textTransform: 'none', fontWeight: 700 }}>
            Replace image
          </Button>
        </>
      ) : (
        <>
          <CanvasAnnotationEditor
            imgFile={imgFile}
            onFileSelect={(file) => setImgFile(file)}
            onSave={onSave}
            isSaving={isSaving}
          />
          {!imgFile && (
            <Button fullWidth variant='text' onClick={onSkip}
              sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
              Skip for now
            </Button>
          )}
          {imgFile && (
            <Button fullWidth variant='text' onClick={() => { setImgFile(null); onSkip(); }}
              sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
              Skip for now
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default SubscribeStep2;

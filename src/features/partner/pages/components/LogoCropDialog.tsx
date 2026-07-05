import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Slider,
  Button,
  Typography,
  CircularProgress,
  Stack,
} from '@mui/material';
import { getUploadUrl } from '../../api/business.api';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const getCroppedFile = async (imageSrc: string, croppedAreaPixels: Area): Promise<File> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise<void>((resolve) => { image.onload = () => resolve(); });

  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas export failed')); return; }
      resolve(new File([blob], 'logo.png', { type: 'image/png' }));
    }, 'image/png');
  });
};

// Convert to WebP like useUploadBusinessLogo does
const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxDimension = 512;
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('WebP conversion failed')); return; }
          resolve(new File([blob], 'logo.webp', { type: 'image/webp' }));
        },
        'image/webp',
        0.85,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
};

interface LogoCropDialogWithPickerProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (key: string) => void;
  imageSrc?: string;
  onConfirm?: (file: File) => void;
}

const LogoCropDialog: React.FC<LogoCropDialogWithPickerProps> = ({ open, onClose, onUploadComplete, imageSrc: initialImageSrc, onConfirm }) => {
  // Support both old API (imageSrc + onConfirm) and new API (onUploadComplete)
  const isOldMode = !!initialImageSrc && !!onConfirm;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageSrc || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the parent hands in an already-picked image (its own file input), jump straight to the
  // cropper instead of showing our internal "choose a file" screen.
  useEffect(() => {
    setImageSrc(initialImageSrc || null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [initialImageSrc]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setError(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmNew = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get cropped file
      const croppedFile = await getCroppedFile(imageSrc, croppedAreaPixels);

      // Convert to WebP
      const webpFile = await convertToWebP(croppedFile);

      // Get upload URL
      const { uploadUrl, key } = await getUploadUrl('image/webp', webpFile.size);

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: webpFile,
        headers: { 'Content-Type': 'image/webp' },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Return the key
      if (onUploadComplete) {
        onUploadComplete(key);
      }
      setImageSrc(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmOld = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    const croppedFile = await getCroppedFile(imageSrc, croppedAreaPixels);
    if (onConfirm) {
      onConfirm(croppedFile);
    }
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  // Old mode: if imageSrc was provided initially, show cropper immediately
  if (isOldMode) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Crop Logo</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Box sx={{ position: 'relative', width: '100%', height: 300, borderRadius: 2, overflow: 'hidden', bgcolor: '#111' }}>
            <Cropper
              image={imageSrc || ''}
              crop={crop}
              zoom={zoom}
              minZoom={0.1}
              maxZoom={3}
              aspect={1}
              cropShape='round'
              showGrid={false}
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </Box>
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant='caption' color='text.secondary' fontWeight={600}>
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={0.1}
              max={3}
              step={0.05}
              onChange={(_, value) => setZoom(value as number)}
              size='small'
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant='contained' onClick={handleConfirmOld} sx={{ fontWeight: 700 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // New mode: show file picker if no image is selected
  if (!imageSrc) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Upload Logo</DialogTitle>
        <DialogContent sx={{ pb: 1, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems='center' spacing={2} sx={{ width: '100%' }}>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              Click below to select a logo image from your computer.
            </Typography>
            <Button
              variant='contained'
              onClick={handleOpenClick}
              sx={{ fontWeight: 700 }}
            >
              Choose Image
            </Button>
            {error && (
              <Typography variant='caption' color='error' textAlign='center'>
                {error}
              </Typography>
            )}
          </Stack>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} sx={{ fontWeight: 600 }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // New mode: show cropper after image is selected
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Crop Logo</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ position: 'relative', width: '100%', height: 300, borderRadius: 2, overflow: 'hidden', bgcolor: '#111' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={0.1}
            maxZoom={3}
            aspect={1}
            cropShape='round'
            showGrid={false}
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </Box>
        <Box sx={{ px: 1, mt: 2 }}>
          <Typography variant='caption' color='text.secondary' fontWeight={600}>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={0.1}
            max={3}
            step={0.05}
            onChange={(_, value) => setZoom(value as number)}
            size='small'
          />
        </Box>
        {error && (
          <Typography variant='caption' color='error' sx={{ mt: 1.5, display: 'block' }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={() => {
            setImageSrc(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
          }}
          disabled={isUploading}
          sx={{ fontWeight: 600 }}
        >
          Back
        </Button>
        <Button
          variant='contained'
          onClick={handleConfirmNew}
          disabled={isUploading}
          sx={{ fontWeight: 700 }}
        >
          {isUploading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Save & Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoCropDialog;

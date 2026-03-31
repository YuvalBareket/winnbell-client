import React, { useState, useCallback } from 'react';
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
} from '@mui/material';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LogoCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], 'logo.png', { type: 'image/png' }));
    }, 'image/png');
  });
};

const LogoCropDialog: React.FC<LogoCropDialogProps> = ({ open, imageSrc, onClose, onConfirm }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const file = await getCroppedFile(imageSrc, croppedAreaPixels);
    onConfirm(file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Crop Logo</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Box sx={{ position: 'relative', width: '100%', height: 300, borderRadius: 3, overflow: 'hidden', bgcolor: '#111' }}>
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button variant='contained' onClick={handleConfirm} sx={{ fontWeight: 700, borderRadius: 2 }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoCropDialog;

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getUploadUrl, updateBusinessLogo } from '../api/business.api';
import { useAppDispatch } from '../../../store/hook';
import { updateBusinessUser } from '../../../store/slices/authSlice';
import { queryKeys } from '../../../shared/constants/queryKeys';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB original file
const MAX_DIMENSION = 512; // px — logos are displayed small, 512 is plenty
const WEBP_QUALITY = 0.85;

const convertToWebP = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
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
        WEBP_QUALITY,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });

export const useUploadBusinessLogo = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be under 5 MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Convert to WebP and resize before uploading
      const webpFile = await convertToWebP(file);

      const { uploadUrl, key } = await getUploadUrl('image/webp');

      await fetch(uploadUrl, {
        method: 'PUT',
        body: webpFile,
        headers: { 'Content-Type': 'image/webp' },
      });

      await updateBusinessLogo(key);
      dispatch(updateBusinessUser({ businessLogoUrl: key }));
      queryClient.invalidateQueries({ queryKey: queryKeys.business.myDetails });
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error, clearError: () => setError(null) };
};

import { useState } from 'react';
import { getReceiptUploadUrl } from '../api/ticketsApi';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1920;              // keep receipts readable
const WEBP_QUALITY = 0.9;

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
          if (!blob) { reject(new Error('Conversion failed')); return; }
          resolve(new File([blob], 'receipt.webp', { type: 'image/webp' }));
        },
        'image/webp',
        WEBP_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });

export const useUploadReceiptImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be under 10 MB.');
      return null;
    }

    setError(null);
    setIsUploading(true);

    try {
      const webpFile = await convertToWebP(file);
      const { uploadUrl, publicUrl } = await getReceiptUploadUrl();

      await fetch(uploadUrl, {
        method: 'PUT',
        body: webpFile,
        headers: { 'Content-Type': 'image/webp' },
      });

      return publicUrl;
    } catch {
      setError('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error, clearError: () => setError(null) };
};

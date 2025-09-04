import { useState } from 'react';

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, propertyId: string): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Upload failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imagePath: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/upload-image?path=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
    error,
  };
};

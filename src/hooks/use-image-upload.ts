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
      // Validate file before upload
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
      ];
      if (!allowedTypes.includes(file.type)) {
        const errorMessage = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const errorMessage = 'File too large. Maximum size is 10MB';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('propertyId', propertyId);

      console.log('Uploading image:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        propertyId,
      });

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error ?? `Upload failed with status ${response.status}`;
        console.error('Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Upload successful:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('Upload error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imagePath: string, propertyId?: string): Promise<boolean> => {
    try {
      const url = new URL('/api/upload-image', window.location.origin);
      url.searchParams.set('path', imagePath);
      if (propertyId) {
        url.searchParams.set('propertyId', propertyId);
      }

      const response = await fetch(url.toString(), {
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

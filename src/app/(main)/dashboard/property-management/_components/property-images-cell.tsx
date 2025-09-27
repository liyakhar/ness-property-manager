'use client';

import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, Paperclip, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useImageUpload } from '@/hooks/use-image-upload';
import { isVercelBlobUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface PropertyImagesCellProps {
  value?: string[];
  onSave: (value: string[] | undefined) => void;
  className?: string;
  propertyId: string; // Add propertyId prop for uploads
}

export const PropertyImagesCell: React.FC<PropertyImagesCellProps> = ({
  value,
  onSave,
  className,
  propertyId,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [images, setImages] = React.useState<string[]>(value ?? []);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { uploadImage, deleteImage, isUploading, error } = useImageUpload();

  React.useEffect(() => {
    setImages(value ?? []);
  }, [value]);

  const handleSave = () => {
    onSave(images.length ? images : undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setImages(value ?? []);
    setIsEditing(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    // Upload each file to local storage
    const uploadPromises = Array.from(fileList).map(async (file) => {
      const result = await uploadImage(file, propertyId);
      return result.success ? result.url : null;
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(Boolean) as string[];

      if (validUrls.length > 0) {
        const next = [...images, ...validUrls];
        setImages(next);
        onSave(next.length ? next : undefined);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAt = async (idx: number) => {
    const imageUrl = images[idx];
    const next = images.filter((_, i) => i !== idx);

    // Try to delete from local storage
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');

      // Extract filename from local storage URL
      if (pathParts.includes('api') && pathParts.includes('images')) {
        const filename = pathParts[pathParts.length - 1];
        await deleteImage(filename);
      }
    } catch (err) {
      console.error('Delete error:', err);
      // Continue with removal even if delete fails
    }

    setImages(next);
    onSave(next.length ? next : undefined);
  };

  const handleOpenPreview = (idx: number) => {
    setPreviewIndex(idx);
    setIsPreviewOpen(true);
  };

  const handlePreviousImage = () => {
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setPreviewIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (isEditing) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Input
          placeholder="Вставьте URL изображения"
          value=""
          onChange={() => {}}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
          multiple
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-2"
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Paperclip className="h-3 w-3" />
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave} className="h-8 px-2">
          ✓
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 px-2">
          ✕
        </Button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {images.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs">Нет изображений</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0"
          >
            <Paperclip className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex -space-x-2">
            {images.slice(0, 3).map((image, idx) => (
              <div key={image} className="group relative">
                <Avatar className="border-background h-8 w-8 border-2">
                  <AvatarImage src={image} alt={`Property image ${idx + 1}`} />
                  <AvatarFallback>
                    <ImageIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveAt(idx)}
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ))}
            {images.length > 3 && (
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                +{images.length - 3}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenPreview(0)}
              className="h-6 w-6 p-0"
            >
              <ImageIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6 p-0"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Просмотр изображений</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {images[previewIndex] && (
              <Image
                src={images[previewIndex]}
                alt={`Property ${previewIndex + 1}`}
                width={800}
                height={600}
                unoptimized={isVercelBlobUrl(images[previewIndex])}
                className="h-auto max-h-[70vh] w-full object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousImage}
                  className="absolute top-1/2 left-4 -translate-y-1/2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextImage}
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex justify-center gap-2">
            {images.map((image, idx) => (
              <Button
                key={image}
                variant={idx === previewIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewIndex(idx)}
                className="h-8 w-8 p-0"
              >
                {idx + 1}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

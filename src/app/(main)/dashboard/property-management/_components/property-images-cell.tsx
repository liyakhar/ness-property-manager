"use client";

import * as React from "react";

import { Paperclip, X, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PropertyImagesCellProps {
  value?: string[];
  onSave: (value: string[] | undefined) => void;
  className?: string;
}

export const PropertyImagesCell: React.FC<PropertyImagesCellProps> = ({ value, onSave, className }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [images, setImages] = React.useState<string[]>(value ?? []);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const readers: Promise<string>[] = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList.item(i);
      if (!file) continue;
      const reader = new FileReader();
      const p = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve((e.target?.result as string) ?? "");
      });
      reader.readAsDataURL(file);
      readers.push(p);
    }

    Promise.all(readers).then((base64List) => {
      const next = [...images, ...base64List.filter(Boolean)];
      setImages(next);
      // Auto-save immediately after selecting files
      onSave(next.length ? next : undefined);
      setIsEditing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleRemoveAt = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
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
      <div className={cn("flex items-center gap-2", className)}>
        <Input placeholder="Вставьте URL изображения" value="" onChange={() => {}} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
          multiple
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 px-2">
          <Paperclip className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave} className="h-8 px-2">
          ✓
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel} className="h-8 px-2">
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {(images ?? []).slice(0, 3).map((src, idx) => (
        <button key={`img-${idx}-${src}`} type="button" className="relative" onClick={() => handleOpenPreview(idx)}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={src} alt="" />
            <AvatarFallback>
              <ImageIcon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </button>
      ))}
      {!images || images.length === 0 ? (
        <span className="text-muted-foreground text-xs">Нет</span>
      ) : images.length > 3 ? (
        <span className="text-muted-foreground text-[10px]">+{images.length - 3}</span>
      ) : null}

      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-6 px-2">
        Изм.
      </Button>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Просмотр изображений ({previewIndex + 1} из {images.length})
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {images.length > 0 ? (
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[previewIndex]} alt="" className="max-h-[500px] max-w-full rounded object-contain" />

                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousImage}
                      className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 p-0"
                      aria-label="Предыдущее изображение"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextImage}
                      className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 p-0"
                      aria-label="Следующее изображение"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-center">Нет изображений</div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {images.map((src, idx) => (
                  <div key={`preview-${idx}-${src}`} className="relative">
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className={cn(
                        "rounded border-2 transition-colors",
                        idx === previewIndex ? "border-primary" : "hover:border-muted-foreground border-transparent",
                      )}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={src} alt="" />
                        <AvatarFallback>
                          <ImageIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAt(idx)}
                      className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 rounded-full p-0.5"
                      aria-label="Удалить изображение"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

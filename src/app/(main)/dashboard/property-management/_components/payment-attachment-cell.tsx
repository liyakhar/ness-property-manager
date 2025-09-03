"use client";

import * as React from "react";

import Image from "next/image";

import { Paperclip, X, FileText, Download, Image as ImageIcon } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PaymentAttachmentCellProps {
  value: string | undefined;
  onSave: (value: string | undefined) => void;
  className?: string;
}

export const PaymentAttachmentCell: React.FC<PaymentAttachmentCellProps> = ({ value, onSave, className }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [attachmentUrl, setAttachmentUrl] = React.useState(value ?? "");
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(attachmentUrl ? attachmentUrl : undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setAttachmentUrl(value ?? "");
    setIsEditing(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert file to base64 for storage in database
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setAttachmentUrl(result);
          // Auto-save immediately after selecting a file
          onSave(result);
          setIsEditing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentUrl("");
    onSave(undefined);
  };

  const getFileName = (url: string) => {
    // Handle base64 data URLs
    if (url.startsWith("data:")) {
      const mimeType = url.split(",")[0].split(":")[1].split(";")[0];
      const extension = mimeType.split("/")[1];
      return `attachment.${extension}`;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split("/").pop() ?? "attachment";
    } catch {
      return url.split("/").pop() ?? "attachment";
    }
  };

  // eslint-disable-next-line complexity
  const getFileType = (url: string) => {
    // Handle base64 data URLs
    if (url.startsWith("data:")) {
      const mimeType = url.split(",")[0].split(":")[1].split(";")[0];
      if (mimeType.startsWith("image/")) {
        return "image";
      } else if (mimeType === "application/pdf") {
        return "pdf";
      } else if (
        mimeType.includes("text/") ||
        mimeType.includes("application/msword") ||
        mimeType.includes("application/vnd.openxmlformats")
      ) {
        return "document";
      }
      return "unknown";
    }

    const fileName = getFileName(url);
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension ?? "")) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    } else if (["doc", "docx", "txt", "rtf"].includes(extension ?? "")) {
      return "document";
    }
    return "unknown";
  };

  const isImage = (url: string) => getFileType(url) === "image";
  const isPdf = (url: string) => getFileType(url) === "pdf";

  const handlePreview = () => {
    if (value) {
      setIsPreviewOpen(true);
    }
  };

  const handleDownload = () => {
    if (value) {
      if (value.startsWith("data:")) {
        // Handle base64 data URLs
        const link = document.createElement("a");
        link.href = value;
        link.download = getFileName(value);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle regular URLs
        window.open(value, "_blank");
      }
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          placeholder="URL файла или выберите файл для загрузки"
          className="h-8 text-xs"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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

  if (value) {
    const fileName = getFileName(value);

    return (
      <>
        <div className={cn("flex items-center gap-1", className)}>
          <Button variant="ghost" size="sm" onClick={handlePreview} className="h-8 w-8 p-0" title={fileName}>
            {isImage(value) ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={value} alt={fileName} />
                <AvatarFallback>
                  <ImageIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <FileText className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-6 w-6 p-0" title="Скачать файл">
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-6 w-6 p-0" title="Изменить">
            <Paperclip className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveAttachment}
            className="text-destructive hover:text-destructive h-6 w-6 p-0"
            title="Удалить"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isImage(value) ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                {fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {isImage(value) ? (
                <div className="flex justify-center">
                  <Image
                    src={value}
                    alt={fileName}
                    width={800}
                    height={600}
                    unoptimized
                    className="max-h-[70vh] max-w-full rounded-lg border object-contain"
                    onError={(e) => {
                      const target = e.target as unknown as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="text-muted-foreground flex hidden h-32 items-center justify-center">
                    Не удалось загрузить изображение
                  </div>
                </div>
              ) : isPdf(value) ? (
                <div className="h-[70vh] w-full">
                  <iframe src={value} className="h-full w-full rounded-lg border" title={fileName} />
                </div>
              ) : (
                <div className="text-muted-foreground flex h-32 flex-col items-center justify-center">
                  <FileText className="mb-2 h-12 w-12" />
                  <p>Предварительный просмотр недоступен</p>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Открыть файл
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className={cn("h-8 w-8 p-0", className)}>
      <Paperclip className="h-4 w-4" />
    </Button>
  );
};

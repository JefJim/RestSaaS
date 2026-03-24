"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload = ({ value, onChange, disabled, className }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('restsaas_token');
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const response = await fetch(`${apiUrl}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      onChange(result.imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadImage(files[0]);
    }
  }, [uploadImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadImage(files[0]);
    }
  }, [uploadImage]);

  const handleRemove = useCallback(async () => {
    if (!value) return;

    try {
      const token = localStorage.getItem('restsaas_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const response = await fetch(`${apiUrl}/api/upload/image?imageUrl=${encodeURIComponent(value)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onChange(null);
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  }, [value, onChange]);

  return (
    <div className={`space-y-4 ${className || ""}`} suppressHydrationWarning>
      {value ? (
        <div className="relative" suppressHydrationWarning>
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-2xl border border-border/20"
          />
          <Button
            onClick={handleRemove}
            disabled={disabled || isUploading}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
            size="sm"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${dragActive
              ? 'border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/10'
              : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          suppressHydrationWarning
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center space-y-3" suppressHydrationWarning>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm font-bold text-primary animate-pulse">Subiendo imagen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4" suppressHydrationWarning>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 text-white/40" />
              </div>
              <div>
                <p className="text-sm font-bold">Arrastra tu logo aquí</p>
                <p className="text-xs text-white/40 mt-1">O haz clic para explorar</p>
                <p className="text-[10px] text-white/20 mt-3 font-medium uppercase tracking-widest">PNG, JPG up to 5MB</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
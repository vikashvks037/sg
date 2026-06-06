"use client";
import React, { useRef, useState } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  label?: string;
  uploading?: boolean;
  previews?: string[];
  onRemovePreview?: (index: number) => void;
}

export function FileUpload({
  onFiles,
  accept = "image/*,video/*",
  multiple = true,
  maxFiles = 10,
  className,
  label,
  uploading,
  previews = [],
  onRemovePreview,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList) => {
    const arr = Array.from(fileList).slice(0, maxFiles);
    onFiles(arr);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          dragging ? "border-[#CF1432] bg-red-50" : "border-gray-300 hover:border-[#CF1432] hover:bg-gray-50",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={uploading}
        />
        <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {uploading ? "Uploading..." : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-gray-400 mt-1">Images & videos supported (max {maxFiles} files)</p>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((url, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              {url.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={url} className="w-full h-full object-cover" />
              ) : (
                <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
              )}
              {onRemovePreview && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemovePreview(i); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { UPLOAD_OPTIONS } from "@/lib/options";

export function useUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadSingle = useCallback(async (file: File, folder = "products") => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const { data } = await api.post(API.common.upload.single, form, UPLOAD_OPTIONS);
      if (data.success) return data;
      toast.error(data.message || "Upload failed");
      return null;
    } catch {
      toast.error("Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultiple = useCallback(async (files: File[], folder = "products") => {
    setUploading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      form.append("folder", folder);
      const { data } = await api.post(API.common.upload.multiple, form, UPLOAD_OPTIONS);
      if (data.success) return data.files;
      toast.error(data.message || "Upload failed");
      return [];
    } catch {
      toast.error("Upload failed");
      return [];
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteFile = useCallback(async (path: string) => {
    try {
      await api.delete(API.common.upload.delete, { data: { path }, withCredentials: true });
    } catch { /* silent */ }
  }, []);

  return { uploading, uploadSingle, uploadMultiple, deleteFile };
}

"use client";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Star, StarOff } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Feature } from "@/types";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { FileUpload } from "@/components/shared/FileUpload";
import { Modal } from "@/components/shared/Modal";
import { PageLoader, Empty } from "@/components/shared/ui";
import { useUpload } from "@/hooks/use-upload";
import toast from "react-hot-toast";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { uploading, uploadSingle } = useUpload();

  const fetchFeatures = async () => {
    setLoading(true);
    const { data } = await api.get(API.common.features);
    if (data.success) setFeatures(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchFeatures(); }, []);

  const handleFileUpload = async (files: File[]) => {
    if (!files[0]) return;
    const res = await uploadSingle(files[0], "banners");
    if (res) setImageUrl(res.url);
  };

  const handleSave = async () => {
    if (!imageUrl) { toast.error("Upload an image first"); return; }
    setSaving(true);
    try {
      const { data } = await api.post(API.common.features, { image: imageUrl, title });
      if (data.success) { toast.success("Banner added!"); setModalOpen(false); setTitle(""); setImageUrl(""); fetchFeatures(); }
      else toast.error(data.message || "Failed");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const { data } = await api.delete(`${API.common.features}/${id}`);
    if (data.success) { toast.success("Deleted!"); fetchFeatures(); }
  };

  const handleSetPrimary = async (id: string) => {
    const { data } = await api.patch(`${API.common.features}/${id}/primary`);
    if (data.success) { toast.success("Set as primary banner!"); fetchFeatures(); }
    else toast.error(data.message || "Failed");
  };

  return (
    <div>
      <div className="flex justify-end mb-6 md:mb-8">
        <Button onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>Add Banner</Button>
      </div>

      {loading ? <PageLoader /> : features.length === 0 ? (
        <Empty title="No banners yet" description="Add banners to display on the homepage" action={<Button onClick={() => setModalOpen(true)}>Add Banner</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
              <div className="relative aspect-[16/9]">
                <img src={f.image} alt={f.title || "Banner"} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleSetPrimary(f._id)} className="bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 transition" title="Set as primary">
                    <Star className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(f._id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {f.title && (
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800">{f.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Banner">
        <div className="flex flex-col gap-4">
          <Input
            label="Banner Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summer Sale 2025"
          />
          <FileUpload
            label="Banner Image*"
            onFiles={handleFileUpload}
            multiple={false}
            uploading={uploading}
            previews={imageUrl ? [imageUrl] : []}
            onRemovePreview={() => setImageUrl("")}
          />
          <div className="flex gap-3 mt-2">
            <Button onClick={handleSave} loading={saving || uploading} className="flex-1">Save Banner</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

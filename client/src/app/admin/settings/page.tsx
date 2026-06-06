"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { FileUpload } from "@/components/shared/FileUpload";
import { PageLoader } from "@/components/shared/ui";
import { useUpload } from "@/hooks/use-upload";
import { useSettings } from "@/hooks/use-settings";
import { Trash2, Plus, Pencil, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface HelpPage {
  _id: string;
  label: string;
  slug: string;
  content: string;
  order: number;
}

export default function AdminSettingsPage() {
  const { fetchSettings } = useSettings();
  const { uploading, uploadSingle } = useUpload();
  const [loading, setLoading] = useState(true);

  // --- Brand ---
  const [appName, setAppName] = useState("");
  const [logo, setLogo] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  // --- Store ---
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [freeDelivery, setFreeDelivery] = useState("999");
  const [deliveryCharge, setDeliveryCharge] = useState("49");
  const [savingStore, setSavingStore] = useState(false);

  // --- Footer ---
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const [savingFooter, setSavingFooter] = useState(false);

  // --- Help Pages ---
  const [helpPages, setHelpPages] = useState<HelpPage[]>([]);
  const [helpLoading, setHelpLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newContent, setNewContent] = useState("");
  const [addingHelp, setAddingHelp] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    api.get(API.common.settings).then(({ data }) => {
      if (data.success && data.data) {
        const d = data.data;
        setAppName(d.appName || "");
        setLogo(d.logo || "");
        setEmail(d.email || "");
        setPhone(d.phone || "");
        setFreeDelivery(String(d.freeDeliveryThreshold ?? 999));
        setDeliveryCharge(String(d.deliveryCharge ?? 49));
        const footer = d.footer || {};
        setContactEmail(footer.contactEmail || "");
        setContactAddress(footer.contactAddress || "");
        setCopyrightText(footer.copyrightText || "");
        const social = footer.socialLinks || {};
        setFacebook(social.facebook || "");
        setInstagram(social.instagram || "");
        setTwitter(social.twitter || "");
        setYoutube(social.youtube || "");
      }
    }).finally(() => setLoading(false));

    fetchHelpPages();
  }, []);

  const fetchHelpPages = async () => {
    setHelpLoading(true);
    try {
      const { data } = await api.get(API.admin.help);
      if (data.success) setHelpPages(data.data);
    } catch { /* silent */ }
    finally { setHelpLoading(false); }
  };

  const handleLogoUpload = async (files: File[]) => {
    if (!files[0]) return;
    const res = await uploadSingle(files[0], "settings");
    if (res?.url) setLogo(res.url);
  };

  const saveBrandSection = async () => {
    if (!appName.trim()) { toast.error("App name is required"); return; }
    setSavingBrand(true);
    try {
      const { data } = await api.put(`${API.common.settings}/brand`, { appName: appName.trim(), logo });
      if (data.success) { toast.success("Brand settings saved!"); fetchSettings(); }
      else toast.error(data.message || "Failed to save brand settings");
    } catch { toast.error("Failed to save brand settings"); }
    finally { setSavingBrand(false); }
  };

  const saveStoreSection = async () => {
    setSavingStore(true);
    try {
      const { data } = await api.put(`${API.common.settings}/store`, {
        email, phone,
        freeDeliveryThreshold: Number(freeDelivery),
        deliveryCharge: Number(deliveryCharge),
      });
      if (data.success) { toast.success("Store settings saved!"); fetchSettings(); }
      else toast.error(data.message || "Failed to save store settings");
    } catch { toast.error("Failed to save store settings"); }
    finally { setSavingStore(false); }
  };

  const saveFooterSection = async () => {
    setSavingFooter(true);
    try {
      const { data } = await api.put(`${API.common.settings}/footer`, {
        contactEmail, contactAddress, copyrightText,
        socialLinks: { facebook, instagram, twitter, youtube },
      });
      if (data.success) { toast.success("Footer settings saved!"); fetchSettings(); }
      else toast.error(data.message || "Failed to save footer settings");
    } catch { toast.error("Failed to save footer settings"); }
    finally { setSavingFooter(false); }
  };

  const adminHelpBase = API.admin.help;

  const handleAddHelp = async () => {
    if (!newLabel.trim()) { toast.error("Label is required"); return; }
    setAddingHelp(true);
    try {
      const { data } = await api.post(adminHelpBase, { label: newLabel.trim(), content: newContent });
      if (data.success) {
        toast.success("Help page created!");
        setNewLabel(""); setNewContent(""); setShowAddForm(false);
        fetchHelpPages();
      } else toast.error(data.message || "Failed to create");
    } catch { toast.error("Failed to create help page"); }
    finally { setAddingHelp(false); }
  };

  const startEdit = (page: HelpPage) => {
    setEditingId(page._id);
    setEditLabel(page.label);
    setEditContent(page.content);
  };

  const cancelEdit = () => { setEditingId(null); setEditLabel(""); setEditContent(""); };

  const handleSaveEdit = async (id: string) => {
    if (!editLabel.trim()) { toast.error("Label is required"); return; }
    setSavingEdit(true);
    try {
      const { data } = await api.put(`${adminHelpBase}/${id}`, { label: editLabel.trim(), content: editContent });
      if (data.success) { toast.success("Help page updated!"); cancelEdit(); fetchHelpPages(); }
      else toast.error(data.message || "Failed to update");
    } catch { toast.error("Failed to update help page"); }
    finally { setSavingEdit(false); }
  };

  const handleDeleteHelp = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"?`)) return;
    try {
      const { data } = await api.delete(`${adminHelpBase}/${id}`);
      if (data.success) { toast.success("Deleted!"); fetchHelpPages(); }
      else toast.error(data.message || "Failed to delete");
    } catch { toast.error("Failed to delete help page"); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-col gap-6">

        {/* Brand & Logo */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">Brand & Logo</h2>
            <Button onClick={saveBrandSection} loading={savingBrand} size="sm">Save Brand</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4">
              <Input label="App Name" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="SG" />
              {logo && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Current Logo</p>
                  <img src={logo} alt="logo" className="h-12 object-contain border rounded-lg p-1 bg-gray-50" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Upload New Logo</p>
              <FileUpload onFiles={handleLogoUpload} multiple={false} uploading={uploading} accept="image/*" />
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">Store Settings</h2>
            <Button onClick={saveStoreSection} loading={savingStore} size="sm">Save Store</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Input label="Store Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourstore.com" />
            <Input label="Contact Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9999999999" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Free Delivery Threshold (₹)" type="number" value={freeDelivery} onChange={(e) => setFreeDelivery(e.target.value)} />
            <Input label="Default Delivery Charge (₹)" type="number" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">Footer</h2>
            <Button onClick={saveFooterSection} loading={savingFooter} size="sm">Save Footer</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-4">
              <Input label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="support@yourstore.com" />
              <Input label="Contact Address" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="123 Main St, City" />
              <Input label="Copyright Text" value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} placeholder="© 2025 SG. All rights reserved." />
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-gray-700">Social Links</p>
              <Input label="Facebook URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/..." />
              <Input label="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              <Input label="Twitter / X URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/..." />
              <Input label="YouTube URL" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>

        {/* Help Pages */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-lg">Help Pages</h2>
              <p className="text-xs text-gray-400 mt-0.5">These appear in the footer Help section and link to <code className="bg-gray-100 px-1 rounded">/shop/help/[slug]</code></p>
            </div>
            <Button size="sm" onClick={() => setShowAddForm((p) => !p)}>
              <Plus className="w-4 h-4 mr-1" /> Add Page
            </Button>
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="border border-dashed border-[#CF1432] rounded-xl p-4 mb-4 bg-red-50/30">
              <p className="text-sm font-semibold text-gray-700 mb-3">New Help Page</p>
              <div className="flex flex-col gap-3">
                <Input
                  label="Page Title / Label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Shipping Policy"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML allowed)</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={6}
                    placeholder="<p>Write your help page content here...</p>"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#CF1432] resize-y font-mono"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => { setShowAddForm(false); setNewLabel(""); setNewContent(""); }}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddHelp} loading={addingHelp}>
                    Create Page
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pages list */}
          {helpLoading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
          ) : helpPages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No help pages yet. Click &quot;Add Page&quot; to create one.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {helpPages.map((page) => (
                <div key={page._id} className="border border-gray-100 rounded-xl p-4">
                  {editingId === page._id ? (
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Title / Label"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#CF1432] resize-y font-mono"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
                        <button onClick={() => handleSaveEdit(page._id)} disabled={savingEdit}
                          className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-50">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{page.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">/shop/help/<span className="font-mono">{page.slug}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(page)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteHelp(page._id, page.label)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

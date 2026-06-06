"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { Product } from "@/types";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Dropdown } from "@/components/shared/Dropdown";
import { Modal } from "@/components/shared/Modal";
import { FileUpload } from "@/components/shared/FileUpload";
import { PageLoader, Badge, Empty, Pagination } from "@/components/shared/ui";
import { useUpload } from "@/hooks/use-upload";
import { formatCurrency, getProductImage, CATEGORIES, getSubCategories } from "@/lib/utils";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  title: "", description: "", shortDescription: "", category: "", subCategory: "",
  brand: "", sku: "", price: "", salePrice: "", totalStock: "", tags: "",
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaUrls, setMediaUrls] = useState<{ url: string; type: string; isPrimary: boolean }[]>([]);
  const [saving, setSaving] = useState(false);
  const { uploading, uploadMultiple } = useUpload();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) params.set("search", search);
      const { data } = await api.get(`${API.admin.products.list}?${params}`);
      if (data.success) { setProducts(data.data); setTotalPages(data.totalPages || 1); }
    } catch {/* silent */}
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => { setForm(EMPTY_FORM); setMediaUrls([]); setEditingId(null); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setForm({
      title: p.title, description: p.description, shortDescription: p.shortDescription,
      category: p.category, subCategory: p.subCategory, brand: p.brand, sku: p.sku || "",
      price: String(p.price), salePrice: String(p.salePrice), totalStock: String(p.totalStock),
      tags: p.tags?.join(", ") || "", isFeatured: p.isFeatured,
    });
    setMediaUrls(p.media || []);
    setEditingId(p._id);
    setModalOpen(true);
  };

  const handleFileUpload = async (files: File[]) => {
    const results = await uploadMultiple(files);
    setMediaUrls((prev) => [...prev, ...results.map((r: any, i: number) => ({ url: r.url, type: r.type, isPrimary: prev.length === 0 && i === 0 }))]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: parseFloat(form.salePrice) || 0,
        totalStock: parseInt(form.totalStock),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        media: mediaUrls,
      };
      const url = editingId ? API.admin.products.update(editingId) : API.admin.products.create;
      const method = editingId ? api.put : api.post;
      const { data } = await method(url, payload);
      if (data.success) {
        toast.success(editingId ? "Product updated!" : "Product created!");
        setModalOpen(false);
        fetchProducts();
      } else toast.error(data.message || "Failed");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { data } = await api.delete(API.admin.products.delete(id));
    if (data.success) { toast.success("Deleted!"); fetchProducts(); }
    else toast.error("Failed");
  };

  const handleToggle = async (id: string) => {
    const { data } = await api.patch(API.admin.products.toggle(id));
    if (data.success) { toast.success("Status updated!"); fetchProducts(); }
  };

  const setF = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <div className="flex justify-end mb-6 md:mb-8">
        <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>Add Product</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<Search className="w-4 h-4" />}
            className="max-w-sm"
          />
        </div>

        {loading ? <div className="p-10"><PageLoader /></div> : products.length === 0 ? (
          <Empty title="No products" description="Add your first product" action={<Button onClick={openCreate}>Add Product</Button>} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Price</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={getProductImage(p)} alt={p.title} className="w-10 h-12 object-cover rounded-lg bg-gray-100" />
                          <div>
                            <p className="font-medium text-sm line-clamp-1 max-w-[180px]">{p.title}</p>
                            {p.isFeatured && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Featured</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{p.category}</td>
                      <td className="px-5 py-3 text-sm font-medium">
                        {formatCurrency(p.salePrice > 0 ? p.salePrice : p.price)}
                        {p.salePrice > 0 && <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(p.price)}</span>}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span className={p.totalStock < 10 ? "text-orange-600 font-semibold" : "text-gray-600"}>{p.totalStock}</span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {p.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleToggle(p._id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600">
                            {p.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {products.map((p) => (
                <div key={p._id} className="flex items-center gap-3 px-4 py-3">
                  <img src={getProductImage(p)} alt={p.title} className="w-12 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-[#CF1432]">{formatCurrency(p.salePrice > 0 ? p.salePrice : p.price)}</span>
                      <Badge className={p.isActive ? "bg-green-100 text-green-700 text-[10px]" : "bg-red-100 text-red-700 text-[10px]"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className={`text-xs ${p.totalStock < 10 ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
                        Stock: {p.totalStock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleToggle(p._id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-600">
                      {p.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      {/* Product Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Product" : "Add Product"} size="full">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <Input label="Title*" value={form.title} onChange={setF("title")} placeholder="Product title" />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description*</label>
              <textarea value={form.description} onChange={setF("description")} rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CF1432]" />
            </div>
            <Input label="Short Description" value={form.shortDescription} onChange={setF("shortDescription")} />
            <Dropdown
              label="Category*"
              placeholder="Select category..."
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v, subCategory: "" }))}
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Sub Category
                {!form.category && <span className="text-gray-400 font-normal text-xs ml-1">(select category first)</span>}
              </label>
              <Dropdown
                placeholder="— None —"
                value={form.subCategory}
                onChange={(v) => setForm((f) => ({ ...f, subCategory: v }))}
                disabled={!form.category || getSubCategories(form.category).length === 0}
                options={[{ label: "— None —", value: "" }, ...getSubCategories(form.category).map((s) => ({ label: s, value: s }))]}
              />
            </div>
            <Input label="Brand" value={form.brand} onChange={setF("brand")} />
            <Input label="SKU" value={form.sku} onChange={setF("sku")} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (₹)*" type="number" value={form.price} onChange={setF("price")} />
              <Input label="Sale Price (₹)" type="number" value={form.salePrice} onChange={setF("salePrice")} />
            </div>
            <Input label="Stock*" type="number" value={form.totalStock} onChange={setF("totalStock")} />
            <Input label="Tags (comma-separated)" value={form.tags} onChange={setF("tags")} placeholder="cotton, summer, casual" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="accent-[#CF1432]" />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
            <FileUpload
              label="Product Images / Videos"
              onFiles={handleFileUpload}
              uploading={uploading}
              previews={mediaUrls.map((m) => m.url)}
              onRemovePreview={(i) => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button onClick={handleSave} loading={saving} className="flex-1">
            {editingId ? "Save Changes" : "Create Product"}
          </Button>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Upload,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  count?: number;
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories/admin/all');
      return res.data.data as Category[];
    },
  });

  const categories = data || [];

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setDescription('');
    setSortOrder('0');
    setImageFile(null);
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setShowForm(false);
  };

  const openCreate = () => {
    reset();
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setSortOrder(String(c.sortOrder ?? 0));
    setImageFile(null);
    setPreviewUrl(c.image || '');
    setShowForm(true);
  };

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters');
      }
      if (!editing && !imageFile) {
        throw new Error('Please upload a category image');
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      if (slug.trim()) formData.append('slug', slug.trim());
      formData.append('description', description.trim());
      formData.append('sortOrder', String(Number(sortOrder) || 0));
      formData.append('isActive', 'true');
      if (imageFile) formData.append('image', imageFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        return api.put(`/categories/${editing._id}`, formData, config);
      }
      return api.post('/categories', formData, config);
    },
    onSuccess: (res) => {
      const saved = res?.data?.data;
      toast.success(
        editing
          ? `Updated “${saved?.name || name}”`
          : `Saved “${saved?.name || name}” to database`,
      );
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onError: (err: any) =>
      toast.error(err?.message || err.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: async (c: Category) => {
      const fd = new FormData();
      fd.append('isActive', String(!c.isActive));
      return api.put(`/categories/${c._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B1E1E]"
        >
          <ArrowLeft size={14} /> Back to categories
        </button>
        <h1 className="font-display font-bold text-2xl text-charcoal">
          {editing ? 'Edit Category' : 'Add Category'}
        </h1>
        <form
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Slug (optional)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from name"
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Category image {editing ? '(upload to replace)' : ''}
            </label>
            <div className="mt-2 flex flex-col sm:flex-row gap-3 items-start">
              <div className="relative w-24 h-24 rounded-lg border border-dashed border-gray-200 bg-[#FAF7F2] overflow-hidden flex items-center justify-center shrink-0">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Category preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center gap-0.5 text-muted-foreground text-[10px]">
                    <ImageIcon size={16} />
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-[#3D1F1F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90">
                  <Upload size={12} />
                  {imageFile ? 'Change file' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-[10px] text-muted-foreground">
                  JPG / PNG / WEBP · max 5MB · saved to database
                </p>
                {imageFile && (
                  <p className="text-[10px] font-semibold text-charcoal truncate">{imageFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Sort order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
            />
          </div>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#3D1F1F] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Category'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display font-bold text-xl text-charcoal">Categories</h1>
          <p className="text-[12px] text-muted-foreground">
            {categories.length} in database · shown on storefront
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 bg-[#3D1F1F] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg"
        >
          <Plus size={12} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#8B1E1E]" size={22} />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-10 text-xs text-muted-foreground border border-dashed rounded-xl bg-white">
          No categories yet. Add one to store it in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {categories.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 flex items-center gap-2.5"
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={14} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-charcoal truncate">{c.name}</h3>
                  <span
                    className={
                      c.isActive
                        ? 'shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-green-50 text-green-700'
                        : 'shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500'
                    }
                  >
                    {c.isActive ? 'On' : 'Off'}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  {c.slug} · {c.count ?? 0} products
                </p>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(c)}
                  className="p-1.5 rounded-md hover:bg-gray-50 text-muted-foreground"
                  title={c.isActive ? 'Deactivate' : 'Activate'}
                >
                  {c.isActive ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="p-1.5 rounded-md hover:bg-gray-50 text-charcoal"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete category "${c.name}"?`)) deleteMutation.mutate(c._id);
                  }}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

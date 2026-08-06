"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Plus,
  Trash2,
  Loader2,
  X,
  Edit,
  ArrowLeft,
  Upload,
  Download,
  Search,
  Package,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ProductFormMode = 'create' | 'edit';
type VariantMode = 'choose' | 'simple' | 'variants';

type Category = {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
};

type WeightRow = {
  weight: string;
  price: string;
  mrp: string;
  stock: string;
  sku: string;
};

function totalStock(weights: { stock?: number }[] = []) {
  return weights.reduce((sum, w) => sum + (Number(w.stock) || 0), 0);
}

function emptyRow(): WeightRow {
  return { weight: '100g', price: '80', mrp: '100', stock: '100', sku: '' };
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
        </div>
      }
    >
      <AdminProductsInner />
    </Suspense>
  );
}

function AdminProductsInner() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [mode, setMode] = useState<ProductFormMode>('create');
  const [variantMode, setVariantMode] = useState<VariantMode>('choose');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [usageTips, setUsageTips] = useState('');
  const [benefits, setBenefits] = useState('');
  const [shelfLife, setShelfLife] = useState('');
  const [storageInstructions, setStorageInstructions] = useState('');
  const [tags, setTags] = useState('');
  const [badge, setBadge] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [variants, setVariants] = useState<WeightRow[]>([emptyRow()]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const splitLines = (text: string) =>
    text
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories/admin/all');
      return res.data.data as Category[];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(
    () => (catData || []).filter((c) => c.isActive !== false),
    [catData],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const res = await api.get('/products/admin/all?limit=200');
      return res.data;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const products = data?.data || [];

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch =
        !search ||
        String(p.name || '')
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchCat = !filterCat || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCat]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!category && categories.length) setCategory(categories[0].slug);
  }, [categories, category]);

  const resetForm = () => {
    setName('');
    setBrand('');
    setShortDescription('');
    setDescription('');
    setIngredients('');
    setUsageTips('');
    setBenefits('');
    setShelfLife('');
    setStorageInstructions('');
    setTags('');
    setBadge('');
    setIsFeatured(false);
    setSeoTitle('');
    setSeoDescription('');
    setCategory(categories[0]?.slug || '');
    setVariants([emptyRow()]);
    setSelectedFiles(null);
    setEditingId(null);
    setMode('create');
    setVariantMode('choose');
    setShowForm(false);
  };

  const openCreate = () => {
    setShowBulk(false);
    setName('');
    setBrand('');
    setShortDescription('');
    setDescription('');
    setIngredients('');
    setUsageTips('');
    setBenefits('');
    setShelfLife('');
    setStorageInstructions('');
    setTags('');
    setBadge('');
    setIsFeatured(false);
    setSeoTitle('');
    setSeoDescription('');
    setCategory(categories[0]?.slug || '');
    setVariants([emptyRow()]);
    setSelectedFiles(null);
    setEditingId(null);
    setMode('create');
    setVariantMode('choose');
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    const rows: WeightRow[] = (p.weights || []).map((w: any) => ({
      weight: w.weight || '100g',
      price: String(w.price ?? 0),
      mrp: String(w.mrp ?? w.price ?? 0),
      stock: String(w.stock ?? 0),
      sku: w.sku || '',
    }));
    setShowBulk(false);
    setMode('edit');
    setEditingId(p._id);
    setName(p.name || '');
    setBrand(p.brand || '');
    setShortDescription(p.shortDescription || '');
    setCategory(p.category || categories[0]?.slug || '');
    setDescription(p.description || '');
    setIngredients(Array.isArray(p.ingredients) ? p.ingredients.join(', ') : p.ingredients || '');
    setUsageTips(Array.isArray(p.usageTips) ? p.usageTips.join('\n') : p.usageTips || '');
    setBenefits(Array.isArray(p.benefits) ? p.benefits.join('\n') : p.benefits || '');
    setShelfLife(p.shelfLife || '');
    setStorageInstructions(p.storageInstructions || '');
    setTags(Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '');
    setBadge(p.badge || '');
    setIsFeatured(Boolean(p.isFeatured));
    setSeoTitle(p.seo?.title || '');
    setSeoDescription(p.seo?.description || '');
    setVariants(rows.length ? rows : [emptyRow()]);
    setVariantMode(rows.length > 1 ? 'variants' : 'simple');
    setSelectedFiles(null);
    setShowForm(true);
  };

  const updateRow = (index: number, key: keyof WeightRow, value: string) => {
    setVariants((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => setVariants((prev) => [...prev, emptyRow()]);
  const removeRow = (index: number) =>
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (mode === 'edit' && editingId) {
        const res = await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
      }
      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(mode === 'edit' ? 'Product updated' : 'Product created');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      queryClient.invalidateQueries({ queryKey: ['trending-products'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save product');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (variantMode === 'choose') {
      toast.error('Choose product type: without variant or with variants');
      return;
    }
    if (!name || !description) {
      toast.error('Please fill in name and description');
      return;
    }
    if (!category) {
      toast.error('Select a category');
      return;
    }
    if (mode === 'create' && (!selectedFiles || selectedFiles.length === 0)) {
      toast.error('Please upload at least one image for a new product');
      return;
    }

    const rows = variantMode === 'simple' ? [variants[0]] : variants;
    for (const row of rows) {
      if (!row.weight.trim()) {
        toast.error('Each variant needs a weight / pack size');
        return;
      }
      if (Number(row.price) < 0 || Number(row.mrp) < 0 || Number(row.stock) < 0) {
        toast.error('Price, MRP and stock must be valid numbers');
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('brand', brand.trim());
    formData.append('shortDescription', shortDescription.trim());
    formData.append('description', description);
    formData.append('shelfLife', shelfLife.trim());
    formData.append('storageInstructions', storageInstructions.trim());
    formData.append('ingredients', JSON.stringify(splitLines(ingredients)));
    formData.append('usageTips', JSON.stringify(splitLines(usageTips)));
    formData.append('benefits', JSON.stringify(splitLines(benefits)));
    formData.append('tags', JSON.stringify(splitLines(tags)));
    if (badge) formData.append('badge', badge);
    formData.append('isFeatured', isFeatured ? 'true' : 'false');
    formData.append('isActive', 'true');
    formData.append(
      'seo',
      JSON.stringify({
        title: seoTitle.trim() || undefined,
        description: seoDescription.trim() || undefined,
        keywords: splitLines(tags),
      }),
    );
    formData.append(
      'weights',
      JSON.stringify(
        rows.map((row) => ({
          weight: row.weight.trim(),
          price: Number(row.price),
          mrp: Number(row.mrp),
          stock: Number(row.stock),
          ...(row.sku.trim() ? { sku: row.sku.trim() } : {}),
        })),
      ),
    );

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    saveMutation.mutate(formData);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deactivated');
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      queryClient.invalidateQueries({ queryKey: ['trending-products'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
    onError: () => toast.error('Failed to deactivate product'),
  });

  const bulkMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/products/bulk', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (res) => {
      const created = res?.data?.createdCount ?? 0;
      const errs = res?.data?.errors?.length ?? 0;
      toast.success(`Imported ${created} product(s)${errs ? ` · ${errs} row error(s)` : ''}`);
      setBulkFile(null);
      setShowBulk(false);
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      queryClient.invalidateQueries({ queryKey: ['trending-products'] });
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Bulk import failed'),
  });

  const downloadTemplate = () => {
    const header = 'name,category,description,weight,price,mrp,stock,image,ingredients,tags\n';
    const sampleCat = categories[0]?.slug || 'blended-masalas';
    const sample = `Sample Masala,${sampleCat},Authentic blend for everyday cooking,100g,99,120,50,,Coriander;Cumin,bestseller\n`;
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nirmal-products-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name || slug.replace(/-/g, ' ');

  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B1E1E]"
        >
          <ArrowLeft size={14} /> Back to products
        </button>
        <h1 className="font-display font-bold text-2xl text-charcoal">
          {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
        </h1>

        {mode === 'create' && variantMode === 'choose' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setVariantMode('simple');
                setVariants([emptyRow()]);
              }}
              className="text-left bg-white border border-gray-100 hover:border-[#8B1E1E]/40 rounded-2xl p-5 shadow-sm space-y-2"
            >
              <Package className="text-[#8B1E1E]" size={22} />
              <div className="font-bold text-charcoal">Add without variant</div>
              <p className="text-xs text-muted-foreground">
                Single pack size, price and stock — stored as one product record.
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setVariantMode('variants');
                setVariants([emptyRow(), { ...emptyRow(), weight: '250g', price: '180', mrp: '220' }]);
              }}
              className="text-left bg-white border border-gray-100 hover:border-[#8B1E1E]/40 rounded-2xl p-5 shadow-sm space-y-2"
            >
              <Layers className="text-[#8B1E1E]" size={22} />
              <div className="font-bold text-charcoal">Add with variants</div>
              <p className="text-xs text-muted-foreground">
                Multiple pack sizes (e.g. 100g / 250g / 500g) with separate price & stock.
              </p>
            </button>
          </div>
        )}

        {(variantMode === 'simple' || variantMode === 'variants') && (
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5 text-xs text-charcoal"
          >
            {mode === 'create' && (
              <div className="flex items-center justify-between bg-[#FAF7F2] rounded-xl px-3 py-2">
                <span className="font-semibold">
                  Mode: {variantMode === 'simple' ? 'Without variant' : 'With variants'}
                </span>
                <button
                  type="button"
                  onClick={() => setVariantMode('choose')}
                  className="text-[#8B1E1E] font-bold uppercase tracking-wider text-[10px]"
                >
                  Change
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  {categories.length === 0 && <option value="">No categories — create one first</option>}
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Nirmal's Spices"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Badge
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  <option value="">None</option>
                  <option value="bestseller">Best Seller</option>
                  <option value="new">New</option>
                  <option value="sale">Sale</option>
                  <option value="organic">Organic</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Short Description
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Shown under product name on the product page"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Full Description *
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description tab on the product page"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Ingredients
                </label>
                <textarea
                  rows={2}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Comma-separated, e.g. Milk solids, Sugar, Cardamom"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Usage Tips
                </label>
                <textarea
                  rows={3}
                  value={usageTips}
                  onChange={(e) => setUsageTips(e.target.value)}
                  placeholder="How to use — one tip per line or comma-separated"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Nutritional Notes / Benefits
                </label>
                <textarea
                  rows={2}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Shown under Description tab"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Shelf Life
                </label>
                <input
                  type="text"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  placeholder="e.g. 12 months from manufacture"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Storage Instructions
                </label>
                <textarea
                  rows={2}
                  value={storageInstructions}
                  onChange={(e) => setStorageInstructions(e.target.value)}
                  placeholder="e.g. Store in a cool, dry place away from sunlight"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Optional — defaults to product name"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 justify-end">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none py-2.5">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                    Featured on homepage
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  SEO Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Optional meta description for search engines"
                  className="bg-gray-50 border border-gray-200 focus:border-[#8B1E1E] rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
                />
              </div>

              <div className="sm:col-span-2 border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                    {variantMode === 'simple' ? 'Pack · Price · Stock' : 'Variants (weight / pack)'}
                  </h3>
                  {variantMode === 'variants' && (
                    <button
                      type="button"
                      onClick={addRow}
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8B1E1E]"
                    >
                      <Plus size={12} /> Add variant
                    </button>
                  )}
                </div>

                {variants.map((row, index) => {
                  if (variantMode === 'simple' && index > 0) return null;
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50/80 border border-gray-100 rounded-xl p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-muted-foreground text-[10px]">
                          {variantMode === 'simple' ? 'Pack size' : 'Weight'}
                        </label>
                        <input
                          type="text"
                          required
                          value={row.weight}
                          onChange={(e) => updateRow(index, 'weight', e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none"
                          placeholder="100g"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-muted-foreground text-[10px]">Price (₹)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={row.price}
                          onChange={(e) => updateRow(index, 'price', e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-muted-foreground text-[10px]">MRP (₹)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={row.mrp}
                          onChange={(e) => updateRow(index, 'mrp', e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-muted-foreground text-[10px]">Stock</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={row.stock}
                          onChange={(e) => updateRow(index, 'stock', e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-muted-foreground text-[10px]">SKU</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={row.sku}
                            onChange={(e) => updateRow(index, 'sku', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-sm outline-none w-full"
                          />
                          {variantMode === 'variants' && variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="p-2 text-red-600"
                              aria-label="Remove variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5 border-t border-gray-100 pt-4">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  {mode === 'edit' ? 'Additional Images (optional)' : 'Product Images (max 5)'}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  required={mode === 'create'}
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[#3D1F1F]/10 file:text-[#3D1F1F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-[#3D1F1F] text-white font-bold uppercase tracking-wider text-xs py-3 px-8 rounded-xl inline-flex items-center gap-2 disabled:opacity-50"
              >
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'edit' ? 'Save Changes' : 'Publish Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (showBulk) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => setShowBulk(false)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B1E1E]"
        >
          <ArrowLeft size={14} /> Back to products
        </button>
        <h1 className="font-display font-bold text-2xl text-charcoal">Bulk Add Products</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B1E1E] hover:underline"
          >
            <Download size={14} /> Download CSV template
          </button>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-8 text-sm"
          />
          <button
            type="button"
            disabled={!bulkFile || bulkMutation.isPending}
            onClick={() => bulkFile && bulkMutation.mutate(bulkFile)}
            className="bg-[#3D1F1F] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl disabled:opacity-50 inline-flex items-center gap-2"
          >
            {bulkMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
            Import Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Products</h1>
          <p className="text-[13px] text-muted-foreground">Manage your product listings and inventory.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowBulk(true)}
            className="inline-flex items-center gap-2 border border-[#3D1F1F]/20 text-[#3D1F1F] text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-[#3D1F1F]/5"
          >
            <Upload size={14} /> Bulk Add
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-[#3D1F1F] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl"
          >
            <Plus size={14} /> Add New Product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-muted-foreground text-xs">Failed to load products.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-xs">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-gray-100 font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p: any) => {
                  const stockQty = totalStock(p.weights);
                  const variantCount = p.weights?.length || 0;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100" />
                          )}
                          <div>
                            <div className="font-bold text-charcoal">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              ID: {String(p._id).slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize">{categoryLabel(p.category)}</td>
                      <td className="p-4">
                        {variantCount <= 1 ? (
                          <span className="text-muted-foreground">Single · ₹{p.weights?.[0]?.price ?? '—'}</span>
                        ) : (
                          <span className="font-semibold">{variantCount} variants</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full',
                            stockQty <= 0
                              ? 'bg-red-50 text-red-600'
                              : stockQty < 15
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-green-50 text-green-700',
                          )}
                        >
                          {stockQty} Units
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEdit(p)} className="text-muted-foreground hover:text-[#8B1E1E] p-1">
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Deactivate this product?')) deleteMutation.mutate(p._id);
                            }}
                            className="text-muted-foreground hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

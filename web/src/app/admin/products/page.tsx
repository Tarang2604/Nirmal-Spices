"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Loader2, 
  X,
  FileSpreadsheet,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('blend-spices');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('100g');
  const [price, setPrice] = useState('80');
  const [mrp, setMrp] = useState('100');
  const [stock, setStock] = useState('100');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Query products list
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const res = await api.get('/products?limit=100');
      return res.data;
    },
  });

  const products = data?.data || [];

  // Create product mutation (Multipart/Form data)
  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      setShowAddForm(false);
      setName('');
      setDescription('');
      setSelectedFiles(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create product");
    }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !selectedFiles || selectedFiles.length === 0) {
      toast.error("Please fill in all required fields and upload at least one image");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);

    // Create the weights variant array payload
    const weightsArr = [
      {
        weight,
        price: Number(price),
        mrp: Number(mrp),
        stock: Number(stock)
      }
    ];
    formData.append('weights', JSON.stringify(weightsArr));

    // Append image files
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    addMutation.mutate(formData);
  };

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
    },
    onError: () => {
      toast.error("Failed to delete product");
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? All Cloudinary images will be wiped too.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Manage Products</h1>
          <p className="text-muted-foreground text-xs mt-1">Upload and adjust your spice catalog items.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors outline-none"
          >
            <Plus size={12} /> Add Product
          </button>
        )}
      </div>

      {/* Grid of items list */}
      {!showAddForm && (
        <div className="bg-white rounded-2xl border border-border-spice/40 overflow-hidden shadow-sm">
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : error ? (
            <div className="text-center p-8 text-muted-foreground text-xs">Failed to load product list.</div>
          ) : products.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground text-xs">No products in database. Add one to start.</div>
          ) : (
            /* Table list */
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-cream/45 border-b border-border-spice/55 font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Variants</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-spice/45">
                  {products.map((p: any) => (
                    <tr key={p._id} className="hover:bg-cream-dark/5">
                      <td className="p-4 font-bold text-charcoal">{p.name}</td>
                      <td className="p-4 capitalize">{p.category.replace('-', ' ')}</td>
                      <td className="p-4">
                        {p.weights.map((w: any) => (
                          <span key={w.weight} className="inline-block bg-cream border px-2 py-0.5 rounded-full mr-1 text-[10px]">
                            {w.weight} (₹{w.price}) - qty: {w.stock}
                          </span>
                        ))}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-5 text-xs text-charcoal">
          
          <div className="flex justify-between items-center border-b border-border-spice pb-3">
            <h2 className="font-display font-bold text-lg">Add New Product</h2>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-muted-foreground hover:text-charcoal outline-none"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Product Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Product Name</label>
              <input
                type="text"
                required
                placeholder="E.g. Pure Garam Masala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="blend-spices">Blended Masalas</option>
                <option value="ground-spices">Ground Spices</option>
                <option value="whole-spices">Whole Spices</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Description</label>
              <textarea
                rows={4}
                required
                placeholder="Write about ingredients, processing, aroma, benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none resize-y"
              />
            </div>

            {/* Default variant specifications */}
            <div className="sm:col-span-2 border-t border-border-spice/40 pt-4 mt-2">
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] mb-3">Default Weight Variant details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-muted-foreground">Weight Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="100g"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-muted-foreground">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="80"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-muted-foreground">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-muted-foreground">Stock Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Images upload selection */}
            <div className="sm:col-span-2 flex flex-col gap-1.5 border-t border-border-spice/40 pt-4 mt-2">
              <label className="font-bold text-muted-foreground">Upload Product Images (Max 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                required
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-secondary file:text-primary file:cursor-pointer"
              />
            </div>

          </div>

          <div className="flex justify-between items-center border-t border-border-spice/40 pt-4 mt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-muted-foreground font-semibold flex items-center gap-1 outline-none hover:underline"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3 px-8 rounded-xl flex items-center justify-center gap-1.5 outline-none disabled:opacity-50"
            >
              {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Product
            </button>
          </div>

        </form>
      )}

    </div>
  );
}

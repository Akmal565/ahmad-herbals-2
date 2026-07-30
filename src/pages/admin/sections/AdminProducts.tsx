import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { formatPKR, getFirstImage } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import FormField, { TextInput, TextArea, SelectInput, ToggleInput } from '../../../components/admin/FormField';
import ImageUpload from '../../../components/admin/ImageUpload';
import type { Product, Category } from '../../../types';

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', sku: '', description: '', short_description: '', category_id: '', price: '', sale_price: '', weight: '', stock: '', is_active: true, is_featured: false, is_bestseller: false, is_new_arrival: false, is_flash_sale: false, ingredients: '', benefits: '', how_to_use: '', meta_title: '', meta_description: '' });
  const [imageUrl, setImageUrl] = useState('');

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), product_images(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', sku: '', description: '', short_description: '', category_id: categories[0]?.id || '', price: '', sale_price: '', weight: '', stock: '', is_active: true, is_featured: false, is_bestseller: false, is_new_arrival: false, is_flash_sale: false, ingredients: '', benefits: '', how_to_use: '', meta_title: '', meta_description: '' }); setImageUrl(''); setModalOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setForm({ name: product.name, slug: product.slug, sku: product.sku, description: product.description, short_description: product.short_description, category_id: product.category_id, price: String(product.price), sale_price: String(product.sale_price), weight: product.weight, stock: String(product.stock), is_active: product.is_active, is_featured: product.is_featured, is_bestseller: product.is_bestseller, is_new_arrival: product.is_new_arrival, is_flash_sale: product.is_flash_sale, ingredients: product.ingredients, benefits: product.benefits, how_to_use: product.how_to_use, meta_title: product.meta_title, meta_description: product.meta_description }); setImageUrl(getFirstImage(product)); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category_id) { toast('Please fill required fields', 'error'); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = { name: form.name, slug, sku: form.sku || `PKV-${Date.now()}`, description: form.description, short_description: form.short_description, category_id: form.category_id, price: parseFloat(form.price) || 0, sale_price: parseFloat(form.sale_price) || 0, weight: form.weight, stock: parseInt(form.stock) || 0, is_active: form.is_active, is_featured: form.is_featured, is_bestseller: form.is_bestseller, is_new_arrival: form.is_new_arrival, is_flash_sale: form.is_flash_sale, ingredients: form.ingredients, benefits: form.benefits, how_to_use: form.how_to_use, meta_title: form.meta_title, meta_description: form.meta_description };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); setSaving(false); return; }
      if (imageUrl) { const existing = editing.product_images?.[0]; if (existing) { await supabase.from('product_images').update({ image_url: imageUrl }).eq('id', existing.id); } else { await supabase.from('product_images').insert({ product_id: editing.id, image_url: imageUrl, alt_text: form.name }); } }
      toast('Product updated successfully');
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) { toast(error.message, 'error'); setSaving(false); return; }
      if (imageUrl) { await supabase.from('product_images').insert({ product_id: data.id, image_url: imageUrl, alt_text: form.name }); }
      toast('Product created successfully');
    }
    setSaving(false); setModalOpen(false); fetchData();
  };

  const handleDelete = async () => { if (!deleteId) return; await supabase.from('product_images').delete().eq('product_id', deleteId); const { error } = await supabase.from('products').delete().eq('id', deleteId); if (error) { toast(error.message, 'error'); return; } toast('Product deleted'); fetchData(); };

  const filtered = products.filter(p => (filterCat === 'all' || p.category_id === filterCat) && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search products..." /></div><div className="flex items-center gap-3 ml-4"><select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="all">All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"><Plus size={18} /> Add Product</button></div></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No products found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{filtered.map(product => (<tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={getFirstImage(product)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /><div className="min-w-0"><p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p><p className="text-xs text-gray-400">{product.sku}</p></div></div></td><td className="px-4 py-3 text-gray-600">{product.category?.name || '-'}</td><td className="px-4 py-3"><span className="font-semibold text-primary-700">{formatPKR(product.sale_price || product.price)}</span>{product.sale_price > 0 && <span className="text-xs text-gray-400 line-through block">{formatPKR(product.price)}</span>}</td><td className="px-4 py-3"><span className={`font-semibold ${product.stock < 10 ? 'text-accent-600' : product.stock < 20 ? 'text-amber-600' : 'text-gray-700'}`}>{product.stock}</span></td><td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${product.is_active ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-500'}`}>{product.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Link to={`/product/${product.slug}`} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Eye size={16} /></Link><button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(product.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table></div>
      )}</div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4"><FormField label="Product Name" required><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: f.slug || slugify(v) }))} placeholder="Multi Grain Atta - 5kg" /></FormField><FormField label="SKU"><TextInput value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} placeholder="PKV-MGF-001" /></FormField></div>
          <div className="grid sm:grid-cols-3 gap-4"><FormField label="Price (Rs.)" required><TextInput value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="850" type="number" /></FormField><FormField label="Sale Price (Rs.)"><TextInput value={form.sale_price} onChange={v => setForm(f => ({ ...f, sale_price: v }))} placeholder="720" type="number" /></FormField><FormField label="Stock" required><TextInput value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} placeholder="150" type="number" /></FormField></div>
          <div className="grid sm:grid-cols-2 gap-4"><FormField label="Category" required><SelectInput value={form.category_id} onChange={v => setForm(f => ({ ...f, category_id: v }))} options={categories.map(c => ({ value: c.id, label: c.name }))} /></FormField><FormField label="Weight"><TextInput value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} placeholder="5 kg" /></FormField></div>
          <ImageUpload label="Product Image" value={imageUrl} onChange={setImageUrl} folder="products" hint="Upload an image from your device, or paste a URL" />
          <FormField label="Short Description"><TextInput value={form.short_description} onChange={v => setForm(f => ({ ...f, short_description: v }))} /></FormField>
          <FormField label="Full Description"><TextArea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} /></FormField>
          <div className="grid sm:grid-cols-3 gap-4"><FormField label="Ingredients"><TextArea value={form.ingredients} onChange={v => setForm(f => ({ ...f, ingredients: v }))} rows={2} /></FormField><FormField label="Benefits"><TextArea value={form.benefits} onChange={v => setForm(f => ({ ...f, benefits: v }))} rows={2} /></FormField><FormField label="How to Use"><TextArea value={form.how_to_use} onChange={v => setForm(f => ({ ...f, how_to_use: v }))} rows={2} /></FormField></div>
          <div className="grid sm:grid-cols-2 gap-4"><FormField label="Meta Title"><TextInput value={form.meta_title} onChange={v => setForm(f => ({ ...f, meta_title: v }))} /></FormField><FormField label="Meta Description"><TextInput value={form.meta_description} onChange={v => setForm(f => ({ ...f, meta_description: v }))} /></FormField></div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl"><ToggleInput checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active" /><ToggleInput checked={form.is_featured} onChange={v => setForm(f => ({ ...f, is_featured: v }))} label="Featured" /><ToggleInput checked={form.is_bestseller} onChange={v => setForm(f => ({ ...f, is_bestseller: v }))} label="Best Seller" /><ToggleInput checked={form.is_new_arrival} onChange={v => setForm(f => ({ ...f, is_new_arrival: v }))} label="New Arrival" /><ToggleInput checked={form.is_flash_sale} onChange={v => setForm(f => ({ ...f, is_flash_sale: v }))} label="Flash Sale" /></div>
          <div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}</button></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone." />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/admin/Toast';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import FormField, { TextInput, TextArea, ToggleInput } from '../../../components/admin/FormField';
import ImageUpload from '../../../components/admin/ImageUpload';
import type { Category } from '../../../types';

export default function AdminCategories() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', icon_name: '', sort_order: '0', is_active: true });

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const fetch = async () => { setLoading(true); const { data } = await supabase.from('categories').select('*').order('sort_order'); if (data) setCategories(data as Category[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', description: '', image_url: '', icon_name: '', sort_order: '0', is_active: true }); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description, image_url: cat.image_url, icon_name: cat.icon_name, sort_order: String(cat.sort_order), is_active: cat.is_active }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast('Name is required', 'error'); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.name);
    const payload = { name: form.name, slug, description: form.description, image_url: form.image_url, icon_name: form.icon_name, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active };
    if (editing) { const { error } = await supabase.from('categories').update(payload).eq('id', editing.id); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Category updated'); }
    else { const { error } = await supabase.from('categories').insert(payload); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Category created'); }
    setSaving(false); setModalOpen(false); fetch();
  };
  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('categories').delete().eq('id', deleteId); if (error) { toast(error.message, 'error'); return; } toast('Category deleted'); fetch(); };

  const filtered = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search categories..." /></div><button onClick={openCreate} className="ml-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Plus size={18} /> Add Category</button></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No categories found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Image</th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Slug</th><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{filtered.map(cat => (<tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><img src={cat.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /></td><td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td><td className="px-4 py-3 text-gray-500 text-xs">{cat.slug}</td><td className="px-4 py-3 text-gray-600">{cat.sort_order}</td><td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cat.is_active ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-500'}`}>{cat.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(cat.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table></div>
      )}</div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4"><FormField label="Name" required><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: f.slug || slugify(v) }))} /></FormField><FormField label="Slug"><TextInput value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} /></FormField><FormField label="Description"><TextArea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} /></FormField><ImageUpload label="Category Image" value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} folder="categories" /><div className="grid grid-cols-2 gap-4"><FormField label="Icon Name"><TextInput value={form.icon_name} onChange={v => setForm(f => ({ ...f, icon_name: v }))} placeholder="Wheat" /></FormField><FormField label="Sort Order"><TextInput value={form.sort_order} onChange={v => setForm(f => ({ ...f, sort_order: v }))} type="number" /></FormField></div><ToggleInput checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active" /><div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></div></div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Category" message="Are you sure? Products in this category will lose their category reference." />
    </div>
  );
}

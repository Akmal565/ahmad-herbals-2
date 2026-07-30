import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Tag as TagIcon, FolderTree } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/admin/Toast';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import FormField, { TextInput, TextArea } from '../../../components/admin/FormField';
import type { BlogCategory, BlogTag } from '../../../types';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function AdminBlogCategories() {
  const toast = useToast();
  const { logActivity } = useAuth();
  const [tab, setTab] = useState<'categories' | 'tags'>('categories');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogCategory | BlogTag | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const [catRes, tagRes] = await Promise.all([
      supabase.from('blog_categories').select('*').order('name'),
      supabase.from('blog_tags').select('*').order('name'),
    ]);
    if (catRes.data) setCategories(catRes.data as BlogCategory[]);
    if (tagRes.data) setTags(tagRes.data as BlogTag[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', description: '' }); setModalOpen(true); };
  const openEdit = (item: BlogCategory | BlogTag) => { setEditing(item); setForm({ name: item.name, slug: item.slug, description: (item as BlogCategory).description || '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast('Name is required', 'error'); return; }
    const slug = form.slug || slugify(form.name);
    const table = tab === 'categories' ? 'blog_categories' : 'blog_tags';
    const payload: Record<string, string> = tab === 'categories' ? { name: form.name, slug, description: form.description } : { name: form.name, slug };
    if (editing) {
      const { error } = await supabase.from(table).update(payload).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); return; }
      await logActivity('update', tab === 'categories' ? 'blog_category' : 'blog_tag', editing.id, { name: form.name });
      toast(`${tab === 'categories' ? 'Category' : 'Tag'} updated`);
    } else {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) { toast(error.message, 'error'); return; }
      await logActivity('create', tab === 'categories' ? 'blog_category' : 'blog_tag', data.id, { name: form.name });
      toast(`${tab === 'categories' ? 'Category' : 'Tag'} created`);
    }
    setModalOpen(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const table = tab === 'categories' ? 'blog_categories' : 'blog_tags';
    const { error } = await supabase.from(table).delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    await logActivity('delete', tab === 'categories' ? 'blog_category' : 'blog_tag', deleteId);
    toast(`${tab === 'categories' ? 'Category' : 'Tag'} deleted`); fetch();
  };

  const items = tab === 'categories' ? categories : tags;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setTab('categories')} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === 'categories' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}><FolderTree size={18} /> Categories ({categories.length})</button>
          <button onClick={() => setTab('tags')} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === 'tags' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}><TagIcon size={18} /> Tags ({tags.length})</button>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Plus size={18} /> Add {tab === 'categories' ? 'Category' : 'Tag'}</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : items.length === 0 ? (
          <div className="p-12 text-center"><p className="text-gray-400">No {tab} found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                {tab === 'categories' && <th className="px-4 py-3 font-medium">Description</th>}
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.slug}</td>
                    {tab === 'categories' && <td className="px-4 py-3 text-gray-600 text-xs max-w-[300px] truncate">{(item as BlogCategory).description || '-'}</td>}
                    <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(item.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${editing ? 'Edit' : 'Add'} ${tab === 'categories' ? 'Category' : 'Tag'}`}>
        <div className="space-y-4">
          <FormField label="Name" required><TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: f.slug || slugify(v) }))} /></FormField>
          <FormField label="Slug"><TextInput value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} /></FormField>
          {tab === 'categories' && <FormField label="Description"><TextArea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} rows={3} /></FormField>}
          <div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700">{editing ? 'Update' : 'Create'}</button></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title={`Delete ${tab === 'categories' ? 'Category' : 'Tag'}`} message={`Are you sure you want to delete this ${tab === 'categories' ? 'category' : 'tag'}?`} />
    </div>
  );
}

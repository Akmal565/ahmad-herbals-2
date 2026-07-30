import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, FileText, Globe, FileQuestion } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import FormField, { TextInput, TextArea, SelectInput, ToggleInput } from '../../../components/admin/FormField';
import type { Page } from '../../../types';

export default function AdminPages() {
  const toast = useToast();
  const { user, logActivity } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', content: '', excerpt: '', featured_image: '', status: 'draft', show_in_menu: false, sort_order: '0', meta_title: '', meta_description: '' });

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('pages').select('*').order('created_at', { ascending: false });
    if (search) query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
    const { data } = await query;
    if (data) setPages(data as Page[]);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setForm({ title: '', slug: '', content: '', excerpt: '', featured_image: '', status: 'draft', show_in_menu: false, sort_order: '0', meta_title: '', meta_description: '' }); setModalOpen(true); };
  const openEdit = (p: Page) => { setEditing(p); setForm({ title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt, featured_image: p.featured_image, status: p.status, show_in_menu: p.show_in_menu, sort_order: String(p.sort_order), meta_title: p.meta_title, meta_description: p.meta_description }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title) { toast('Title is required', 'error'); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    const payload = { title: form.title, slug, content: form.content, excerpt: form.excerpt, featured_image: form.featured_image, status: form.status, show_in_menu: form.show_in_menu, sort_order: parseInt(form.sort_order) || 0, meta_title: form.meta_title, meta_description: form.meta_description, updated_by: user?.id, updated_at: new Date().toISOString() };
    if (editing) {
      const { error } = await supabase.from('pages').update(payload).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); setSaving(false); return; }
      await logActivity('update', 'page', editing.id, { title: form.title });
      toast('Page updated');
    } else {
      const { data, error } = await supabase.from('pages').insert({ ...payload, created_by: user?.id }).select().single();
      if (error) { toast(error.message, 'error'); setSaving(false); return; }
      await logActivity('create', 'page', data.id, { title: form.title });
      toast('Page created');
    }
    setSaving(false); setModalOpen(false); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const page = pages.find(p => p.id === deleteId);
    const { error } = await supabase.from('pages').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    await logActivity('delete', 'page', deleteId, { title: page?.title });
    toast('Page deleted'); fetch();
  };

  const togglePublish = async (p: Page) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('pages').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', p.id);
    if (error) { toast(error.message, 'error'); return; }
    await logActivity('update', 'page', p.id, { status: newStatus });
    toast(`Page ${newStatus === 'published' ? 'published' : 'unpublished'}`);
    fetch();
  };

  const filtered = pages.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search pages..." /></div>
        <button onClick={openCreate} className="ml-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Plus size={18} /> Add Page</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Loading pages...</div> : filtered.length === 0 ? (
          <div className="p-12 text-center"><FileText className="text-gray-300 mx-auto mb-3" size={36} /><p className="text-gray-400">No pages found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Menu</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2">{p.status === 'published' ? <Globe size={16} className="text-secondary-600" /> : <FileQuestion size={16} className="text-gray-400" />}<p className="font-medium text-gray-900">{p.title}</p></div></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">/{p.slug}</td>
                    <td className="px-4 py-3"><button onClick={() => togglePublish(p)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.status === 'published' ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</button></td>
                    <td className="px-4 py-3">{p.show_in_menu ? <span className="text-xs text-secondary-600 font-medium">Yes</span> : <span className="text-xs text-gray-400">No</span>}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(p.updated_at)}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><a href={`/${p.slug}`} target="_blank" rel="noopener" className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Eye size={16} /></a><button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Page' : 'Add Page'} size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Title" required><TextInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v, slug: f.slug || slugify(v) }))} placeholder="About Us" /></FormField>
            <FormField label="Slug" required><TextInput value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} placeholder="about-us" /></FormField>
          </div>
          <FormField label="Featured Image URL"><TextInput value={form.featured_image} onChange={v => setForm(f => ({ ...f, featured_image: v }))} placeholder="https://..." /></FormField>
          {form.featured_image && <div className="aspect-video rounded-lg overflow-hidden bg-gray-50 border border-gray-200"><img src={form.featured_image} alt="Preview" className="w-full h-full object-cover" /></div>}
          <FormField label="Excerpt"><TextArea value={form.excerpt} onChange={v => setForm(f => ({ ...f, excerpt: v }))} rows={2} /></FormField>
          <FormField label="Content" hint="Write page content here"><TextArea value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} rows={8} /></FormField>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormField label="Status"><SelectInput value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} /></FormField>
            <FormField label="Sort Order"><TextInput value={form.sort_order} onChange={v => setForm(f => ({ ...f, sort_order: v }))} type="number" /></FormField>
            <div className="flex items-end pb-1"><ToggleInput checked={form.show_in_menu} onChange={v => setForm(f => ({ ...f, show_in_menu: v }))} label="Show in Menu" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Meta Title"><TextInput value={form.meta_title} onChange={v => setForm(f => ({ ...f, meta_title: v }))} /></FormField>
            <FormField label="Meta Description"><TextInput value={form.meta_description} onChange={v => setForm(f => ({ ...f, meta_description: v }))} /></FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Page' : 'Create Page'}</button></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Page" message="Are you sure you want to delete this page? This cannot be undone." />
    </div>
  );
}

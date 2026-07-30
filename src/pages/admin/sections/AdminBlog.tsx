import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import FormField, { TextInput, TextArea, ToggleInput } from '../../../components/admin/FormField';
import ImageUpload from '../../../components/admin/ImageUpload';
import type { BlogPost } from '../../../types';

export default function AdminBlog() {
  const toast = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', image_url: '', author: 'Ahmad Herbals', category: '', tags: '', is_published: true, meta_title: '', meta_description: '' });

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const fetch = async () => { setLoading(true); const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }); if (data) setPosts(data as BlogPost[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', slug: '', excerpt: '', content: '', image_url: '', author: 'Ahmad Herbals', category: '', tags: '', is_published: true, meta_title: '', meta_description: '' }); setModalOpen(true); };
  const openEdit = (p: BlogPost) => { setEditing(p); setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, image_url: p.image_url, author: p.author, category: p.category, tags: p.tags, is_published: p.is_published, meta_title: p.meta_title, meta_description: p.meta_description }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast('Title and content required', 'error'); return; }
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    const payload = { title: form.title, slug, excerpt: form.excerpt, content: form.content, image_url: form.image_url, author: form.author, category: form.category, tags: form.tags, is_published: form.is_published, meta_title: form.meta_title, meta_description: form.meta_description };
    if (editing) { const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Post updated'); }
    else { const { error } = await supabase.from('blog_posts').insert(payload); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Post created'); }
    setSaving(false); setModalOpen(false); fetch();
  };
  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('blog_posts').delete().eq('id', deleteId); if (error) { toast(error.message, 'error'); return; } toast('Post deleted'); fetch(); };

  const filtered = posts.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search posts..." /></div><button onClick={openCreate} className="ml-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Plus size={18} /> Add Post</button></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No posts found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Author</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{filtered.map(p => (<tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><div className="flex items-center gap-3">{p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}<div><p className="font-medium text-gray-900 truncate max-w-[250px]">{p.title}</p><p className="text-xs text-gray-400">{p.slug}</p></div></div></td><td className="px-4 py-3"><span className="text-xs text-gray-600">{p.category || '-'}</span></td><td className="px-4 py-3 text-gray-600">{p.author}</td><td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${p.is_published ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_published ? 'Published' : 'Draft'}</span></td><td className="px-4 py-3 text-gray-500">{formatDate(p.created_at)}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table></div>
      )}</div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Post' : 'Add Post'} size="lg">
        <div className="space-y-4"><FormField label="Title" required><TextInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v, slug: f.slug || slugify(v) }))} /></FormField><FormField label="Slug"><TextInput value={form.slug} onChange={v => setForm(f => ({ ...f, slug: v }))} /></FormField><FormField label="Excerpt"><TextArea value={form.excerpt} onChange={v => setForm(f => ({ ...f, excerpt: v }))} rows={2} /></FormField><FormField label="Content" required><TextArea value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} rows={6} /></FormField><ImageUpload label="Featured Image" value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} folder="blog" /><div className="grid sm:grid-cols-3 gap-4"><FormField label="Author"><TextInput value={form.author} onChange={v => setForm(f => ({ ...f, author: v }))} /></FormField><FormField label="Category"><TextInput value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} /></FormField><FormField label="Tags"><TextInput value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} /></FormField></div><div className="grid sm:grid-cols-2 gap-4"><FormField label="Meta Title"><TextInput value={form.meta_title} onChange={v => setForm(f => ({ ...f, meta_title: v }))} /></FormField><FormField label="Meta Description"><TextInput value={form.meta_description} onChange={v => setForm(f => ({ ...f, meta_description: v }))} /></FormField></div><ToggleInput checked={form.is_published} onChange={v => setForm(f => ({ ...f, is_published: v }))} label="Published" /><div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></div></div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Post" message="Are you sure you want to delete this blog post?" />
    </div>
  );
}

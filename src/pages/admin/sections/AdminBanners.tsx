import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/admin/Toast';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import FormField, { TextInput, TextArea, ToggleInput } from '../../../components/admin/FormField';
import ImageUpload from '../../../components/admin/ImageUpload';

interface Banner { id: string; title: string; subtitle: string; description: string; image_url: string; cta_text: string; cta_link: string; badge_text: string; sort_order: number; is_active: boolean; }

export default function AdminBanners() {
  const toast = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', image_url: '', cta_text: '', cta_link: '', badge_text: '', sort_order: '0', is_active: true });

  const fetch = async () => { setLoading(true); const { data } = await supabase.from('banners').select('*').order('sort_order'); if (data) setBanners(data as Banner[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', subtitle: '', description: '', image_url: '', cta_text: '', cta_link: '', badge_text: '', sort_order: '0', is_active: true }); setModalOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle, description: b.description, image_url: b.image_url, cta_text: b.cta_text, cta_link: b.cta_link, badge_text: b.badge_text, sort_order: String(b.sort_order), is_active: b.is_active }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.image_url) { toast('Image URL required', 'error'); return; }
    setSaving(true);
    const payload = { title: form.title, subtitle: form.subtitle, description: form.description, image_url: form.image_url, cta_text: form.cta_text, cta_link: form.cta_link, badge_text: form.badge_text, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active };
    if (editing) { const { error } = await supabase.from('banners').update(payload).eq('id', editing.id); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Banner updated'); }
    else { const { error } = await supabase.from('banners').insert(payload); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Banner created'); }
    setSaving(false); setModalOpen(false); fetch();
  };
  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('banners').delete().eq('id', deleteId); if (error) { toast(error.message, 'error'); return; } toast('Banner deleted'); fetch(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><h2 className="text-sm text-gray-500">Homepage hero sliders and promotional banners</h2><button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Plus size={18} /> Add Banner</button></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{loading ? <div className="col-span-full p-12 text-center text-gray-400">Loading...</div> : banners.length === 0 ? <div className="col-span-full p-12 text-center text-gray-400">No banners found.</div> : banners.map(b => (<div key={b.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="relative aspect-[16/9] bg-gray-50"><img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />{!b.is_active && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-sm font-semibold">Inactive</span></div>}<span className="absolute top-2 left-2 badge bg-primary-600 text-white">{b.sort_order}</span></div><div className="p-4"><h3 className="font-semibold text-sm text-gray-900">{b.title || 'Untitled'}</h3><p className="text-xs text-gray-500 mt-0.5">{b.subtitle}</p>{b.badge_text && <span className="badge bg-secondary-100 text-secondary-700 mt-2">{b.badge_text}</span>}<div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-50"><button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(b.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></div></div>))}</div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <div className="space-y-4"><ImageUpload label="Banner Image" required value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} folder="banners" /><FormField label="Title"><TextInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} /></FormField><FormField label="Subtitle"><TextInput value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} /></FormField><FormField label="Description"><TextArea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} rows={2} /></FormField><div className="grid grid-cols-2 gap-4"><FormField label="CTA Text"><TextInput value={form.cta_text} onChange={v => setForm(f => ({ ...f, cta_text: v }))} /></FormField><FormField label="CTA Link"><TextInput value={form.cta_link} onChange={v => setForm(f => ({ ...f, cta_link: v }))} /></FormField></div><div className="grid grid-cols-2 gap-4"><FormField label="Badge Text"><TextInput value={form.badge_text} onChange={v => setForm(f => ({ ...f, badge_text: v }))} /></FormField><FormField label="Sort Order"><TextInput value={form.sort_order} onChange={v => setForm(f => ({ ...f, sort_order: v }))} type="number" /></FormField></div><ToggleInput checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active" /><div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></div></div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Banner" message="Are you sure you want to delete this banner?" />
    </div>
  );
}

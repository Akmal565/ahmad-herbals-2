import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatPKR } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import FormField, { TextInput, SelectInput, ToggleInput } from '../../../components/admin/FormField';
import type { Coupon } from '../../../types';

export default function AdminCoupons() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '0', is_active: true, valid_until: '' });

  const fetch = async () => { setLoading(true); const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }); if (data) setCoupons(data as Coupon[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '0', is_active: true, valid_until: '' }); setModalOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, description: c.description, discount_type: c.discount_type, discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount), max_uses: String(c.max_uses), is_active: c.is_active, valid_until: c.valid_until ? c.valid_until.split('T')[0] : '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.code || !form.discount_value) { toast('Code and discount value required', 'error'); return; }
    setSaving(true);
    const payload = { code: form.code.toUpperCase(), description: form.description, discount_type: form.discount_type, discount_value: parseFloat(form.discount_value) || 0, min_order_amount: parseFloat(form.min_order_amount) || 0, max_uses: parseInt(form.max_uses) || 0, is_active: form.is_active, valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null };
    if (editing) { const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Coupon updated'); }
    else { const { error } = await supabase.from('coupons').insert(payload); if (error) { toast(error.message, 'error'); setSaving(false); return; } toast('Coupon created'); }
    setSaving(false); setModalOpen(false); fetch();
  };
  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('coupons').delete().eq('id', deleteId); if (error) { toast(error.message, 'error'); return; } toast('Coupon deleted'); fetch(); };

  const filtered = coupons.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search coupons..." /></div><button onClick={openCreate} className="ml-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Plus size={18} /> Add Coupon</button></div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">{loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-12 text-center text-gray-400">No coupons found.</div> : (
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Value</th><th className="px-4 py-3 font-medium">Min Order</th><th className="px-4 py-3 font-medium">Uses</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{filtered.map(c => (<tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-3"><span className="font-mono font-bold text-primary-700">{c.code}</span><p className="text-xs text-gray-400">{c.description}</p></td><td className="px-4 py-3"><span className="text-xs text-gray-600 capitalize">{c.discount_type}</span></td><td className="px-4 py-3 font-semibold">{c.discount_type === 'percentage' ? `${c.discount_value}%` : formatPKR(c.discount_value)}</td><td className="px-4 py-3 text-gray-600">{formatPKR(c.min_order_amount)}</td><td className="px-4 py-3 text-gray-600">{c.uses_count}/{c.max_uses || '∞'}</td><td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.is_active ? 'bg-secondary-100 text-secondary-700' : 'bg-gray-100 text-gray-500'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button><button onClick={() => setDeleteId(c.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table></div>
      )}</div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <div className="space-y-4"><FormField label="Coupon Code" required><TextInput value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="VIRSA10" /></FormField><FormField label="Description"><TextInput value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} /></FormField><div className="grid grid-cols-2 gap-4"><FormField label="Discount Type" required><SelectInput value={form.discount_type} onChange={v => setForm(f => ({ ...f, discount_type: v }))} options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount (Rs.)' }]} /></FormField><FormField label="Discount Value" required><TextInput value={form.discount_value} onChange={v => setForm(f => ({ ...f, discount_value: v }))} type="number" /></FormField></div><div className="grid grid-cols-2 gap-4"><FormField label="Min Order Amount"><TextInput value={form.min_order_amount} onChange={v => setForm(f => ({ ...f, min_order_amount: v }))} type="number" /></FormField><FormField label="Max Uses (0 = unlimited)"><TextInput value={form.max_uses} onChange={v => setForm(f => ({ ...f, max_uses: v }))} type="number" /></FormField></div><FormField label="Valid Until"><TextInput value={form.valid_until} onChange={v => setForm(f => ({ ...f, valid_until: v }))} type="date" /></FormField><ToggleInput checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} label="Active" /><div className="flex justify-end gap-3 pt-2"><button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSave} disabled={saving} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></div></div>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Coupon" message="Are you sure you want to delete this coupon?" />
    </div>
  );
}

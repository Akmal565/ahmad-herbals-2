import { useEffect, useState, useCallback } from 'react';
import { Mail, MailOpen, Trash2, Download, Search, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import type { FormSubmission } from '../../../types';

export default function AdminFormSubmissions() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [detailSub, setDetailSub] = useState<FormSubmission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('form_submissions').select('*').order('created_at', { ascending: false });
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
    if (filterRead === 'unread') query = query.eq('is_read', false);
    else if (filterRead === 'read') query = query.eq('is_read', true);
    const { data } = await query;
    if (data) setSubmissions(data as FormSubmission[]);
    setLoading(false);
  }, [search, filterRead]);

  useEffect(() => { fetch(); }, [fetch]);

  const markAsRead = async (id: string) => { await supabase.from('form_submissions').update({ is_read: true }).eq('id', id); fetch(); };
  const markAsUnread = async (id: string) => { await supabase.from('form_submissions').update({ is_read: false }).eq('id', id); fetch(); };
  const handleDelete = async () => { if (!deleteId) return; const { error } = await supabase.from('form_submissions').delete().eq('id', deleteId); if (error) { toast(error.message, 'error'); return; } toast('Submission deleted'); fetch(); };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Date', 'Status'];
    const rows = submissions.map(s => [s.name, s.email, s.phone, s.subject, s.message, s.created_at, s.is_read ? 'Read' : 'Unread']);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
    toast('CSV exported successfully');
  };

  const unreadCount = submissions.filter(s => !s.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search submissions..." /></div>
          <select value={filterRead} onChange={e => setFilterRead(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All ({submissions.length})</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="read">Read ({submissions.length - unreadCount})</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button onClick={fetch} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={18} className="text-gray-600" /></button>
          <button onClick={exportCSV} disabled={submissions.length === 0} className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-600 text-white text-sm font-semibold rounded-lg hover:bg-secondary-700 disabled:opacity-50"><Download size={18} /> Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Loading submissions...</div> : submissions.length === 0 ? (
          <div className="p-12 text-center"><Mail className="text-gray-300 mx-auto mb-3" size={36} /><p className="text-gray-400">No form submissions found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium w-8"></th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${!s.is_read ? 'bg-primary-50/30' : ''}`}>
                    <td className="px-4 py-3">{s.is_read ? <MailOpen size={16} className="text-gray-400" /> : <Mail size={16} className="text-primary-600" />}</td>
                    <td className="px-4 py-3"><button onClick={() => { setDetailSub(s); if (!s.is_read) markAsRead(s.id); }} className="font-medium text-gray-900 hover:text-primary-700 text-left">{s.name}</button></td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{s.subject || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailSub(s)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50" title="View"><Search size={16} /></button>
                        <button onClick={() => s.is_read ? markAsUnread(s.id) : markAsRead(s.id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50" title={s.is_read ? 'Mark as unread' : 'Mark as read'}>{s.is_read ? <Mail size={16} /> : <MailOpen size={16} />}</button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-gray-400 hover:text-accent-600 rounded-lg hover:bg-accent-50"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!detailSub} onClose={() => setDetailSub(null)} title="Submission Details" size="md">
        {detailSub && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 uppercase">Name</p><p className="text-sm font-medium text-gray-900">{detailSub.name}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Email</p><p className="text-sm font-medium text-gray-900">{detailSub.email}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Phone</p><p className="text-sm font-medium text-gray-900">{detailSub.phone || 'N/A'}</p></div>
              <div><p className="text-xs text-gray-400 uppercase">Date</p><p className="text-sm font-medium text-gray-900">{formatDate(detailSub.created_at)}</p></div>
            </div>
            {detailSub.subject && <div><p className="text-xs text-gray-400 uppercase mb-1">Subject</p><p className="text-sm font-medium text-gray-900">{detailSub.subject}</p></div>}
            <div><p className="text-xs text-gray-400 uppercase mb-1">Message</p><div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{detailSub.message}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Submission" message="Are you sure you want to delete this form submission?" />
    </div>
  );
}

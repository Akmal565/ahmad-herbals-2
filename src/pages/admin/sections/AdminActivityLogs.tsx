import { useEffect, useState, useCallback } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import SearchBar from '../../../components/admin/SearchBar';
import type { ActivityLog } from '../../../types';

const ITEMS_PER_PAGE = 20;

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('activity_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (search) query = query.or(`action.ilike.%${search}%,user_email.ilike.%${search}%`);
    if (actionFilter !== 'all') query = query.eq('action', actionFilter);
    const from = (page - 1) * ITEMS_PER_PAGE;
    query = query.range(from, from + ITEMS_PER_PAGE - 1);
    const { data, count, error } = await query;
    if (error) console.error('Activity logs fetch error:', error);
    if (data) setLogs(data as ActivityLog[]);
    if (count !== null) setTotal(count);
    setLoading(false);
  }, [search, actionFilter, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [search, actionFilter]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const actionTypes = ['login', 'logout', 'create', 'update', 'delete', 'upload'];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search by action or email..." /></div>
        <div className="flex items-center gap-3 ml-4">
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Actions</option>
            {actionTypes.map(a => <option key={a} value={a} className="capitalize">{a}</option>)}
          </select>
          <button onClick={fetchLogs} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"><RefreshCw size={18} className="text-gray-600" /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">Loading activity logs...</div> : logs.length === 0 ? (
          <div className="p-12 text-center"><Activity className="text-gray-300 mx-auto mb-3" size={36} /><p className="text-gray-400">No activity logs found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Date & Time</th>
              </tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        log.action === 'delete' ? 'bg-accent-100 text-accent-700' :
                        log.action === 'create' ? 'bg-secondary-100 text-secondary-700' :
                        log.action === 'update' ? 'bg-primary-100 text-primary-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900 text-xs">{log.user_email}</p></td>
                    <td className="px-4 py-3"><p className="text-gray-600 text-xs">{log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}</p></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(log.created_at)} {new Date(log.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => { const p = i + 1; return <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{p}</button>; })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  );
}

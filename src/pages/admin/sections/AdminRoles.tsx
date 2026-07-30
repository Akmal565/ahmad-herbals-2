import { useEffect, useState, useCallback } from 'react';
import { Shield, Crown, User, Edit2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/admin/Modal';
import FormField, { SelectInput } from '../../../components/admin/FormField';
import type { Profile } from '../../../types';

const roleConfig: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'bg-primary-600 text-white' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-secondary-600 text-white' },
  editor: { label: 'Editor', icon: Edit2, color: 'bg-blue-500 text-white' },
  customer: { label: 'Customer', icon: User, color: 'bg-gray-100 text-gray-600' },
};

export default function AdminRoles() {
  const toast = useToast();
  const { role: currentUserRole, logActivity } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState('customer');

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as Profile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpdateRole = async () => {
    if (!editUser) return;
    const { error } = await supabase.from('profiles').update({ role: newRole, updated_at: new Date().toISOString() }).eq('id', editUser.id);
    if (error) { toast(error.message, 'error'); return; }
    await logActivity('update', 'profile', editUser.id, { role: newRole, email: editUser.email });
    toast('Role updated successfully');
    setEditUser(null); fetch();
  };

  const canEditRoles = currentUserRole === 'super_admin' || currentUserRole === 'admin';
  const staffUsers = users.filter(u => u.role !== 'customer');
  const customerUsers = users.filter(u => u.role === 'customer');

  const UserRow = ({ user }: { user: Profile }) => {
    const cfg = roleConfig[user.role] || roleConfig.customer;
    return (
      <tr className="border-b border-gray-50 hover:bg-gray-50/50">
        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${cfg.color}`}><cfg.icon size={16} /></div><div><p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p><p className="text-xs text-gray-400">{user.email}</p></div></div></td>
        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span></td>
        <td className="px-4 py-3 text-gray-600">{user.phone || 'N/A'}</td>
        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
        <td className="px-4 py-3 text-right">{canEditRoles && <button onClick={() => { setEditUser(user); setNewRole(user.role); }} className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"><Edit2 size={16} /></button>}</td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(roleConfig) as string[]).filter(r => r !== 'customer').map(role => {
          const cfg = roleConfig[role];
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.color}`}><cfg.icon size={20} /></div><div><p className="text-2xl font-bold text-gray-900">{count}</p><p className="text-xs text-gray-500">{cfg.label}s</p></div></div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-gray-900 mb-3">Staff Members</h3>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : staffUsers.length === 0 ? <div className="p-8 text-center text-gray-400">No staff members found.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{staffUsers.map(u => <UserRow key={u.id} user={u} />)}</tbody></table></div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-gray-900 mb-3">All Customers</h3>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? <div className="p-12 text-center text-gray-400">Loading...</div> : customerUsers.length === 0 ? <div className="p-8 text-center text-gray-400">No customers found.</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase"><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead><tbody>{customerUsers.map(u => <UserRow key={u.id} user={u} />)}</tbody></table></div>
          )}
        </div>
      </div>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Change User Role" size="sm">
        {editUser && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg"><p className="font-semibold text-sm text-gray-900">{editUser.full_name || 'N/A'}</p><p className="text-xs text-gray-500">{editUser.email}</p><p className="text-xs text-gray-400 mt-1">Current role: <span className="font-semibold">{roleConfig[editUser.role]?.label || editUser.role}</span></p></div>
            <FormField label="New Role" required><SelectInput value={newRole} onChange={setNewRole} options={Object.entries(roleConfig).map(([value, cfg]) => ({ value, label: cfg.label }))} /></FormField>
            <div className="flex justify-end gap-3 pt-2"><button onClick={() => setEditUser(null)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleUpdateRole} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700">Update Role</button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

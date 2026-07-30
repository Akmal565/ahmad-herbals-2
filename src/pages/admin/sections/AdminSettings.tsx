import { useEffect, useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/admin/Toast';
import FormField, { TextInput, TextArea, ToggleInput } from '../../../components/admin/FormField';

interface Setting { id: string; key: string; value: string; label: string; type: string; group_name: string; }

export default function AdminSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState('general');
  const [changes, setChanges] = useState<Record<string, string>>({});

  const groups = [{ id: 'general', label: 'General' }, { id: 'shipping', label: 'Shipping' }, { id: 'payment', label: 'Payment' }, { id: 'social', label: 'Social Media' }, { id: 'seo', label: 'SEO' }, { id: 'admin', label: 'Admin' }];

  const fetch = async () => { setLoading(true); const { data } = await supabase.from('settings').select('*').order('group_name, label'); if (data) setSettings(data as Setting[]); setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const groupSettings = settings.filter(s => s.group_name === activeGroup);
  const getValue = (setting: Setting) => changes[setting.key] !== undefined ? changes[setting.key] : setting.value;
  const setValue = (key: string, value: string) => setChanges(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const updates = Object.entries(changes);
    for (const [key, value] of updates) { const setting = settings.find(s => s.key === key); if (setting) { await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('id', setting.id); } }
    toast(`${updates.length} setting(s) updated`); setChanges({}); setSaving(false); fetch();
  };

  const renderInput = (setting: Setting) => {
    const value = getValue(setting);
    if (setting.type === 'boolean') return <ToggleInput checked={value === 'true'} onChange={v => setValue(setting.key, v ? 'true' : 'false')} label={setting.label} />;
    if (setting.type === 'textarea') return <TextArea value={value} onChange={v => setValue(setting.key, v)} rows={3} />;
    return <TextInput value={value} onChange={v => setValue(setting.key, v)} type={setting.type === 'number' ? 'number' : 'text'} />;
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Loading settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5"><div className="flex items-center gap-2 flex-wrap">{groups.map(g => (<button key={g.id} onClick={() => setActiveGroup(g.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeGroup === g.id ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{g.label}</button>))}</div>{Object.keys(changes).length > 0 && (<button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-600 text-white text-sm font-semibold rounded-lg hover:bg-secondary-700 disabled:opacity-50"><Save size={18} /> {saving ? 'Saving...' : `Save Changes (${Object.keys(changes).length})`}</button>)}</div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">{groupSettings.length === 0 ? (<div className="text-center py-12"><SettingsIcon className="text-gray-300 mx-auto mb-3" size={36} /><p className="text-gray-400">No settings in this group.</p></div>) : (<div className="space-y-5 max-w-2xl">{groupSettings.map(setting => (<FormField key={setting.id} label={setting.label}>{renderInput(setting)}</FormField>))}</div>)}</div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Upload, Trash2, Search, Image as ImageIcon, Copy } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatDate } from '../../../lib/utils';
import { useToast } from '../../../components/admin/Toast';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import SearchBar from '../../../components/admin/SearchBar';
import FormField, { TextInput, TextArea } from '../../../components/admin/FormField';
import ImageUpload from '../../../components/admin/ImageUpload';
import type { MediaItem } from '../../../types';

export default function AdminMedia() {
  const toast = useToast();
  const { user, logActivity } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ url: '', name: '', alt_text: '', caption: '' });
  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('media_library').select('*').order('created_at', { ascending: false });
    if (search) query = query.or(`name.ilike.%${search}%,alt_text.ilike.%${search}%`);
    const { data } = await query;
    if (data) setMedia(data as MediaItem[]);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpload = async () => {
    if (!uploadForm.url) { toast('Please upload an image or enter a URL', 'error'); return; }
    setUploading(true);
    const name = uploadForm.name || uploadForm.url.split('/').pop()?.split('?')[0] || 'unnamed';
    const { data, error } = await supabase.from('media_library').insert({
      name, url: uploadForm.url, file_type: 'image', alt_text: uploadForm.alt_text, caption: uploadForm.caption, uploaded_by: user?.id,
    }).select().single();
    if (error) { toast(error.message, 'error'); setUploading(false); return; }
    await logActivity('upload', 'media', data.id, { name });
    toast('Image uploaded successfully');
    setUploading(false); setUploadOpen(false); setUploadForm({ url: '', name: '', alt_text: '', caption: '' }); fetch();
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const { error } = await supabase.from('media_library').update({ alt_text: editItem.alt_text, caption: editItem.caption, name: editItem.name }).eq('id', editItem.id);
    if (error) { toast(error.message, 'error'); return; }
    await logActivity('update', 'media', editItem.id, { name: editItem.name });
    toast('Media updated'); setEditItem(null); fetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const item = media.find(m => m.id === deleteId);
    const { error } = await supabase.from('media_library').delete().eq('id', deleteId);
    if (error) { toast(error.message, 'error'); return; }
    await logActivity('delete', 'media', deleteId, { name: item?.name });
    toast('Media deleted'); fetch();
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast('URL copied to clipboard'); };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search media..." /></div>
        <button onClick={() => setUploadOpen(true)} className="ml-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700"><Upload size={18} /> Add Media</button>
      </div>

      {loading ? <div className="p-12 text-center text-gray-400">Loading media...</div> : media.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><ImageIcon className="text-gray-300 mx-auto mb-3" size={36} /><p className="text-gray-400 mb-4">No media files found.</p><button onClick={() => setUploadOpen(true)} className="btn-primary text-sm">Upload First Image</button></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
              <div className="relative aspect-square bg-gray-50">
                <img src={item.url} alt={item.alt_text || item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => copyUrl(item.url)} className="p-2 bg-white/90 rounded-lg hover:bg-white" title="Copy URL"><Copy size={16} className="text-gray-700" /></button>
                  <button onClick={() => setEditItem(item)} className="p-2 bg-white/90 rounded-lg hover:bg-white" title="Edit"><Search size={16} className="text-gray-700" /></button>
                  <button onClick={() => setDeleteId(item.id)} className="p-2 bg-white/90 rounded-lg hover:bg-white" title="Delete"><Trash2 size={16} className="text-accent-600" /></button>
                </div>
              </div>
              <div className="p-3"><p className="text-sm font-medium text-gray-900 truncate">{item.name}</p><p className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</p></div>
            </div>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Add Media" size="md">
        <div className="space-y-4">
          <ImageUpload label="Image" required value={uploadForm.url} onChange={v => setUploadForm(f => ({ ...f, url: v }))} folder="media" hint="Upload from your device, or use 'Enter URL instead' for an external link" />
          <FormField label="Name"><TextInput value={uploadForm.name} onChange={v => setUploadForm(f => ({ ...f, name: v }))} placeholder="Image name (auto-filled from URL if empty)" /></FormField>
          <FormField label="Alt Text" hint="Important for SEO and accessibility"><TextInput value={uploadForm.alt_text} onChange={v => setUploadForm(f => ({ ...f, alt_text: v }))} placeholder="Describe the image" /></FormField>
          <FormField label="Caption"><TextInput value={uploadForm.caption} onChange={v => setUploadForm(f => ({ ...f, caption: v }))} placeholder="Optional caption" /></FormField>
          <div className="flex justify-end gap-3 pt-2"><button onClick={() => setUploadOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleUpload} disabled={uploading} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{uploading ? 'Saving...' : 'Save to Library'}</button></div>
        </div>
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Media" size="md">
        {editItem && (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-50 border border-gray-200"><img src={editItem.url} alt={editItem.alt_text} className="w-full h-full object-cover" /></div>
            <FormField label="Name"><TextInput value={editItem.name} onChange={v => setEditItem(m => m ? { ...m, name: v } : m)} /></FormField>
            <FormField label="Alt Text"><TextInput value={editItem.alt_text} onChange={v => setEditItem(m => m ? { ...m, alt_text: v } : m)} /></FormField>
            <FormField label="Caption"><TextArea value={editItem.caption} onChange={v => setEditItem(m => m ? { ...m, caption: v } : m)} rows={2} /></FormField>
            <div className="flex justify-end gap-3 pt-2"><button onClick={() => setEditItem(null)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleUpdate} className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700">Save Changes</button></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Media" message="Are you sure you want to delete this media file? It will be removed from the library." />
    </div>
  );
}

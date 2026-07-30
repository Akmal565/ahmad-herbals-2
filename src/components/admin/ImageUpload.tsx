import { useRef, useState } from 'react';
import { Upload, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from './Toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  hint?: string;
  folder?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image', required, hint, folder = 'uploads' }: ImageUploadProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5MB', 'error'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) { toast(error.message, 'error'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
    onChange(urlData.publicUrl);
    toast('Image uploaded');
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    if (value) {
      const path = value.split('/images/')[1];
      if (path) supabase.storage.from('images').remove([`${folder}/${path.split('/').pop()}`]);
    }
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && <span className="text-accent-600 ml-1">*</span>}</label>
      {value ? (
        <div className="relative inline-block group">
          <img src={value} alt="Preview" className="w-32 h-32 rounded-xl object-cover border border-gray-200" />
          <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 w-7 h-7 bg-accent-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent-700 transition-colors"><X size={14} /></button>
        </div>
      ) : uploading ? (
        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-primary-500" size={24} /></div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'}`}
        >
          <Upload size={22} className="text-gray-400 mb-1" />
          <span className="text-xs text-gray-500 text-center px-2">Click or drag image here</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={() => setShowUrl(!showUrl)} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600"><LinkIcon size={12} /> Enter URL instead</button>
      </div>
      {showUrl && (
        <div className="mt-2 flex items-center gap-2">
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          {value && <button type="button" onClick={() => onChange('')} className="p-2 text-gray-400 hover:text-accent-600"><X size={16} /></button>}
        </div>
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

import { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!open) return null;
  const sizeClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] flex flex-col animate-scale-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0"><h2 className="font-display text-lg font-bold text-gray-900">{title}</h2><button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><X size={20} className="text-gray-500" /></button></div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmText?: string; cancelText?: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4"><div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center shrink-0"><AlertTriangle className="text-accent-600" size={24} /></div>
        <div className="flex-1"><p className="text-gray-700 mb-5">{message}</p><div className="flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">{cancelText}</button><button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-colors">{confirmText}</button></div></div>
      </div>
    </Modal>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Toast } from './Toast';
import { useToastSubscription, dismissToast } from './Toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useToastSubscription((toast: Toast) => { setToasts(prev => [...prev, toast]); setTimeout(() => dismissToast(toast.id, setToasts), 4000); });
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up min-w-[280px] max-w-sm ${toast.type === 'success' ? 'bg-secondary-50 border-secondary-200 text-secondary-800' : toast.type === 'error' ? 'bg-accent-50 border-accent-200 text-accent-800' : 'bg-primary-50 border-primary-200 text-primary-800'}`}>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => dismissToast(toast.id, setToasts)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

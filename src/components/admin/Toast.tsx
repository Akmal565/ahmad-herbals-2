import { useEffect, useCallback } from 'react';

export interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

let toastListeners: ((toast: Toast) => void)[] = [];
let toastIdCounter = 0;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const toast: Toast = { id: `toast-${toastIdCounter++}`, message, type };
  toastListeners.forEach(fn => fn(toast));
}

export function useToastSubscription(onToast: (toast: Toast) => void) {
  useEffect(() => { toastListeners.push(onToast); return () => { toastListeners = toastListeners.filter(fn => fn !== onToast); }; }, [onToast]);
}

export function dismissToast(toastId: string, setToasts: React.Dispatch<React.SetStateAction<Toast[]>>) { setToasts(prev => prev.filter(t => t.id !== toastId)); }

export function useToast() { return useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => { showToast(message, type); }, []); }

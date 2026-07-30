import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const PHONE = '923483617905';
const DEFAULT_MESSAGE = 'Assalam o Alaikum! I have a question about your products on Ahmad Herbals.';

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-[fadeInUp_0.25s_ease-out]">
          <div className="bg-[#075E54] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Ahmad Herbals</p>
                <p className="text-white/80 text-xs">Typically replies in minutes</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-4 bg-[#ECE5DD]">
            <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%]">
              <p className="text-sm text-gray-700">
                Assalam o Alaikum! How can we help you today? Send us a message and we'll get back to you shortly.
              </p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">12:00 PM</p>
            </div>
          </div>
          <div className="p-3 bg-white border-t border-gray-100">
            <a
              href={`https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#25D366] text-white text-sm font-semibold rounded-lg hover:bg-[#1da851] transition-colors"
            >
              <MessageCircle size={16} /> Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1da851] transition-all hover:scale-105 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        )}
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}

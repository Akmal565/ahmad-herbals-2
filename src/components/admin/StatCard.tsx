import type { LucideIcon } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color, trend }: { label: string; value: string | number; icon: LucideIcon; color: 'primary' | 'secondary' | 'accent'; trend?: string }) {
  const colorMap = { primary: { bg: 'bg-primary-50', text: 'text-primary-600' }, secondary: { bg: 'bg-secondary-50', text: 'text-secondary-600' }, accent: { bg: 'bg-accent-50', text: 'text-accent-600' } };
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3"><div className={`w-11 h-11 rounded-lg ${c.bg} flex items-center justify-center`}><Icon className={c.text} size={22} /></div></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {trend && <p className="text-xs text-secondary-600 mt-1">{trend}</p>}
    </div>
  );
}

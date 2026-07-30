import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
    </div>
  );
}

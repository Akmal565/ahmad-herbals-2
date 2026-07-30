export default function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', processing: 'bg-indigo-100 text-indigo-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-secondary-100 text-secondary-800', cancelled: 'bg-accent-100 text-accent-800', refunded: 'bg-gray-100 text-gray-700', paid: 'bg-secondary-100 text-secondary-800', failed: 'bg-accent-100 text-accent-800' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

export default function DataTable({
  columns, data, emptyMessage = 'No data available',
}: {
  columns: { key: string; label: string; className?: string; render?: (row: Record<string, unknown>) => React.ReactNode }[];
  data: Record<string, unknown>[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
            {columns.map(col => (
              <th key={col.key} className={`pb-2 font-medium ${col.className || ''}`}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-12 text-center text-gray-400">{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className={`py-3 ${col.className || ''}`}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

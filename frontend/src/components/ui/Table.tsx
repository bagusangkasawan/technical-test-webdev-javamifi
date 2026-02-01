// Komponen Table - Tabel data dengan loading state dan empty state
import React from 'react';
import { Inbox } from 'lucide-react';

interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data found.',
  loading = false,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Inbox className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters or add new data</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item)}
                  className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-6 py-4 text-sm ${col.className || ''}`}>
                      {col.render
                        ? col.render(item)
                        : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
          Showing {data.length} {data.length === 1 ? 'item' : 'items'}
        </div>
      )}
    </div>
  );
}

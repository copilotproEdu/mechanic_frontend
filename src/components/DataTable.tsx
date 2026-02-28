'use client';

import { ReactNode, memo, forwardRef } from 'react';

interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

const DataTable = memo(forwardRef(function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  onRowClick 
}: DataTableProps<T>, ref: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" ref={ref}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] md:min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-3 md:px-6 py-2.5 md:py-4 text-left text-[11px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 md:px-6 py-6 md:py-8 text-center text-sm text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id ? `${item.id}-${index}` : `row-${index}`}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={`${item.id ? `${item.id}-${index}` : `row-${index}`}-${String(column.key)}`} className="px-3 md:px-6 py-2.5 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700">
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
})) as <T extends { id: string | number }>(props: DataTableProps<T>) => JSX.Element;

export default DataTable;

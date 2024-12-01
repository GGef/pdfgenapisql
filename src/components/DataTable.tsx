import React from 'react';

interface DataTableProps {
  data: any[][];
  headers: string[];
  selectedColumns: string[];
  onColumnToggle: (column: string) => void;
  selectedRows: number[];
  onRowToggle: (index: number) => void;
}

export default function DataTable({
  data = [],
  headers = [],
  selectedColumns,
  onColumnToggle,
  selectedRows,
  onRowToggle,
}: DataTableProps) {
  if (!Array.isArray(data) || !Array.isArray(headers)) {
    return (
      <div className="text-center py-4 text-gray-500">
        No data available
      </div>
    );
  }

  const handleSelectAll = () => {
    const allSelected = selectedRows.length === data.length;
    if (allSelected) {
      // Deselect all rows
      selectedRows.forEach(index => onRowToggle(index));
    } else {
      // Select all rows
      data.forEach((_, index) => {
        if (!selectedRows.includes(index)) {
          onRowToggle(index);
        }
      });
    }
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={data.length > 0 && selectedRows.length === data.length}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            {headers.map((header, index) => (
              <th
                key={`header-${index}-${header}`}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(header)}
                    onChange={() => onColumnToggle(header)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>{header}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={`row-${rowIndex}`}
              className={selectedRows.includes(rowIndex) ? 'bg-blue-50' : 'hover:bg-gray-50'}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(rowIndex)}
                  onChange={() => onRowToggle(rowIndex)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              {row.map((cell, colIndex) => (
                <td
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {cell?.toString() || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
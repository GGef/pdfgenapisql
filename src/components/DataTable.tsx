import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface DataTableProps {
  data: any[] | string;
  headers: string[] | string;
  selectedColumns?: string[];
  onColumnToggle?: (column: string) => void;
  selectedRows?: number[];
  onRowToggle?: (rowIndex: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  headers,
  selectedColumns = [],
  onColumnToggle = () => {},
  selectedRows = [],
  onRowToggle = () => {}
}) => {
  console.log('Raw Input:', { inputData: data, inputHeaders: headers });

  const [sortConfig, setSortConfig] = useState<{ 
    key: string | null, 
    direction: 'ascending' | 'descending' 
  }>({ key: null, direction: 'ascending' });

  const processData = () => {
    let processedData: any[] = [];
    let processedHeaders: string[] = [];

    try {
      if (Array.isArray(data)) {
        processedData = data;
      } else if (typeof data === 'string') {
        processedData = JSON.parse(data);
      }

      if (Array.isArray(headers)) {
        processedHeaders = headers;
      } else if (typeof headers === 'string') {
        processedHeaders = JSON.parse(headers);
      }

      if (processedHeaders.length === 0 && processedData.length > 0) {
        processedHeaders = processedData[0].map((_, index) => `Column ${index + 1}`);
      }
    } catch (error) {
      console.error('Error processing data:', error);
    }

    console.log('Processed Data:', { processedData, processedHeaders });
    return { processedData, processedHeaders };
  };

  const { processedData, processedHeaders } = processData();

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return processedData;

    const columnIndex = processedHeaders.indexOf(sortConfig.key);
    if (columnIndex === -1) return processedData;

    return [...processedData].sort((a, b) => {
      const valueA = a[columnIndex];
      const valueB = b[columnIndex];

      if (valueA == null) return sortConfig.direction === 'ascending' ? 1 : -1;
      if (valueB == null) return sortConfig.direction === 'ascending' ? -1 : 1;

      const comparison = String(valueA).localeCompare(String(valueB));
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });
  }, [processedData, sortConfig, processedHeaders]);

  const handleSort = (columnKey: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnKey, direction });
  };

  if (processedHeaders.length === 0 || processedData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No data available to display
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {processedHeaders.map((header, index) => (
              <th 
                key={index} 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort(header)}
              >
                <div className="flex items-center">
                  {header}
                  {sortConfig.key === header && (
                    sortConfig.direction === 'ascending' 
                      ? <ChevronUp className="ml-2 h-4 w-4" /> 
                      : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.slice(0, 100).map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell: any, cellIndex: number) => (
                <td 
                  key={cellIndex} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell == null ? '' : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length > 100 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Showing first 100 rows (total rows: {sortedData.length})
        </div>
      )}
    </div>
  );
}

export default DataTable;
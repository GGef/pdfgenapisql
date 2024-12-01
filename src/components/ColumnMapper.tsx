import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ColumnMapperProps {
  templateFields: string[];
  availableColumns: string[];
  mappings: Record<string, string>;
  onMappingChange: (field: string, column: string) => void;
}

export default function ColumnMapper({
  templateFields,
  availableColumns,
  mappings,
  onMappingChange,
}: ColumnMapperProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Map each template field to a column from your data source. This determines how your data will be placed in the PDF.
        </p>
      </div>
      
      <div className="space-y-4">
        {templateFields.map((field) => (
          <div key={field} className="flex items-center space-x-4">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700">{field}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <select
                value={mappings[field] || ''}
                onChange={(e) => onMappingChange(field, e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a column</option>
                {availableColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
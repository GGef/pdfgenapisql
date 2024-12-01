import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface PDFTemplateProps {
  selectedColumns: string[];
  onTemplateChange: (template: string) => void;
  onGeneratePDF: () => void;
}

export default function PDFTemplate({
  selectedColumns,
  onTemplateChange,
  onGeneratePDF,
}: PDFTemplateProps) {
  const [template, setTemplate] = useState('');

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTemplate = e.target.value;
    setTemplate(newTemplate);
    onTemplateChange(newTemplate);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">PDF Template Editor</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Available fields:</p>
          <div className="flex flex-wrap gap-2">
            {selectedColumns.map((column) => (
              <span
                key={column}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {`{{${column}}}`}
              </span>
            ))}
          </div>
        </div>
        <textarea
          value={template}
          onChange={handleTemplateChange}
          placeholder="Enter your PDF template here. Use {{column_name}} to insert data from selected columns."
          className="w-full h-48 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        onClick={onGeneratePDF}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Save className="w-4 h-4 mr-2" />
        Generate PDFs
      </button>
    </div>
  );
}
import React from 'react';
import { Save, Plus } from 'lucide-react';

interface CommonTemplate {
  id: string;
  name: string;
  content: string;
}

interface PDFBuilderProps {
  selectedColumns: string[];
  template: string;
  onTemplateChange: (template: string) => void;
  onSaveTemplate: (name: string, content: string) => void;
  onGeneratePDF: () => void;
}

const commonTemplates: CommonTemplate[] = [
  {
    id: 'invoice',
    name: 'Invoice Template',
    content: `INVOICE

Bill To: {{name}}
Email: {{email}}
Date: {{date}}

Items:
{{items}}

Total Amount: {{amount}}
    `,
  },
  {
    id: 'letter',
    name: 'Business Letter',
    content: `Dear {{name}},

{{content}}

Best regards,
{{sender}}
    `,
  },
];

export default function PDFBuilder({
  selectedColumns,
  template,
  onTemplateChange,
  onSaveTemplate,
  onGeneratePDF,
}: PDFBuilderProps) {
  const [templateName, setTemplateName] = React.useState('');
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);

  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      onSaveTemplate(templateName, template);
      setTemplateName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Common Templates</h3>
        <div className="grid grid-cols-2 gap-4">
          {commonTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => onTemplateChange(tmpl.content)}
              className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{tmpl.name}</h4>
              <p className="mt-1 text-sm text-gray-500">Click to use this template</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Template Editor</h3>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Template
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Available fields:</p>
          <div className="flex flex-wrap gap-2">
            {selectedColumns.map((column) => (
              <span
                key={column}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                onClick={() => onTemplateChange(template + `{{${column}}}`)}
              >
                {`{{${column}}}`}
              </span>
            ))}
          </div>
        </div>

        <textarea
          value={template}
          onChange={(e) => onTemplateChange(e.target.value)}
          placeholder="Enter your PDF template here. Use {{column_name}} to insert data from selected columns."
          className="w-full h-64 p-4 border rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono"
        />

        <button
          onClick={onGeneratePDF}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Generate PDFs
        </button>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Template</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="w-full px-3 py-2 border rounded-md mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
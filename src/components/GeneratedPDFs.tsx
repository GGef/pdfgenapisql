import React from 'react';
import { FileText, Download, Trash2 } from 'lucide-react';

interface GeneratedPDF {
  id: string;
  name: string;
  template: string;
  createdAt: Date;
  downloadUrl: string;
}

interface GeneratedPDFsProps {
  pdfs: GeneratedPDF[];
  onDelete: (id: string) => void;
  onRegenerate: (template: string) => void;
}

export default function GeneratedPDFs({
  pdfs,
  onDelete,
  onRegenerate,
}: GeneratedPDFsProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Generated PDFs</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {pdfs.map((pdf) => (
          <li key={pdf.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{pdf.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(pdf.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => onRegenerate(pdf.template)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(pdf.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
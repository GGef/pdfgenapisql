import React from 'react';
import { Download, Eye, Trash2, Mail, PenTool } from 'lucide-react';

interface PDFActionsProps {
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onEmail: () => void;
  onSign: () => void;
}

export default function PDFActions({
  onView,
  onDownload,
  onDelete,
  onEmail,
  onSign,
}: PDFActionsProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onView}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="View PDF"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={onDownload}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="Download PDF"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={onEmail}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="Send via Email"
      >
        <Mail className="w-4 h-4" />
      </button>
      <button
        onClick={onSign}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
        title="Request Signature"
      >
        <PenTool className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        title="Delete PDF"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
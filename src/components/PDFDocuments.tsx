import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { GeneratedPDFGroup } from '../types';
import PDFActions from './PDFActions';
import PDFViewer from './PDFViewer';

interface PDFDocumentsProps {
  pdfGroups: GeneratedPDFGroup[];
  onDelete: (groupId: string, pdfId?: string) => void;
  onEdit: (groupId: string, pdfId: string) => void;
  onEmail: (groupId: string, pdfId: string) => void;
  onSign: (groupId: string, pdfId: string) => void;
}

export default function PDFDocuments({
  pdfGroups,
  onDelete,
  onEdit,
  onEmail,
  onSign,
}: PDFDocumentsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewingPDF, setViewingPDF] = useState<{ url: string; name: string } | null>(null);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (pdfGroups.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No PDFs</h3>
        <p className="mt-1 text-sm text-gray-500">
          Generate your first PDF using the button above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pdfGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow">
            <div
              className={`p-4 flex items-center justify-between cursor-pointer ${
                group.pdfs.length > 1 ? 'hover:bg-gray-50' : ''
              }`}
              onClick={() => group.pdfs.length > 1 && toggleGroup(group.id)}
            >
              <div className="flex items-center space-x-3">
                {group.pdfs.length > 1 ? (
                  expandedGroups.has(group.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )
                ) : (
                  <FileText className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {group.pdfs.length > 1 ? group.name : group.pdfs[0].name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(group.createdAt, 'PPP')} •{' '}
                    {group.pdfs.length > 1
                      ? `${group.pdfs.length} PDFs`
                      : '1 PDF'}
                  </p>
                </div>
              </div>
              {group.pdfs.length === 1 && (
                <PDFActions
                  onView={() => setViewingPDF({
                    url: group.pdfs[0].downloadUrl,
                    name: group.pdfs[0].name
                  })}
                  onDownload={() => handleDownload(
                    group.pdfs[0].downloadUrl,
                    group.pdfs[0].name
                  )}
                  onDelete={() => onDelete(group.id, group.pdfs[0].id)}
                  onEmail={() => onEmail(group.id, group.pdfs[0].id)}
                  onSign={() => onSign(group.id, group.pdfs[0].id)}
                />
              )}
            </div>

            {group.pdfs.length > 1 && expandedGroups.has(group.id) && (
              <div className="border-t">
                {group.pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{pdf.name}</span>
                    </div>
                    <PDFActions
                      onView={() => setViewingPDF({
                        url: pdf.downloadUrl,
                        name: pdf.name
                      })}
                      onDownload={() => handleDownload(pdf.downloadUrl, pdf.name)}
                      onDelete={() => onDelete(group.id, pdf.id)}
                      onEmail={() => onEmail(group.id, pdf.id)}
                      onSign={() => onSign(group.id, pdf.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {viewingPDF && (
        <PDFViewer
          url={viewingPDF.url}
          name={viewingPDF.name}
          onClose={() => setViewingPDF(null)}
        />
      )}
    </>
  );
}
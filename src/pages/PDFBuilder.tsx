import React, { useState, useCallback } from 'react';
import { useTemplateStore } from '../stores/templateStore';
import { useImportStore } from '../stores/importStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, ChevronRight, Plus, Eye, Download, Mail, PenTool, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PDFPreview from '../components/PDFPreview';
import PDFDocuments from '../components/PDFDocuments';
import ColumnMapper from '../components/ColumnMapper';
import PDFViewer from '../components/PDFViewer';
import { GeneratedPDFGroup, GeneratedPDF } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

export default function PDFBuilder() {
  const { templates } = useTemplateStore();
  const { imports } = useImportStore();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [generatedGroups, setGeneratedGroups] = useState<GeneratedPDFGroup[]>([]);
  const [viewingPDF, setViewingPDF] = useState<{ url: string; name: string } | null>(null);

  const extractTemplateFields = useCallback((template: string): string[] => {
    const fieldRegex = /\{\{([^}]+)\}\}/g;
    const fields = new Set<string>();
    let match;
    
    while ((match = fieldRegex.exec(template)) !== null) {
      fields.add(match[1]);
    }
    
    return Array.from(fields);
  }, []);

  const generatePDFName = (baseName: string, rowIndex: number): string => {
    const sanitizedName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `${sanitizedName}-${rowIndex + 1}.pdf`;
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedImport || selectedRows.length === 0) {
      toast.error('Please complete all steps');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    const importData = imports.find(i => i.id === selectedImport);

    if (!template || !importData) return;

    try {
      const pdfs: GeneratedPDF[] = await Promise.all(
        selectedRows.map(async (rowIndex) => {
          const rowData = importData.data[rowIndex].reduce((acc, value, index) => {
            acc[importData.headers[index]] = value;
            return acc;
          }, {} as Record<string, any>);

          const fileName = generatePDFName(template.name, rowIndex);
          
          const pdfBlob = await generatePDF(
            template.content,
            rowData,
            columnMappings
          );
          
          const downloadUrl = URL.createObjectURL(pdfBlob);
          
          return {
            id: `pdf-${Date.now()}-${rowIndex}`,
            name: fileName,
            template: selectedTemplate,
            createdAt: new Date(),
            downloadUrl,
            blob: pdfBlob,
          };
        })
      );

      const groupName = selectedRows.length > 1 
        ? `${template.name} Batch (${pdfs.length} PDFs)`
        : pdfs[0].name;

      const newGroup: GeneratedPDFGroup = {
        id: `group-${Date.now()}`,
        name: groupName,
        createdAt: new Date(),
        pdfs,
      };

      setGeneratedGroups(prev => [newGroup, ...prev]);
      setShowGenerateModal(false);
      resetSelections();
      toast.success(`Generated ${pdfs.length} PDF${pdfs.length > 1 ? 's' : ''} successfully`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const resetSelections = () => {
    setSelectedTemplate(null);
    setSelectedImport(null);
    setSelectedRows([]);
    setColumnMappings({});
    setCurrentStep(1);
  };

  const handleDeletePDF = (groupId: string, pdfId?: string) => {
    if (pdfId) {
      setGeneratedGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          const updatedPdfs = group.pdfs.filter(pdf => pdf.id !== pdfId);
          return updatedPdfs.length ? { ...group, pdfs: updatedPdfs } : null;
        }
        return group;
      }).filter(Boolean) as GeneratedPDFGroup[]);
    } else {
      setGeneratedGroups(prev => prev.filter(group => group.id !== groupId));
    }
    toast.success('PDF deleted successfully');
  };

  const handleViewPDF = (url: string, name: string) => {
    setViewingPDF({ url, name });
  };

  const handleDownloadPDF = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const steps = [
    {
      title: 'Select Template',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-transparent hover:border-gray-200'
              }`}
              onClick={() => {
                setSelectedTemplate(template.id);
                setCurrentStep(2);
              }}
            >
              {template.previewUrl && (
                <img
                  src={template.previewUrl}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 bg-white">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last used: {new Date(template.lastUsed).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Select Data',
      content: (
        <div className="space-y-4">
          {imports.map((imp) => (
            <div
              key={imp.id}
              className={`cursor-pointer p-4 rounded-lg border transition-all ${
                selectedImport === imp.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
              onClick={() => {
                setSelectedImport(imp.id);
                setCurrentStep(3);
              }}
            >
              <div className="flex items-center">
                <FileSpreadsheet className="h-6 w-6 text-gray-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {imp.fileName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {imp.rowCount} rows • {imp.columnCount} columns •{' '}
                    {new Date(imp.dateImported).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Select Rows',
      content: (
        <div className="space-y-4">
          {selectedImport && (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const import_data = imports.find(
                            (imp) => imp.id === selectedImport
                          );
                          if (import_data) {
                            setSelectedRows(
                              e.target.checked
                                ? Array.from(
                                    Array(import_data.data.length).keys()
                                  )
                                : []
                            );
                          }
                        }}
                        checked={
                          selectedRows.length ===
                          imports.find((imp) => imp.id === selectedImport)?.data
                            .length
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    {imports
                      .find((imp) => imp.id === selectedImport)
                      ?.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {imports
                    .find((imp) => imp.id === selectedImport)
                    ?.data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          selectedRows.includes(rowIndex)
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowIndex)}
                            onChange={(e) => {
                              setSelectedRows(
                                e.target.checked
                                  ? [...selectedRows, rowIndex]
                                  : selectedRows.filter((r) => r !== rowIndex)
                              );
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        {row.map((cell: any, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Map Fields',
      content: (
        <div className="space-y-4">
          {selectedTemplate && selectedImport && (
            <ColumnMapper
              templateFields={extractTemplateFields(
                templates.find((t) => t.id === selectedTemplate)?.content || ''
              )}
              availableColumns={
                imports.find((i) => i.id === selectedImport)?.headers || []
              }
              mappings={columnMappings}
              onMappingChange={(field, column) =>
                setColumnMappings((prev) => ({ ...prev, [field]: column }))
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Generate PDF
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900">Generated PDFs</h2>
        <PDFDocuments
          pdfGroups={generatedGroups}
          onDelete={handleDeletePDF}
          onView={handleViewPDF}
          onDownload={handleDownloadPDF}
        />
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Generate PDF
                  </h2>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      resetSelections();
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    {steps.map((step, index) => (
                      <React.Fragment key={index}>
                        <div
                          className={`flex items-center ${
                            currentStep > index + 1
                              ? 'text-blue-600'
                              : currentStep === index + 1
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                              currentStep > index + 1
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : currentStep === index + 1
                                ? 'border-blue-600 text-blue-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <ChevronRight
                            className={`w-5 h-5 mx-4 ${
                              currentStep > index + 1
                                ? 'text-blue-600'
                                : 'text-gray-300'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {steps[currentStep - 1].content}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (currentStep > 1) {
                        setCurrentStep(currentStep - 1);
                      }
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      currentStep === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    disabled={currentStep === 1}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (currentStep === steps.length) {
                        handleGenerate();
                      } else {
                        setCurrentStep(currentStep + 1);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {currentStep === steps.length ? 'Generate PDFs' : 'Next'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedTemplate && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
          <PDFPreview
            content={
              templates.find((t) => t.id === selectedTemplate)?.content || ''
            }
          />
        </div>
      )}

      {viewingPDF && (
        <PDFViewer
          url={viewingPDF.url}
          name={viewingPDF.name}
          onClose={() => setViewingPDF(null)}
        />
      )}
    </div>
  );
}
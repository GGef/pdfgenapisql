import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import CSVImporter from '../components/CSVImporter';
import DataTable from '../components/DataTable';
import { ImportedData } from '../types';
import { useImportStore } from '../stores/importStore';
import { importService } from '../services/importService';
import { formatDate, isValidDate } from '../utils/dateUtils';

export default function DataImports() {
  const navigate = useNavigate();
  const { imports, addImport, removeImport } = useImportStore();
  const [selectedImport, setSelectedImport] = useState<ImportedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importDetails, setImportDetails] = useState<ImportedData | null>(null);

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
    setIsLoading(true);
    try {
      const response = await importService.getImports();
      if (response.success && response.data) {
        // Deduplicate imports and ensure valid dates
        const uniqueImports = Array.from(
          new Map(response.data.map((imp) => [imp.id, {
            ...imp,
            dateImported: imp.dateImported ? new Date(imp.dateImported) : new Date(),
            fileType: imp.fileType || 'Unknown'
          }])).values()
        );

        // Replace the imports state with unique imports
        useImportStore.setState({ imports: uniqueImports });
      }
    } catch (error) {
      toast.error('Failed to load imports');
      console.error('Load imports error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImportDetails = async (importId: string) => {
    try {
      setIsLoading(true);
      const response = await importService.getImportById(importId);
      
      console.log('Import Details Response:', response);
      
      if (response.success && response.data) {
        // Ensure valid date and file type
        const processedImportData = {
          ...response.data,
          dateImported: response.data.dateImported ? new Date(response.data.dateImported) : new Date(),
          fileType: response.data.fileType || 'CSV',
          data: response.data.data ? 
            (typeof response.data.data === 'string' 
              ? JSON.parse(response.data.data) 
              : response.data.data) 
            : [],
          headers: response.data.headers ? 
            (typeof response.data.headers === 'string' 
              ? JSON.parse(response.data.headers) 
              : response.data.headers) 
            : []
        };

        console.log('Processed Import Data:', processedImportData);

        setImportDetails(processedImportData);
        setSelectedImport(processedImportData);
      } else {
        toast.error('Failed to fetch import details');
      }
    } catch (error) {
      toast.error('Error loading import details');
      console.error('Import details error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataImported = async (data: any[], headers: string[]) => {
    setIsLoading(true);

    try {
      const newImport: ImportedData = {
        id: crypto.randomUUID(),
        fileName: 'imported-data.csv',
        dateImported: new Date(),
        rowCount: data.length,
        columnCount: headers.length,
        fileType: 'CSV',
        headers,
        data,
      };

      const response = await importService.createImport(newImport);

      if (response.success && response.data) {
        addImport(response.data);
        toast.success('Data imported successfully!');
      } else {
        throw new Error(response.error || 'Failed to save import');
      }
    } catch (error) {
      toast.error('Failed to import data');
      console.error('Import error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImport = async (id: string) => {
    try {
      const response = await importService.deleteImport(id);
      if (response.success) {
        removeImport(id);
        toast.success('Import deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete import');
      }
    } catch (error) {
      toast.error('Failed to delete import');
      console.error('Delete error:', error);
    }
  };

  const handleViewDetails = (importId: string) => {
    fetchImportDetails(importId);
  };

  const renderImportList = () => {
    if (isLoading) {
      return (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading imports...</p>
        </div>
      );
    }
  
    if (imports.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          No imports yet. Upload a CSV file to get started.
        </div>
      );
    }
  
    return imports.map((imp, index) => {
      // Ensure valid date
      const importDate = imp.dateImported instanceof Date 
        ? imp.dateImported 
        : (imp.dateImported ? new Date(imp.dateImported) : new Date());
      
      return (
        <div
          key={imp.id || `import-${index}`}
          className="p-6 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center cursor-pointer" onClick={() => handleViewDetails(imp.id)}>
            <Database className="h-8 w-8 text-gray-400" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{imp.fileName}</h3>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>{isValidDate(importDate) ? formatDate(importDate) : 'Unknown Date'}</span>
                <span>•</span>
                <span>{imp.rowCount} rows</span>
                <span>•</span>
                <span>{imp.columnCount} columns</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleViewDetails(imp.id)}
              className="text-blue-600 hover:text-blue-900"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteImport(imp.id);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      );
    });
  };

  const renderImportDetails = () => {
    if (!selectedImport) return null;

    console.log('Selected Import for Details:', selectedImport);

    return (
      <div className="fixed inset-0 overflow-hidden z-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="relative w-screen max-w-4xl">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-6 sm:px-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedImport.data.fileName} Details
                      </h2>
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500"
                        onClick={() => setSelectedImport(null)}
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-6 sm:px-6">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">File Type</p>
                        <p className="text-lg">{selectedImport.data.fileType || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date Imported</p>
                        <p className="text-lg">
                          {selectedImport.dateImported instanceof Date 
                            ? selectedImport.dateImported.toLocaleString() 
                            : (selectedImport.dateImported 
                              ? new Date(selectedImport.dateImported).toLocaleString() 
                              : 'Unknown Date')}
                        </p>
                      </div>
                    </div>

                    {/* Debugging Data Rendering */}
                    {(() => {
                      // Prepare data for DataTable
                      let tableData;
                      let tableHeaders;

                      try {
                        // Parse data from the nested structure
                        tableData = JSON.parse(selectedImport.data.data);
                        tableHeaders = JSON.parse(selectedImport.data.headers);
                      } catch (error) {
                        console.error('Failed to parse import data:', error);
                        tableData = [];
                        tableHeaders = [];
                      }

                      console.log('Prepared Table Data:', {
                        data: tableData,
                        headers: tableHeaders,
                        dataType: typeof tableData,
                        headersType: typeof tableHeaders
                      });

                      // Render DataTable with prepared data
                      return (
                        <DataTable
                          data={tableData}
                          headers={tableHeaders || []}
                          selectedColumns={[]}
                          onColumnToggle={() => {}}
                          selectedRows={[]}
                          onRowToggle={() => {}}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <CSVImporter onDataImported={handleDataImported} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Import History</h2>
        </div>
        <div className="divide-y divide-gray-200">{renderImportList()}</div>
      </div>

      {selectedImport && renderImportDetails()}
    </div>
  );
}

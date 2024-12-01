import React, { useState, useEffect } from 'react';
import { Database, FileSpreadsheet, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CSVImporter from '../components/CSVImporter';
import DataTable from '../components/DataTable';
import { ImportedData } from '../types';
import { useImportStore } from '../stores/importStore';
import { importService } from '../services/importService';
import { formatDate, isValidDate } from '../utils/dateUtils';

export default function DataImports() {
  const { imports, addImport, removeImport } = useImportStore();
  const [selectedImport, setSelectedImport] = useState<ImportedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
  setIsLoading(true);
  try {
    const response = await importService.getImports();
    if (response.success && response.data) {
      // Deduplicate imports
      const uniqueImports = Array.from(
        new Map(response.data.map((imp) => [imp.id, imp])).values()
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

      console.log('Sending new import:', newImport);
      console.log('New import data being sent:', JSON.stringify(newImport, null, 2));


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
  
    return imports.map((imp, index) => (
      <div
        key={imp.id || `import-${index}`} // Ensure a fallback unique key
        className="p-6 hover:bg-gray-50 cursor-pointer"
        onClick={() => setSelectedImport(imp)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-gray-400" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{imp.fileName}</h3>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>{isValidDate(imp.dateImported) ? formatDate(imp.dateImported) : 'Invalid date'}</span>
                <span>•</span>
                <span>{imp.rowCount} rows</span>
                <span>•</span>
                <span>{imp.columnCount} columns</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteImport(imp.id);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </button>
            <FileSpreadsheet className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    ));
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

      {selectedImport && (
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
                          {selectedImport.fileName}
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
                      <DataTable
                        data={selectedImport.data}
                        headers={selectedImport.headers}
                        selectedColumns={[]}
                        onColumnToggle={() => {}}
                        selectedRows={[]}
                        onRowToggle={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

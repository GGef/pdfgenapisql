import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTemplateStore } from '../stores/templateStore';
import { Pencil, Trash2, Plus, Eye, X, FileUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import VisualTemplateEditor from '../components/VisualTemplateEditor';

export default function TemplateManager() {
  const { t } = useTranslation();
  const { 
    templates, 
    createTemplate, 
    deleteTemplate, 
    updateTemplate, 
    fetchTemplates, 
    loading, 
    error 
  } = useTemplateStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });
  const [importedDocName, setImportedDocName] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load templates: ${error}`);
    }
  }, [error]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setNewTemplate({
          name: file.name.replace(/\.[^/.]+$/, ''),
          content: `<div class="document-content">${content}</div>`
        });
        setImportedDocName(file.name);
        setShowImportModal(false);
        setShowCreateModal(true);
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to import document');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
    },
    maxFiles: 1,
  });

  const handleSaveTemplate = () => {
    if (newTemplate.name && newTemplate.content) {
      const template = {
        id: Date.now().toString(),
        name: newTemplate.name,
        content: newTemplate.content,
        lastUsed: new Date(),
        createdAt: new Date(),
      };
      createTemplate(template);
      setNewTemplate({ name: '', content: '' });
      setShowCreateModal(false);
      toast.success('Template saved successfully!');
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowEditModal(true);
  };

  const handlePreviewTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowPreviewModal(true);
  };

  const handleUpdateTemplate = (content: string) => {
    if (selectedTemplate) {
      updateTemplate(selectedTemplate, content);
      toast.success('Template updated successfully!');
      setShowEditModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.templates')}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Import Document
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              {template.previewUrl && (
                <img
                  src={template.previewUrl}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last used: {new Date(template.lastUsed).toLocaleDateString()}
                </p>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handlePreviewTemplate(template.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      deleteTemplate(template.id);
                      toast.success('Template removed');
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Import Document
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your document here' : 'Drag & drop your document here'}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Supported formats: HTML, TXT, RTF
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {importedDocName ? `Import: ${importedDocName}` : 'Create New Template'}
                  </h3>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    placeholder="Template name"
                    className="px-3 py-2 border rounded-md w-64"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setImportedDocName('');
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <VisualTemplateEditor
                  content={newTemplate.content}
                  onChange={(content) => setNewTemplate({ ...newTemplate, content })}
                  onSave={handleSaveTemplate}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Edit Modal */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Template
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleUpdateTemplate(templates.find(t => t.id === selectedTemplate)?.content || '')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <VisualTemplateEditor
                  content={templates.find((t) => t.id === selectedTemplate)?.content || ''}
                  onChange={(content) => handleUpdateTemplate(content)}
                  onSave={() => setShowEditModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Template Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: templates.find((t) => t.id === selectedTemplate)?.content || '',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
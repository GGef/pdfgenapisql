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
  const [editingContent, setEditingContent] = useState('');
  const [importedDocName, setImportedDocName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error('Please provide a name and content for the template');
      return;
    }

    setIsSaving(true);
    try {
      await createTemplate({
        name: newTemplate.name,
        content: newTemplate.content,
      });
      setNewTemplate({ name: '', content: '' });
      setShowCreateModal(false);
      toast.success('Template saved successfully!');
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTemplate = async (content: string) => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      await updateTemplate(selectedTemplate, content);
      setEditingContent(content); // Update local state to prevent unnecessary re-renders
      toast.success('Template updated successfully!');
    } catch (error) {
      toast.error('Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditing = (template: any) => {
    setSelectedTemplate(template.id);
    setEditingContent(template.content);
    setShowEditModal(true);
  };

  const handleContentChange = useCallback((content: string) => {
    setNewTemplate(prev => ({ ...prev, content }));
  }, []);

  const handleEditContentChange = useCallback((content: string) => {
    setEditingContent(content);
  }, []);

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
      }
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last used: {new Date(template.lastUsed).toLocaleDateString()}
                </p>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowPreviewModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleStartEditing(template)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
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

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {showCreateModal ? (
                      importedDocName ? `Import: ${importedDocName}` : 'Create New Template'
                    ) : 'Edit Template'}
                  </h3>
                  {showCreateModal && (
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, name: e.target.value })
                      }
                      placeholder="Template name"
                      className="px-3 py-2 border rounded-md w-64"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      if (showCreateModal) {
                        handleSaveTemplate();
                      } else {
                        handleUpdateTemplate(editingContent);
                      }
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : showCreateModal ? 'Save Template' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                      setImportedDocName('');
                      setNewTemplate({ name: '', content: '' });
                      setEditingContent('');
                      setSelectedTemplate(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <VisualTemplateEditor
                  content={showCreateModal ? newTemplate.content : editingContent}
                  onChange={showCreateModal ? handleContentChange : handleEditContentChange}
                  onSave={showCreateModal ? handleSaveTemplate : handleUpdateTemplate}
                  autoSave={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Template Preview
              </h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedTemplate(null);
                }}
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
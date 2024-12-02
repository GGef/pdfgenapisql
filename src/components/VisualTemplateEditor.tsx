import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import 'grapesjs/dist/css/grapes.min.css';

interface VisualTemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

export default function VisualTemplateEditor({
  content,
  onChange,
  onSave,
}: VisualTemplateEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      try {
        const editor = grapesjs.init({
          container: containerRef.current,
          height: '100%',
          width: 'auto',
          storageManager: {
            type: 'none', // Disable default storage
          },
          plugins: [
            gjsPresetWebpage,
            gjsBlocksBasic,
          ],
          pluginsOpts: {
            gjsPresetWebpage: {},
            gjsBlocksBasic: {},
          },
          canvas: {
            styles: [
              'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
            ],
          },
          blockManager: {
            appendTo: '.blocks-container',
            blocks: [
              {
                id: 'section',
                label: 'Section',
                category: 'Basic',
                content: `<section class="py-8 px-6">
                  <h2 class="text-2xl font-bold mb-4">Section Title</h2>
                  <p>Section content goes here</p>
                </section>`,
              },
              {
                id: 'dynamic-field',
                label: 'Dynamic Field',
                category: 'Template',
                content: {
                  type: 'text',
                  content: '{{field_name}}',
                  activeOnRender: true,
                },
              },
            ],
          },
        });

        // Store editor reference
        editorRef.current = editor;

        // Safely set initial content
        try {
          editor.setComponents(content || '<div>Start editing your template</div>');
        } catch (contentError) {
          console.error('Error setting initial content:', contentError);
          editor.setComponents('<div>Error loading template content</div>');
        }

        // Event listeners
        editor.on('change:components', () => {
          try {
            const currentHtml = editor.getHtml();
            onChange(currentHtml);
          } catch (changeError) {
            console.error('Error capturing content change:', changeError);
          }
        });

        // Add save command
        editor.Commands.add('save-template', {
          run: () => {
            try {
              onSave();
            } catch (saveError) {
              console.error('Error saving template:', saveError);
            }
          }
        });

      } catch (initError) {
        console.error('Failed to initialize GrapesJS editor:', initError);
      }
    }

    // Cleanup function
    return () => {
      try {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      } catch (destroyError) {
        console.error('Error destroying editor:', destroyError);
      }
    };
  }, [content, onChange, onSave]);

  return (
    <div className="visual-template-editor h-full flex">
      <div className="blocks-container w-64 bg-white border-r overflow-y-auto" />
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
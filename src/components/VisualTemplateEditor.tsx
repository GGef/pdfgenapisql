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
      editorRef.current = grapesjs.init({
        container: containerRef.current,
        height: '100%',
        width: 'auto',
        storageManager: false,
        plugins: [gjsPresetWebpage, gjsBlocksBasic],
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

      editorRef.current.setComponents(content);

      editorRef.current.on('component:selected', () => {
        const selected = editorRef.current.getSelected();
        if (selected) {
          // Custom actions for selected component
        }
      });

      editorRef.current.on('update', () => {
        const html = editorRef.current.getHtml();
        onChange(html);
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
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
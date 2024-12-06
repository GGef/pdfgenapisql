import React, { useEffect, useRef, useCallback } from 'react';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import 'grapesjs/dist/css/grapes.min.css';

interface VisualTemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: (content: string) => void;
  autoSave?: boolean;
}

export default function VisualTemplateEditor({
  content,
  onChange,
  onSave,
  autoSave = false,
}: VisualTemplateEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastContentRef = useRef<string>(content);

  const handleChange = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const html = editorRef.current.getHtml();
        const css = editorRef.current.getCss();
        const fullContent = `<style>${css}</style>${html}`;

        // Only trigger if content actually changed
        if (fullContent !== lastContentRef.current) {
          lastContentRef.current = fullContent;
          onChange(fullContent);
          if (autoSave) {
            onSave(fullContent);
          }
        }
      } catch (error) {
        console.error('Error getting editor content:', error);
      }
    }, 1000); // Increased debounce time
  }, [onChange, onSave, autoSave]);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    try {
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
            {
              id: 'signature-field',
              label: 'Signature Field',
              category: 'Template',
              content: `<div class="signature-field p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p class="text-gray-500">Signature Field</p>
                <span class="text-sm">{{signature}}</span>
              </div>`,
            },
            {
              id: 'date-field',
              label: 'Date Field',
              category: 'Template',
              content: `<div class="date-field">
                <span>{{date}}</span>
              </div>`,
            },
          ],
        },
      });

      // Set initial content after initialization
      if (content) {
        isUpdatingRef.current = true;
        editorRef.current.setComponents(content);
        lastContentRef.current = content;
        isUpdatingRef.current = false;
      }

      // Setup event listeners
      const editor = editorRef.current;
      editor.on('component:update', handleChange);
      editor.on('component:add', handleChange);
      editor.on('component:remove', handleChange);
      editor.on('style:update', handleChange);

      // Add manual save command
      editor.Commands.add('save-template', {
        run: () => {
          try {
            const html = editor.getHtml();
            const css = editor.getCss();
            const fullContent = `<style>${css}</style>${html}`;
            onSave(fullContent);
          } catch (error) {
            console.error('Error saving template:', error);
          }
        },
      });

      isInitializedRef.current = true;
    } catch (error) {
      console.error('Error initializing editor:', error);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (editorRef.current) {
        try {
          const editor = editorRef.current;
          editor.off('component:update', handleChange);
          editor.off('component:add', handleChange);
          editor.off('component:remove', handleChange);
          editor.off('style:update', handleChange);
          editor.destroy();
          editorRef.current = null;
          isInitializedRef.current = false;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, [content, onChange, onSave, handleChange]);

  // Update content when it changes externally
  useEffect(() => {
    if (editorRef.current && content && isInitializedRef.current && content !== lastContentRef.current) {
      try {
        isUpdatingRef.current = true;
        editorRef.current.setComponents(content);
        lastContentRef.current = content;
        isUpdatingRef.current = false;
      } catch (error) {
        console.error('Error updating editor content:', error);
      }
    }
  }, [content]);

  return (
    <div className="visual-template-editor h-full flex">
      <div className="blocks-container w-64 bg-white border-r overflow-y-auto" />
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
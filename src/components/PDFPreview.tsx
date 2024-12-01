import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

interface PDFPreviewProps {
  content: string;
  onPreviewGenerated?: (canvas: HTMLCanvasElement) => void;
}

export default function PDFPreview({ content, onPreviewGenerated }: PDFPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      html2canvas(previewRef.current).then((canvas) => {
        onPreviewGenerated?.(canvas);
      });
    }
  }, [content, onPreviewGenerated]);

  return (
    <div
      ref={previewRef}
      className="bg-white shadow-lg rounded-lg p-8 max-w-[21cm] mx-auto"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
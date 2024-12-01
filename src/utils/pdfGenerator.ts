import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(
  template: string,
  data: Record<string, any>,
  mappings: Record<string, string>
): Promise<Blob> {
  // Create a temporary container for the content
  const container = document.createElement('div');
  
  // Apply base styles for better PDF rendering
  container.style.width = '794px'; // A4 width in pixels at 96 DPI
  container.style.padding = '40px';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Process the template with mapped data
  let processedContent = template;
  const templateVars = template.match(/\{\{([^}]+)\}\}/g) || [];
  
  templateVars.forEach((variable) => {
    const field = variable.replace(/[{}]/g, '');
    const mappedColumn = mappings[field];
    const value = mappedColumn ? data[mappedColumn] : '';
    processedContent = processedContent.replace(variable, value || '');
  });
  
  container.innerHTML = processedContent;
  document.body.appendChild(container);
  
  try {
    // Convert the HTML content to canvas with better quality settings
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
      allowTaint: false,
      imageTimeout: 15000,
      removeContainer: true,
      letterRendering: true,
    });
    
    // Create PDF with proper settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
      hotfixes: ['px_scaling'],
    });
    
    // Calculate dimensions maintaining aspect ratio
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgWidth = pageWidth;
    const imgHeight = imgWidth / ratio;
    
    // Add the image to PDF with high quality
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    
    // Return as Blob with proper type
    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

// Helper function to validate mappings
export function validateMappings(
  template: string,
  mappings: Record<string, string>
): boolean {
  const templateVars = template.match(/\{\{([^}]+)\}\}/g) || [];
  const fields = templateVars.map(v => v.replace(/[{}]/g, ''));
  return fields.every(field => mappings[field] !== undefined);
}
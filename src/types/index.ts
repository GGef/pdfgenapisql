export interface GeneratedPDF {
  id: string;
  name: string;
  template: string;
  createdAt: Date;
  downloadUrl: string;
  blob?: Blob;
}

export interface GeneratedPDFGroup {
  id: string;
  name: string;
  createdAt: Date;
  pdfs: GeneratedPDF[];
}

export interface ImportedData {
  id: string;
  fileName: string;
  dateImported: string | Date; // Allow both string and Date
  rowCount: number;
  columnCount: number;
  fileType: string;
  headers: string[];
  data: any[][];
}

export interface SavedTemplate {
  id: string;
  name: string;
  content: string;
  lastUsed: Date;
  createdAt: Date;
  previewUrl?: string;
}
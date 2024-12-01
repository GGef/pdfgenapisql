import { Storage } from '@google-cloud/storage';
import { cloudConfig } from '../config/cloud';

class CloudStorage {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: cloudConfig.projectId,
    });
    this.bucketName = `${cloudConfig.projectId}-pdfs`;
  }

  async uploadPDF(pdfBlob: Blob, fileName: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(`pdfs/${fileName}`);
    
    const buffer = await pdfBlob.arrayBuffer();
    await file.save(Buffer.from(buffer));
    
    return `https://storage.googleapis.com/${this.bucketName}/pdfs/${fileName}`;
  }

  async deletePDF(fileName: string): Promise<void> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(`pdfs/${fileName}`);
    await file.delete();
  }
}

export const cloudStorage = new CloudStorage();
import { executeQuery } from './db';

const tables = {
  templates: `
    CREATE TABLE IF NOT EXISTS templates (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  
  imports: `
    CREATE TABLE IF NOT EXISTS imports (
      id VARCHAR(36) PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      row_count INT NOT NULL,
      column_count INT NOT NULL,
      headers JSON NOT NULL,
      data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  
  generated_pdfs: `
    CREATE TABLE IF NOT EXISTS generated_pdfs (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      template_id VARCHAR(36) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    )
  `
};

export async function initializeDatabase() {
  try {
    for (const [tableName, query] of Object.entries(tables)) {
      await executeQuery(query);
      console.log(`Table ${tableName} initialized successfully`);
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}
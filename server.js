import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.options('/api/imports', (req, res) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // No content for preflight
});

app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed custom headers
  credentials: true, // Allow credentials (cookies, etc.)
}));
app.use(express.json());

// Routes for Templates
app.get('/api/templates', async (req, res) => {
  try {
    console.log('Attempting to fetch templates from database');
    
    // Verify database connection
    const databaseTest = await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection verified');

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('Templates found:', templates);
    
    if (!templates || templates.length === 0) {
      console.log('No templates found in database');
      
      // If no templates, try to insert a default template
      const defaultTemplate = await prisma.template.create({
        data: {
          name: 'Default Template',
          content: 'Default template content',
        }
      });
      
      console.log('Created default template:', defaultTemplate);
      
      // Refetch templates
      const updatedTemplates = await prisma.template.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      return res.json({
        success: true,
        data: updatedTemplates,
      });
    }

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error in /api/templates route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch templates',
    });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const { name, content } = req.body;
    
    console.log('Creating template with data:', req.body);
    
    const template = await prisma.template.create({
      data: {
        name: name || 'Unnamed Template',
        content: content || 'Default template content',
      }
    });
    
    console.log('Created template:', template);
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create template'
    });
  }
});

app.put('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;
    const template = await prisma.template.update({
      where: { id },
      data: {
        name,
        content,
        lastUsed: new Date(),
      },
    });
    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update template',
    });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.template.delete({
      where: { id },
    });
    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template',
    });
  }
});

// Routes for Imports
app.get('/api/imports', async (req, res) => {
  try {
    const imports = await prisma.import.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: imports,
    });
  } catch (error) {
    console.error('Error fetching imports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch imports',
    });
  }
});

app.get('/api/imports/:id', async (req, res) => {
  try {
    const importData = await prisma.import.findUnique({
      where: { id: req.params.id }
    });

    if (!importData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Import not found' 
      });
    }

    res.json({
      success: true,
      data: importData
    });
  } catch (error) {
    console.error('Error fetching import:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch import' 
    });
  }
});

app.post('/api/imports', async (req, res) => {
  try {
    console.log('Request body:', req.body);

    const importData = await prisma.import.create({
      data: req.body,
    });

    res.status(201).json(importData);
  } catch (error) {
    console.error('Error creating import:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create import', details: error.message });
  }
});

app.delete('/api/imports/:id', async (req, res) => {
  const response = await importController.deleteImport(req.params.id);
  if (response.success) {
    res.sendStatus(204);
  } else {
    res.status(500).json({ error: response.error });
  }
});

// PDF routes
app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfs = await prisma.pdf.findMany({
      include: {
        template: true,
        import: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pdfs);
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

app.post('/api/pdfs', async (req, res) => {
  try {
    const pdf = await prisma.pdf.create({
      data: req.body,
      include: {
        template: true,
        import: true,
      },
    });
    res.json(pdf);
  } catch (error) {
    console.error('Error creating PDF:', error);
    res.status(500).json({ error: 'Failed to create PDF' });
  }
});

app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    await prisma.pdf.delete({
      where: { id: req.params.id },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connection...');
  await prisma.$disconnect();
  process.exit(0);
});
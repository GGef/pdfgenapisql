import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.options('*', cors());

app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed custom headers
  credentials: true, // Allow credentials (cookies, etc.)
}));

// Middleware to ensure JSON responses
const jsonMiddleware = (req, res, next) => {
  res.sendJson = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      data: data
    });
  };
  next();
};
app.use(jsonMiddleware);

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
      
      return res.sendJson(updatedTemplates);
    }

    res.sendJson(templates);
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
    const { name, content, previewUrl } = req.body;
    
    // Input validation
    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name and content are required'
      });
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
        previewUrl,
        createdAt: new Date(),
        lastUsed: new Date()
      }
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
});

app.put('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, previewUrl, lastUsed } = req.body;
    
    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(content && { content }),
        ...(previewUrl && { previewUrl }),
        lastUsed: lastUsed || new Date(),
      },
    });

    // Consistent JSON response
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update template',
    });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.template.delete({
      where: { id },
    });
    res.sendJson({ success: true });
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
    res.sendJson(imports);
  } catch (error) {
    console.error('Error fetching imports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch imports',
    });
  }
});

app.get('/api/imports/:id', async (req, res) => {
  const response = await importController.getImportById(req.params.id);
  if (response.success) {
    res.sendJson(response.data);
  } else {
    res.status(404).json({ error: response.error });
  }
});

app.post('/api/imports', async (req, res) => {
  try {
    console.log('Request body:', req.body);

    const importData = await prisma.import.create({
      data: req.body,
    });

    res.status(201).sendJson(importData);
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
    res.sendJson(pdfs);
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
    res.sendJson(pdf);
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
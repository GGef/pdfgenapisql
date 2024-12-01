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

// Template routes
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { lastUsed: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const template = await prisma.template.create({
      data: {
        ...req.body,
        lastUsed: new Date(),
      },
    });
    res.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

app.put('/api/templates/:id', async (req, res) => {
  try {
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        lastUsed: new Date(),
      },
    });
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    await prisma.template.delete({
      where: { id: req.params.id },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
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
  const response = await importController.getImportById(req.params.id);
  if (response.success) {
    res.json(response.data);
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
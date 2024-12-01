# Data Import Manager

A modern web application for managing data imports with support for file uploads, data visualization, and PDF generation.

## Features

- 📊 Data Import Management
- 📁 File Upload Support
- 📑 PDF Generation
- 🔍 Data Visualization
- 🔄 Real-time Updates
- 🎯 TypeScript Support
- 🗃️ MySQL Database Integration

## Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Zustand (State Management)
  - Tailwind CSS

- **Backend:**
  - Node.js
  - Express
  - Prisma ORM
  - MySQL

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-6
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` in `.env` with your MySQL connection string:
     ```
     DATABASE_URL="mysql://user:password@localhost:3306/database_name"
     ```

4. **Initialize Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   # Start the backend server
   npm run server

   # In a new terminal, start the frontend
   npm run dev
   ```

## Project Structure

```
project-6/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── api/              # API related code
│   │   ├── client.ts
│   │   ├── controllers/
│   │   └── types.ts
│   ├── pages/           # React components/pages
│   ├── services/        # Service layer
│   ├── stores/          # Zustand stores
│   └── types/           # TypeScript types
├── server.js            # Express server
└── package.json
```

## Database Schema

### Import Model
```prisma
model Import {
  id           String   @id @default(uuid())
  fileName     String
  fileType     String
  rowCount     Int
  columnCount  Int
  headers      String   @db.LongText
  data         String   @db.LongText
  createdAt    DateTime @default(now())
  dateImported DateTime
  pdfs         PDF[]
}
```

### PDF Model
```prisma
model PDF {
  id         String   @id @default(uuid())
  name       String
  templateId String
  importId   String
  filePath   String
  createdAt  DateTime @default(now())
  import     Import   @relation(fields: [importId], references: [id])
  template   Template @relation(fields: [templateId], references: [id])
}
```

## API Endpoints

### Imports
- `GET /api/imports` - Get all imports
- `GET /api/imports/:id` - Get import by ID
- `POST /api/imports` - Create new import
- `DELETE /api/imports/:id` - Delete import

## State Management

The application uses Zustand for state management. The main stores are:
- `importStore` - Manages import data and operations
- `templateStore` - Manages PDF templates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

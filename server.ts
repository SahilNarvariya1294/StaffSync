import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { dbManager } from './server/config/db.js';
import { initializeSeedData } from './server/seed/seedData.js';
import authRoutes from './server/routes/authRoutes.js';
import employeeRoutes from './server/routes/employeeRoutes.js';
import leaveRoutes from './server/routes/leaveRoutes.js';
import attendanceRoutes from './server/routes/attendanceRoutes.js';
import announcementRoutes from './server/routes/announcementRoutes.js';
import trainingRoutes from './server/routes/trainingRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database connection & seed initialization
  await dbManager.connect();
  await initializeSeedData();

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'StaffSync HRMS API',
      database: dbManager.isConnected ? 'MongoDB (Mongoose)' : 'Embedded Persistent Document Store',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/training', trainingRoutes);

  // Development vs Production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StaffSync Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting StaffSync server:', err);
});

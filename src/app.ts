import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes';
import { requestLogger, notFoundHandler, errorHandler } from './middleware';

// ─── Create Express Application ─────────────────────────────
const app: Application = express();

// ─── Global Middleware ───────────────────────────────────────
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── Root ────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Task Management API',
    version: '1.0.0',
    docs: '/health',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      projects: '/api/projects',
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 404 & Error Handlers (must be last) ─────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

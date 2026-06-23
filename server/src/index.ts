import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { initFirebase } from './integrations/firestore';

// Init Firebase before routes
initFirebase();

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString(), demoMode: config.demoMode });
});

// API routes (will be added in subsequent tasks)
import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import tasksRouter from './routes/tasks';
import confirmationsRouter from './routes/confirmations';
import workspaceRouter from './routes/workspace';
import paymentsRouter from './routes/payments';
import sweepRouter from './routes/sweep';
import snapRouter from './routes/snap';
import demoRouter from './routes/demo';

app.use('/api/auth', authRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/confirmations', confirmationsRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/sweep', sweepRouter);
app.use('/api/snap', snapRouter);
app.use('/api/demo', demoRouter);

// Serve built frontend in production
if (config.nodeEnv === 'production') {
  const webDist = path.join(__dirname, '../web/dist'); // __dirname is dist/, web/dist is one level up in Docker
  app.use(express.static(webDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
});

export default app;

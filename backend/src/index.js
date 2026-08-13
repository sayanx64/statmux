import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import statsRouter from './routes/stats.js';
import refreshRouter from './routes/refresh.js';
import profileRouter from './routes/profile.js';
import internalCronRouter from './routes/internalCron.js';
import publicRouter from './routes/public.js';
import digestRouter from './routes/digest.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:3001',       // Next.js dev server
  'http://localhost:3000',       // in case frontend is run on same port
  process.env.FRONTEND_URL,     // set this in prod (.env)
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server requests (no origin header) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'coding-stats-backend is running' });
});

// Public unauthenticated routes
app.use('/api/public', publicRouter);
app.use('/api/digest', digestRouter);

// IMPORTANT: /api/stats/refresh must be mounted BEFORE /api/stats.
// Express matches middleware top-down. If /api/stats came first, every
// request to /api/stats/refresh would hit statsRouter's requireAuth,
// fail to match any route inside it (statsRouter only defines '/'), fall
// through, and THEN reach refreshRouter — running requireAuth twice per
// request. Mounting the more specific path first avoids that.
app.use('/api/stats/refresh', refreshRouter);
app.use('/api/stats', statsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/internal', internalCronRouter);

// No in-process cron.schedule here anymore. Free-tier hosts (Render,
// Railway, Fly.io) all stop the process after a period of no incoming
// HTTP traffic, which would silently kill any internal timer. Instead,
// an external scheduler (GitHub Actions, see .github/workflows/) sends a
// real HTTP request to /api/internal/refresh-all on a schedule — that
// request itself is what wakes the process up, so scheduling no longer
// depends on the app staying alive on its own.

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
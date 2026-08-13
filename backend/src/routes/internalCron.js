import { Router } from 'express';
import { refreshAllUsers } from '../scripts/refreshAllUsers.js';
import { sendAllWeeklyDigests } from '../scripts/sendWeeklyDigests.js';

const router = Router();

// Middleware to check shared cron secret
function requireCronSecret(req, res, next) {
  const secret = req.headers['x-cron-secret'];
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Invalid or missing cron secret' });
  }
  next();
}

// POST /api/internal/refresh-all
// Scheduled stats sync across all registered profiles
router.post('/refresh-all', requireCronSecret, async (req, res) => {
  try {
    await refreshAllUsers();
    res.json({ status: 'ok', message: 'Refresh completed' });
  } catch (err) {
    console.error('Internal cron refresh failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/internal/send-digests
// Scheduled weekly digest distribution to opted-in users
router.post('/send-digests', requireCronSecret, async (req, res) => {
  try {
    const summary = await sendAllWeeklyDigests();
    res.json(summary);
  } catch (err) {
    console.error('Internal cron send-digests failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
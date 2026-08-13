import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { requireAuth } from '../lib/requireAuth.js';

const router = Router();

// Every route below runs requireAuth first. If the token is missing or
// invalid, requireAuth stops the request before it ever reaches our logic.
router.use(requireAuth);

// GET /api/stats
// Only returns rows belonging to the verified user (req.user.id).
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('stats_snapshot')
    .select('id, value, meta, recorded_at, sources(name, display_name)')
    .eq('user_id', req.user.id)
    .order('recorded_at', { ascending: false });

  if (error) {
    console.error('GET /api/stats error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// POST /api/stats
// Body: { source: "leetcode", value: number, meta?: object }
// user_id always comes from the verified token (req.user.id), never from
// the request body — that's the whole point of requireAuth.
router.post('/', async (req, res) => {
  const { source, value, meta } = req.body;

  if (!source || value === undefined) {
    return res.status(400).json({ error: 'source and value are required' });
  }

  const { data: sourceRow, error: sourceError } = await supabase
    .from('sources')
    .select('id')
    .eq('name', source)
    .single();

  if (sourceError || !sourceRow) {
    return res.status(400).json({ error: `Unknown source: ${source}` });
  }

  const { data, error } = await supabase
    .from('stats_snapshot')
    .insert([{ source_id: sourceRow.id, user_id: req.user.id, value, meta: meta ?? {} }])
    .select('id, value, meta, recorded_at, sources(name, display_name)');

  if (error) {
    console.error('POST /api/stats error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data[0]);
});

// DELETE /api/stats
// Deletes all stats snapshots belonging to the verified user.
router.delete('/', async (req, res) => {
  const { error } = await supabase
    .from('stats_snapshot')
    .delete()
    .eq('user_id', req.user.id);

  if (error) {
    console.error('DELETE /api/stats error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ status: 'ok', message: 'All synced stats deleted successfully' });
});

export default router;
import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { requireAuth } from '../lib/requireAuth.js';
import {
  fetchGithubStats,
  fetchCodeforcesRating,
  fetchLeetcodeSolved,
  getSourceId,
} from '../lib/fetchers.js';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('POST /api/stats/refresh profile lookup error:', profileError.message);
    return res.status(500).json({ error: profileError.message });
  }

  if (!profile) {
    return res.status(400).json({ error: 'No profile found. Save your handles first.' });
  }

  const results = [];

  if (profile.github_username) {
    try {
      const stats = await fetchGithubStats(profile.github_username);
      const sourceId = await getSourceId('github');
      const { data } = await supabase.from('stats_snapshot').insert({
        source_id: sourceId,
        user_id: req.user.id,
        value: stats.value,
        meta: stats.meta,
      }).select();
      results.push({ source: 'github', ...data[0] });
    } catch (e) {
      results.push({ source: 'github', error: e.message });
    }
  }

  if (profile.codeforces_handle) {
    try {
      const stats = await fetchCodeforcesRating(profile.codeforces_handle);
      const sourceId = await getSourceId('codeforces');
      const { data } = await supabase.from('stats_snapshot').insert({
        source_id: sourceId,
        user_id: req.user.id,
        value: stats.value,
        meta: stats.meta,
      }).select();
      results.push({ source: 'codeforces', ...data[0] });
    } catch (e) {
      results.push({ source: 'codeforces', error: e.message });
    }
  }

  if (profile.leetcode_username) {
    try {
      const stats = await fetchLeetcodeSolved(profile.leetcode_username);
      const sourceId = await getSourceId('leetcode');
      const { data } = await supabase.from('stats_snapshot').insert({
        source_id: sourceId,
        user_id: req.user.id,
        value: stats.value,
        meta: stats.meta,
      }).select();
      results.push({ source: 'leetcode', ...data[0] });
    } catch (e) {
      results.push({ source: 'leetcode', error: e.message });
    }
  }

  res.json({ refreshed: results });
});

export default router;
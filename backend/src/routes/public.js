import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';

const router = Router();

/**
 * Helper to fetch and sanitize public profile data by GitHub username.
 * Returns null if the user does not exist in profiles.
 * Strictly NEVER exposes user_id, email, or sensitive account fields.
 */
async function fetchPublicProfileData(rawUsername) {
  const cleanUsername = rawUsername?.trim();
  if (!cleanUsername) return null;

  // 1. Look up profile by github_username (case-insensitive)
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('user_id, github_username, codeforces_handle, leetcode_username')
    .ilike('github_username', cleanUsername)
    .limit(1);

  const profile = profiles?.[0];
  if (profileErr || !profile) return null;

  // 2. Fetch public user metadata (display name and avatar only)
  let displayName = profile.github_username;
  let avatarUrl = null;

  try {
    const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
    if (userData?.user) {
      const meta = userData.user.user_metadata || {};
      displayName = meta.full_name || meta.name || profile.github_username;
      avatarUrl = meta.avatar_url || null;
    }
  } catch (err) {
    console.error('Public profile metadata fetch fallback:', err.message);
  }

  // 3. Fetch latest stats snapshots for this user
  const { data: snapshots, error: snapErr } = await supabase
    .from('stats_snapshot')
    .select('id, value, meta, recorded_at, sources(name, display_name)')
    .eq('user_id', profile.user_id)
    .order('recorded_at', { ascending: false });

  if (snapErr) {
    console.error('Public profile snapshots fetch error:', snapErr.message);
  }

  // 4. Resolve latest per source
  const latest = {};
  let lastSyncedAt = null;

  for (const s of (snapshots || [])) {
    const src = s.sources?.name;
    if (!src) continue;
    if (!latest[src]) {
      latest[src] = s;
      if (!lastSyncedAt || s.recorded_at > lastSyncedAt) {
        lastSyncedAt = s.recorded_at;
      }
    }
  }

  // 5. Compute Code Health Score
  const ghMeta = latest.github?.meta || {};
  const cfMeta = latest.codeforces?.meta || {};
  const lcMeta = latest.leetcode?.meta || {};

  const contributionWeeks = ghMeta.contributionWeeks || [];
  const weeksActive = contributionWeeks.filter((w) => w > 0).length;
  const consistencyScore = contributionWeeks.length
    ? Math.min(100, Math.round((weeksActive / contributionWeeks.length) * 100 * 1.2))
    : 0;

  let diffScore = 0;
  if (lcMeta.byDifficulty) {
    const easy = lcMeta.byDifficulty.find((d) => d.difficulty === 'Easy')?.count || 0;
    const medium = lcMeta.byDifficulty.find((d) => d.difficulty === 'Medium')?.count || 0;
    const hard = lcMeta.byDifficulty.find((d) => d.difficulty === 'Hard')?.count || 0;
    diffScore = Math.min(100, Math.round((easy + medium * 3 + hard * 5) / 5));
  }

  const repoScore = Math.min(100, (ghMeta.repos || 0) * 4);
  const contestScore = Math.min(100, Math.round((latest.codeforces?.value || 0) / 15));

  const scores = {
    consistency: consistencyScore || 10,
    problemDifficulty: diffScore || 10,
    repoQuality: repoScore || 10,
    contestActivity: contestScore || 10,
  };

  const totalHealth = Math.round(
    (scores.consistency + scores.problemDifficulty + scores.repoQuality + scores.contestActivity) / 4,
  );
  const grade = totalHealth >= 80 ? 'A' : totalHealth >= 60 ? 'B' : totalHealth >= 40 ? 'C' : 'D';

  // 6. Return sanitised public payload
  return {
    username: profile.github_username,
    display_name: displayName,
    avatar_url: avatarUrl,
    handles: {
      github: profile.github_username || null,
      codeforces: profile.codeforces_handle || null,
      leetcode: profile.leetcode_username || null,
    },
    stats: {
      github: latest.github
        ? {
            value: latest.github.value,
            repos: ghMeta.repos ?? null,
            followers: ghMeta.followers ?? null,
            recorded_at: latest.github.recorded_at,
          }
        : null,
      codeforces: latest.codeforces
        ? {
            value: latest.codeforces.value,
            rank: cfMeta.rank ?? null,
            maxRating: cfMeta.maxRating ?? null,
            recorded_at: latest.codeforces.recorded_at,
          }
        : null,
      leetcode: latest.leetcode
        ? {
            value: latest.leetcode.value,
            byDifficulty: lcMeta.byDifficulty ?? null,
            recorded_at: latest.leetcode.recorded_at,
          }
        : null,
    },
    codeHealth: {
      total: totalHealth,
      grade,
      scores,
    },
    last_synced_at: lastSyncedAt,
  };
}

// GET /api/public/compare/:username1/:username2
// Public unauthenticated comparison between two profiles.
// Runs lookups in parallel and returns 400 for same username or 404 if either fails.
router.get('/compare/:username1/:username2', async (req, res) => {
  const u1 = req.params.username1?.trim();
  const u2 = req.params.username2?.trim();

  if (!u1 || !u2) {
    return res.status(400).json({ error: 'Both usernames are required for comparison' });
  }

  if (u1.toLowerCase() === u2.toLowerCase()) {
    return res.status(400).json({
      error: 'Cannot compare a user with themselves. Please provide two distinct usernames.',
    });
  }

  // Fetch both in parallel
  const [user1Data, user2Data] = await Promise.all([
    fetchPublicProfileData(u1),
    fetchPublicProfileData(u2),
  ]);

  if (!user1Data && !user2Data) {
    return res.status(404).json({
      error: `Neither '${u1}' nor '${u2}' was found on statmux.`,
    });
  }

  if (!user1Data) {
    return res.status(404).json({
      error: `User '${u1}' was not found on statmux.`,
    });
  }

  if (!user2Data) {
    return res.status(404).json({
      error: `User '${u2}' was not found on statmux.`,
    });
  }

  res.json({
    user1: user1Data,
    user2: user2Data,
  });
});

// GET /api/public/:username
// Public unauthenticated lookup for a single profile.
router.get('/:username', async (req, res) => {
  const rawUsername = req.params.username?.trim();
  if (!rawUsername) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const data = await fetchPublicProfileData(rawUsername);
  if (!data) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(data);
});

export default router;

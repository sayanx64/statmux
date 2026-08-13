// Runs on a timer (see index.js cron.schedule) or standalone via:
// node src/scripts/refreshAllUsers.js
// Fetches stats for EVERY user who has a profile, using the service role
// key directly: this is trusted server-side code, not a per-user request.

import { supabase } from '../lib/supabaseClient.js';
import {
  fetchGithubStats,
  fetchCodeforcesRating,
  fetchLeetcodeSolved,
  getSourceId,
} from '../lib/fetchers.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function refreshUser(profile, sourceIds) {
  const results = [];
  const { user_id, github_username, codeforces_handle, leetcode_username } = profile;

  if (github_username) {
    try {
      const stats = await fetchGithubStats(github_username);
      const { data, error } = await supabase.from('stats_snapshot').insert({
        source_id: sourceIds.github, user_id, value: stats.value, meta: stats.meta,
      }).select();
      results.push({ source: 'github', ok: !error, id: data?.[0]?.id });
    } catch (e) {
      results.push({ source: 'github', ok: false, error: e.message });
    }
  }

  await delay(1000); // avoid hitting GitHub's rate limit

  if (codeforces_handle) {
    try {
      const stats = await fetchCodeforcesRating(codeforces_handle);
      const { data, error } = await supabase.from('stats_snapshot').insert({
        source_id: sourceIds.codeforces, user_id, value: stats.value, meta: stats.meta,
      }).select();
      results.push({ source: 'codeforces', ok: !error, id: data?.[0]?.id });
    } catch (e) {
      results.push({ source: 'codeforces', ok: false, error: e.message });
    }
  }

  await delay(1000); // avoid hitting Codeforces's rate limit

  if (leetcode_username) {
    try {
      const stats = await fetchLeetcodeSolved(leetcode_username);
      const { data, error } = await supabase.from('stats_snapshot').insert({
        source_id: sourceIds.leetcode, user_id, value: stats.value, meta: stats.meta,
      }).select();
      results.push({ source: 'leetcode', ok: !error, id: data?.[0]?.id });
    } catch (e) {
      results.push({ source: 'leetcode', ok: false, error: e.message });
    }
  }

  return results;
}

// Exported so index.js's cron job can call this directly, fresh, every
// time it fires. (Previously this ran via dynamic import() as a side
// effect, which only works once per process due to ES module caching —
// every midnight after the first was silently a no-op.)
export async function refreshAllUsers() {
  const [github, codeforces, leetcode] = await Promise.all([
    getSourceId('github'), getSourceId('codeforces'), getSourceId('leetcode'),
  ]);
  const sourceIds = { github, codeforces, leetcode };

  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  if (!profiles?.length) {
    console.log('No profiles found. Nothing to refresh.');
    return;
  }

  console.log(`Refreshing stats for ${profiles.length} user(s)...`);

  for (const profile of profiles) {
    const results = await refreshUser(profile, sourceIds);
    console.log(
      `User ${profile.user_id.slice(0, 8)}...`,
      results.map((r) => `${r.source}:${r.ok ? 'ok' : 'fail'}`).join(' ')
    );
  }

  console.log('Done.');
}

// Only auto-run when this file is executed directly, e.g.
// `node src/scripts/refreshAllUsers.js` — not when imported as a module
// (like index.js does for the cron job).
if (import.meta.url === `file://${process.argv[1]}`) {
  refreshAllUsers().catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}
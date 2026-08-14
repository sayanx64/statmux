/*

Shared external-API fetch functions, used by both the manual refresh
route (src/routes/refresh.js) and the cron batch job
(src/scripts/refreshAllUsers.js). One source of truth, so a fix or a
change to how we read GitHub/Codeforces/LeetCode only needs to happen
once. 

*/

import { supabase } from './supabaseClient.js';

function getGithubHeaders() {
  const headers = {
    'User-Agent': 'statmux-app/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchGithubStats(username) {
  const headers = getGithubHeaders();
  const res = await fetch(`https://api.github.com/users/${username}`, { headers });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitHub user "${username}" not found. Check your username in Profile settings.`);
    }
    if (res.status === 403 || res.status === 429) {
      throw new Error('GitHub API rate limit reached. Add GITHUB_TOKEN to backend environment for 5,000 req/hr.');
    }
    throw new Error(`GitHub API error (${res.status}). Please try again later.`);
  }
  const data = await res.json();
  
  // 1. Fetch contribution calendar
  let contributionWeeks = [];
  try {
    const calRes = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { 'User-Agent': 'statmux-app/1.0' },
    });
    if (calRes.ok) {
      const html = await calRes.text();
      const matches = [...html.matchAll(/(\d+|No) contributions on (.*?)\./g)];
      const days = matches.map(m => m[1] === 'No' ? 0 : parseInt(m[1]));
      // Chunk by 7 (weeks)
      for(let i = 0; i < days.length; i += 7) {
        contributionWeeks.push(days.slice(i, i+7).reduce((a,b)=>a+b, 0));
      }
      // Take last 24 weeks
      contributionWeeks = contributionWeeks.slice(-24);
    }
  } catch (e) {
    console.error('Error fetching GH contributions:', e);
  }

  // 2. Fetch recent public events
  let recentEvents = [];
  try {
    const evRes = await fetch(`https://api.github.com/users/${username}/events/public`, { headers });
    if (evRes.ok) {
      const events = await evRes.json();
      recentEvents = events
        .filter(e => e.type === 'PushEvent' || e.type === 'PullRequestEvent')
        .slice(0, 5)
        .map(e => ({
          id: e.id,
          platform: 'github',
          type: e.type === 'PushEvent' ? 'commit' : 'pr',
          title: e.type === 'PushEvent' ? `Pushed to ${e.repo.name}` : `Opened PR in ${e.repo.name}`,
          timestamp: e.created_at,
          link: `https://github.com/${e.repo.name}`,
        }));
    }
  } catch (e) {
    console.error('Error fetching GH events:', e);
  }

  return {
    value: data.public_repos + data.public_gists,
    meta: { 
      followers: data.followers, 
      repos: data.public_repos, 
      username,
      contributionWeeks,
      recentEvents
    },
  };
}

export async function fetchCodeforcesRating(handle) {
  const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
  if (!res.ok) throw new Error(`CF API ${res.status}`);
  const data = await res.json();
  if (data.status !== 'OK') throw new Error(data.comment);
  const u = data.result[0];

  // Fetch recent activity
  let recentEvents = [];
  try {
    const statRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=20`);
    if (statRes.ok) {
      const statData = await statRes.json();
      if (statData.status === 'OK') {
        recentEvents = statData.result
          .filter(s => s.verdict === 'OK')
          .slice(0, 5)
          .map(s => ({
            id: s.id.toString(),
            platform: 'codeforces',
            type: 'submission',
            title: `Solved ${s.problem.name}`,
            timestamp: new Date(s.creationTimeSeconds * 1000).toISOString(),
            link: `https://codeforces.com/contest/${s.problem.contestId}/problem/${s.problem.index}`,
          }));
      }
    }
  } catch (e) {
    console.error('Error fetching CF events:', e);
  }

  return {
    value: u.rating ?? 0,
    meta: { 
      rank: u.rank, 
      maxRating: u.maxRating, 
      handle,
      recentEvents
    },
  };
}

export async function fetchLeetcodeSolved(username) {
  const query = `query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats { acSubmissionNum { difficulty count } }
    }
  }`;

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!res.ok) throw new Error(`LeetCode API ${res.status}`);
  const data = await res.json();

  if (!data.data?.matchedUser) {
    throw new Error('LeetCode user not found or API changed');
  }

  const all = data.data.matchedUser.submitStats.acSubmissionNum.find(
    (s) => s.difficulty === 'All'
  );

  return {
    value: all?.count ?? 0,
    meta: { username, byDifficulty: data.data.matchedUser.submitStats.acSubmissionNum },
  };
}

export async function getSourceId(name) {
  const { data, error } = await supabase.from('sources').select('id').eq('name', name).single();
  if (error) throw error;
  return data.id;
}
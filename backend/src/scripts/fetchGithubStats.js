// Fetches star count for a GitHub repo and POSTs it to our own /api/stats.
// Run with: node src/scripts/fetchGithubStats.js

const REPO = 'curtosis-org/phub-cli';
const API_BASE = 'http://localhost:3000';

async function fetchGithubStars() {
  const res = await fetch(`https://api.github.com/repos/${REPO}`);

  if (!res.ok) {
    throw new Error(`GitHub API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
  };
}

async function postToOwnApi(stats) {
  const res = await fetch(`${API_BASE}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'github',
      value: stats.stars,
      meta: { repo: REPO, forks: stats.forks, openIssues: stats.openIssues },
    }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(`Our API returned ${res.status}: ${JSON.stringify(body)}`);
  }

  return res.json();
}

async function main() {
  console.log(`Fetching stats for ${REPO}...`);
  const stats = await fetchGithubStars();
  console.log('GitHub says:', stats);

  console.log('Posting to our API...');
  const saved = await postToOwnApi(stats);
  console.log('Saved:', saved);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
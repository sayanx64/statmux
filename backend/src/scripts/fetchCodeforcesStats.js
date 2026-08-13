// Fetches Codeforces rating and posts it to our own /api/stats.
// Run with: node src/scripts/fetchCodeforcesStats.js

const HANDLE = 'sayan12428'; // <-- change this to your real Codeforces handle
const API_BASE = 'http://localhost:3000';

async function fetchCodeforcesRating() {
  const res = await fetch(`https://codeforces.com/api/user.info?handles=${HANDLE}`);

  if (!res.ok) {
    throw new Error(`Codeforces API returned ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  // Codeforces wraps results in { status, result: [...] } — check status
  // explicitly, since a bad handle still returns HTTP 200 with an error inside.
  if (data.status !== 'OK') {
    throw new Error(`Codeforces API error: ${data.comment ?? 'unknown error'}`);
  }

  const user = data.result[0];
  return {
    rating: user.rating ?? 0,
    maxRating: user.maxRating ?? 0,
    rank: user.rank ?? 'unrated',
  };
}

async function postToOwnApi(stats) {
  const res = await fetch(`${API_BASE}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'codeforces',
      value: stats.rating,
      meta: { handle: HANDLE, maxRating: stats.maxRating, rank: stats.rank },
    }),
  });

  if (!res.ok) {
    const body = await res.json();
    throw new Error(`Our API returned ${res.status}: ${JSON.stringify(body)}`);
  }

  return res.json();
}

async function main() {
  console.log(`Fetching Codeforces stats for ${HANDLE}...`);
  const stats = await fetchCodeforcesRating();
  console.log('Codeforces says:', stats);

  console.log('Posting to our API...');
  const saved = await postToOwnApi(stats);
  console.log('Saved:', saved);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
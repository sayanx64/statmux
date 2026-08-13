import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { supabase } from './supabaseClient.js';

// Base URL for links in email
const BASE_URL = process.env.FRONTEND_URL || 'https://statmux.sayan.cyou';
const SMTP_USER = process.env.SMTP_USER || 'statmux@sayan.cyou';

/**
 * Generate a cryptographically signed unsubscribe token for a user.
 */
export function generateUnsubscribeToken(userId) {
  const secret = process.env.CRON_SECRET || 'statmux-digest-secret';
  return crypto.createHmac('sha256', secret).update(`${userId}:unsubscribe`).digest('hex');
}

/**
 * Verify an unsubscribe token for a user.
 */
export function verifyUnsubscribeToken(userId, token) {
  if (!userId || !token) return false;
  const expected = generateUnsubscribeToken(userId);
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Create a nodemailer transport from SMTP environment variables.
 */
export function getMailTransport() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[nodemailer] SMTP credentials not fully set in environment (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }

  return nodemailer.createTransport({
    host: host || 'localhost',
    port,
    secure: port === 465,
    auth: {
      user: user || '',
      pass: pass || '',
    },
  });
}

/**
 * Compute Code Health scores & letter grade from snapshot objects.
 */
export function computeHealth(ghSnap, cfSnap, lcSnap) {
  const ghMeta = ghSnap?.meta || {};
  const cfMeta = cfSnap?.meta || {};
  const lcMeta = lcSnap?.meta || {};

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
  const contestScore = Math.min(100, Math.round((cfSnap?.value || 0) / 15));

  const scores = {
    consistency: consistencyScore || 10,
    problemDifficulty: diffScore || 10,
    repoQuality: repoScore || 10,
    contestActivity: contestScore || 10,
  };

  const total = Math.round(
    (scores.consistency + scores.problemDifficulty + scores.repoQuality + scores.contestActivity) / 4,
  );
  const grade = total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : 'D';
  return { total, grade, scores };
}

/**
 * Compute week-over-week deltas for a user from stats_snapshot.
 * Skips gracefully if insufficient snapshot history exists.
 */
export async function computeUserWeeklyDigest(userId) {
  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, github_username, codeforces_handle, leetcode_username')
    .eq('user_id', userId)
    .maybeSingle();

  const username = profile?.github_username || 'developer';

  // 2. Fetch all snapshots for this user ordered descending
  const { data: snapshots, error: snapErr } = await supabase
    .from('stats_snapshot')
    .select('id, value, meta, recorded_at, sources(name)')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false });

  if (snapErr || !snapshots || snapshots.length === 0) {
    return { shouldSend: false, reason: 'no_snapshots' };
  }

  // 3. Group by source
  const bySource = { github: [], codeforces: [], leetcode: [] };
  for (const s of snapshots) {
    const src = s.sources?.name;
    if (src && bySource[src]) {
      bySource[src].push(s);
    }
  }

  // Current (latest) per source
  const currGh = bySource.github[0] || null;
  const currCf = bySource.codeforces[0] || null;
  const currLc = bySource.leetcode[0] || null;

  // Previous (~7 days ago or next available snapshot)
  const sevenDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
  function getPrevSnapshot(list) {
    if (!list || list.length === 0) return null;
    // Find first snapshot older than 6 days
    const older = list.find((s) => new Date(s.recorded_at).getTime() <= sevenDaysAgo);
    if (older) return older;
    // If only 2+ snapshots exist, use second newest as baseline
    if (list.length > 1) return list[1];
    return null;
  }

  const prevGh = getPrevSnapshot(bySource.github);
  const prevCf = getPrevSnapshot(bySource.codeforces);
  const prevLc = getPrevSnapshot(bySource.leetcode);

  // If user has only 1 snapshot across all platforms with no prior history, skip
  if (!prevGh && !prevCf && !prevLc) {
    return { shouldSend: false, reason: 'insufficient_history' };
  }

  // Calculate Deltas
  const currHealth = computeHealth(currGh, currCf, currLc);
  const prevHealth = computeHealth(prevGh, prevCf, prevLc);
  const deltaHealth = currHealth.total - prevHealth.total;

  // GitHub Deltas
  const currGhRepos = currGh?.value ?? 0;
  const prevGhRepos = prevGh?.value ?? currGhRepos;
  const deltaGhRepos = currGhRepos - prevGhRepos;
  const ghWeeks = currGh?.meta?.contributionWeeks || [];
  const weeklyContributions = ghWeeks.length > 0 ? ghWeeks[ghWeeks.length - 1] : 0;

  // Codeforces Deltas
  const currCfRating = currCf?.value ?? 0;
  const prevCfRating = prevCf?.value ?? currCfRating;
  const deltaCfRating = currCfRating - prevCfRating;
  const cfRank = currCf?.meta?.rank || null;

  // LeetCode Deltas
  const currLcSolved = currLc?.value ?? 0;
  const prevLcSolved = prevLc?.value ?? currLcSolved;
  const deltaLcSolved = currLcSolved - prevLcSolved;

  const currByDiff = currLc?.meta?.byDifficulty || [];
  const prevByDiff = prevLc?.meta?.byDifficulty || [];
  const easyDelta =
    (currByDiff.find((d) => d.difficulty === 'Easy')?.count || 0) -
    (prevByDiff.find((d) => d.difficulty === 'Easy')?.count || 0);
  const medDelta =
    (currByDiff.find((d) => d.difficulty === 'Medium')?.count || 0) -
    (prevByDiff.find((d) => d.difficulty === 'Medium')?.count || 0);
  const hardDelta =
    (currByDiff.find((d) => d.difficulty === 'Hard')?.count || 0) -
    (prevByDiff.find((d) => d.difficulty === 'Hard')?.count || 0);

  // Check if meaningful change occurred
  const hasMeaningfulChange =
    deltaHealth !== 0 ||
    deltaGhRepos !== 0 ||
    weeklyContributions > 0 ||
    deltaCfRating !== 0 ||
    deltaLcSolved !== 0;

  if (!hasMeaningfulChange) {
    return { shouldSend: false, reason: 'no_meaningful_change' };
  }

  return {
    shouldSend: true,
    username,
    profileUrl: `${BASE_URL}/u/${encodeURIComponent(username)}`,
    health: {
      current: currHealth.total,
      grade: currHealth.grade,
      delta: deltaHealth,
    },
    github: {
      repos: currGhRepos,
      deltaRepos: deltaGhRepos,
      weeklyContributions,
    },
    codeforces: {
      rating: currCfRating,
      deltaRating: deltaCfRating,
      rank: cfRank,
    },
    leetcode: {
      solved: currLcSolved,
      deltaSolved: deltaLcSolved,
      easyDelta: Math.max(0, easyDelta),
      medDelta: Math.max(0, medDelta),
      hardDelta: Math.max(0, hardDelta),
    },
  };
}

/**
 * Generate formatted HTML string for the weekly digest email.
 */
export function renderDigestEmailHtml({ username, profileUrl, health, github, codeforces, leetcode, unsubscribeUrl }) {
  const healthDeltaText =
    health.delta > 0
      ? `+${health.delta} pts`
      : health.delta < 0
      ? `${health.delta} pts`
      : `0 pts`;
  const healthDeltaColor = health.delta >= 0 ? '#10b981' : '#f43f5e';

  const cfDeltaText =
    codeforces.deltaRating > 0
      ? `+${codeforces.deltaRating}`
      : codeforces.deltaRating < 0
      ? `${codeforces.deltaRating}`
      : `0`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Weekly statmux Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #121215; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #18181b; border-bottom: 1px solid #27272a;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #10b981; letter-spacing: -0.5px;">
                      [~] statmux
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.5px; background: #27272a; padding: 4px 10px; border-radius: 6px;">
                      Weekly Digest
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 16px 0 4px 0; font-size: 22px; font-weight: 700; color: #ffffff;">
                Weekly Recap for @${username}
              </h1>
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                Here is your multi-platform developer performance summary for this week.
              </p>
            </td>
          </tr>

          <!-- Hero Code Health Score -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #a1a1aa; letter-spacing: 0.5px; margin-bottom: 6px;">
                  Code Health Score
                </div>
                <div style="font-family: monospace; font-size: 40px; font-weight: 800; color: #ffffff; line-height: 1;">
                  ${health.current}<span style="font-size: 18px; color: #71717a; font-weight: 400;">/100</span>
                </div>
                <div style="margin-top: 10px;">
                  <span style="display: inline-block; background: ${health.delta >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${healthDeltaColor}; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 9999px; border: 1px solid ${healthDeltaColor}40;">
                    Grade ${health.grade} &bull; ${healthDeltaText} vs last week
                  </span>
                </div>
              </div>
            </td>
          </tr>

          <!-- 3 Platform Metric Cards -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <!-- GitHub -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 14px 18px;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td>
                            <strong style="color: #f4f4f5; font-size: 14px;">GitHub</strong>
                            <div style="color: #a1a1aa; font-size: 12px; margin-top: 2px;">
                              ${github.weeklyContributions} contributions this week &bull; ${github.repos} repos
                            </div>
                          </td>
                          <td align="right">
                            <span style="font-family: monospace; font-size: 13px; font-weight: 600; color: #10b981;">
                              ${github.deltaRepos > 0 ? `+${github.deltaRepos} repos` : 'Active'}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Codeforces -->
                <tr>
                  <td style="padding-bottom: 12px;">
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 14px 18px;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td>
                            <strong style="color: #f4f4f5; font-size: 14px;">Codeforces</strong>
                            <div style="color: #a1a1aa; font-size: 12px; margin-top: 2px;">
                              Rating: ${codeforces.rating} ${codeforces.rank ? `(${codeforces.rank})` : ''}
                            </div>
                          </td>
                          <td align="right">
                            <span style="font-family: monospace; font-size: 13px; font-weight: 600; color: ${codeforces.deltaRating >= 0 ? '#10b981' : '#f43f5e'};">
                              ${cfDeltaText} rating
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- LeetCode -->
                <tr>
                  <td>
                    <div style="background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 14px 18px;">
                      <table role="presentation" width="100%">
                        <tr>
                          <td>
                            <strong style="color: #f4f4f5; font-size: 14px;">LeetCode</strong>
                            <div style="color: #a1a1aa; font-size: 12px; margin-top: 2px;">
                              ${leetcode.solved} problems solved total
                            </div>
                          </td>
                          <td align="right">
                            <span style="font-family: monospace; font-size: 13px; font-weight: 600; color: #10b981;">
                              +${leetcode.deltaSolved} solved
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 32px 32px 32px;">
              <a href="${profileUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #09090b; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                View Full Live Card &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer & Unsubscribe -->
          <tr>
            <td style="padding: 20px 32px; background-color: #141417; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a;">
                You are receiving this email because you opted into weekly digests on statmux.
              </p>
              <p style="margin: 0; font-size: 11px; color: #71717a;">
                <a href="${unsubscribeUrl}" target="_blank" style="color: #a1a1aa; text-decoration: underline;">
                  One-click Unsubscribe
                </a>
                &bull;
                <a href="${BASE_URL}/terms" target="_blank" style="color: #a1a1aa; text-decoration: underline;">
                  Terms &amp; Privacy
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send weekly digest email to a single user.
 */
export async function sendDigestToUser(userId, emailOverride = null) {
  // 1. Get user email
  let email = emailOverride;
  if (!email) {
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    email = userData?.user?.email;
  }

  if (!email) {
    return { success: false, reason: 'missing_email' };
  }

  // 2. Compute deltas
  const digestData = await computeUserWeeklyDigest(userId);
  if (!digestData.shouldSend) {
    return { success: false, reason: digestData.reason || 'no_meaningful_change' };
  }

  // 3. Generate unsubscribe URL
  const token = generateUnsubscribeToken(userId);
  const unsubscribeUrl = `${BASE_URL}/api/digest/unsubscribe?uid=${encodeURIComponent(userId)}&token=${token}`;

  // 4. Render HTML
  const html = renderDigestEmailHtml({
    ...digestData,
    unsubscribeUrl,
  });

  // 5. Send via nodemailer
  const transporter = getMailTransport();
  await transporter.sendMail({
    from: `"statmux" <${SMTP_USER}>`,
    to: email,
    subject: `Weekly stats digest: Code Health ${digestData.health.current}/100 (${digestData.health.grade})`,
    html,
  });

  // 6. Update last_sent_at in digest_subscriptions or user_metadata
  const now = new Date().toISOString();
  try {
    await supabase
      .from('digest_subscriptions')
      .upsert({ user_id: userId, subscribed: true, last_sent_at: now });
  } catch (err) {
    // If table not migrated yet, update user_metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { last_digest_sent_at: now },
    });
  }

  return { success: true, email, username: digestData.username };
}

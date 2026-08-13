import { supabase } from '../lib/supabaseClient.js';
import { sendDigestToUser } from '../lib/digestEngine.js';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Fetch all opted-in users (subscribed = true).
 * Checks digest_subscriptions table first, falls back to auth user_metadata.
 */
async function getSubscribedUsers() {
  const usersToProcess = [];

  // Try querying digest_subscriptions table
  try {
    const { data: subs, error } = await supabase
      .from('digest_subscriptions')
      .select('user_id, subscribed, last_sent_at')
      .eq('subscribed', true);

    if (!error && subs && subs.length > 0) {
      for (const sub of subs) {
        usersToProcess.push({ userId: sub.user_id });
      }
      return usersToProcess;
    }
  } catch (err) {
    console.log('[digest] digest_subscriptions table query fallback to user_metadata:', err.message);
  }

  // Fallback: check auth.admin.listUsers() for user_metadata.digest_subscribed === true
  try {
    const { data } = await supabase.auth.admin.listUsers();
    for (const u of data?.users || []) {
      if (u.user_metadata?.digest_subscribed === true) {
        usersToProcess.push({ userId: u.id, email: u.email });
      }
    }
  } catch (err) {
    console.error('[digest] Failed to list auth users:', err.message);
  }

  return usersToProcess;
}

/**
 * Execute weekly digest distribution across all opted-in users in batches of 10.
 */
export async function sendAllWeeklyDigests() {
  console.log('[digest] Starting weekly digest run...');
  const subscribedUsers = await getSubscribedUsers();

  console.log(`[digest] Found ${subscribedUsers.length} opted-in user(s).`);

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const results = [];

  const BATCH_SIZE = 10;
  for (let i = 0; i < subscribedUsers.length; i += BATCH_SIZE) {
    const batch = subscribedUsers.slice(i, i + BATCH_SIZE);

    for (const { userId, email } of batch) {
      try {
        const res = await sendDigestToUser(userId, email);
        if (res.success) {
          console.log(`[digest:sent] User ${userId} (${res.username}) -> ${res.email}`);
          sentCount++;
          results.push({ userId, status: 'sent', email: res.email });
        } else {
          console.log(`[digest:skipped] User ${userId} -> reason: ${res.reason}`);
          skippedCount++;
          results.push({ userId, status: 'skipped', reason: res.reason });
        }
      } catch (err) {
        console.error(`[digest:failed] User ${userId} -> error:`, err.message);
        failedCount++;
        results.push({ userId, status: 'failed', error: err.message });
      }

      // Small throttle between individual emails
      await delay(250);
    }

    // Throttle between batches of 10
    if (i + BATCH_SIZE < subscribedUsers.length) {
      await delay(1000);
    }
  }

  console.log(`[digest] Completed run: ${sentCount} sent, ${skippedCount} skipped, ${failedCount} failed.`);
  return {
    status: 'ok',
    totalSubscribers: subscribedUsers.length,
    sentCount,
    skippedCount,
    failedCount,
    results,
  };
}

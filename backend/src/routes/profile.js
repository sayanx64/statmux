import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { requireAuth } from '../lib/requireAuth.js';
import { sendWelcomeEmail } from '../lib/digestEngine.js';

const router = Router();
router.use(requireAuth);

// GET /api/profile
// Returns the logged-in user's stored handles and account details.
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) {
    console.error('GET /api/profile error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  // Check if this is a first-time user who needs welcome email / default digest subscription
  const welcomeSent = req.user.user_metadata?.welcome_sent;
  if (!welcomeSent && req.user.email) {
    const rawName = req.user.user_metadata?.display_name || req.user.user_metadata?.full_name || req.user.user_metadata?.user_name || data?.github_username || '';
    sendWelcomeEmail({ userId: req.user.id, email: req.user.email, displayName: rawName })
      .then(() => console.log(`[welcome-email] Sent to ${req.user.email}`))
      .catch((err) => console.error('[welcome-email] Failed to send:', err.message));

    // Mark welcome_sent: true & digest_subscribed: true
    try {
      await supabase.auth.admin.updateUserById(req.user.id, {
        user_metadata: {
          ...(req.user.user_metadata || {}),
          welcome_sent: true,
          digest_subscribed: true,
        },
      });
    } catch (err) {
      console.error('[welcome-meta] Error updating user metadata:', err.message);
    }

    try {
      await supabase.from('digest_subscriptions')
        .upsert({ user_id: req.user.id, subscribed: true });
    } catch (err) {
      console.log('[digest-sub:init] Table fallback:', err.message);
    }
  }

  const displayName = req.user.user_metadata?.display_name ?? (req.user.user_metadata?.full_name || req.user.user_metadata?.user_name || data?.github_username || '');

  res.json({
    ...(data || { user_id: req.user.id, github_username: null, codeforces_handle: null, leetcode_username: null }),
    email: req.user.email,
    display_name: displayName,
  });
});

// PUT /api/profile
// Body: { github_username?, codeforces_handle?, leetcode_username?, display_name? }
router.put('/', async (req, res) => {
  const { github_username, codeforces_handle, leetcode_username, display_name } = req.body;

  // 1. Update display_name in user metadata if provided
  if (display_name !== undefined) {
    try {
      await supabase.auth.admin.updateUserById(req.user.id, {
        user_metadata: {
          ...(req.user.user_metadata || {}),
          display_name: typeof display_name === 'string' ? display_name.trim() : display_name,
        },
      });
    } catch (err) {
      console.error('[PUT /api/profile] display_name update error:', err.message);
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: req.user.id,
        github_username,
        codeforces_handle,
        leetcode_username,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('PUT /api/profile error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({
    ...data,
    email: req.user.email,
    display_name: display_name !== undefined ? (typeof display_name === 'string' ? display_name.trim() : display_name) : (req.user.user_metadata?.display_name || ''),
  });
});

// GET /api/profile/digest-subscription
// Get weekly digest subscription status for current user (defaults to true for opt-in on signup)
router.get('/digest-subscription', async (req, res) => {
  let subscribed = true;
  let lastSentAt = null;

  try {
    const { data: subData, error: subErr } = await supabase
      .from('digest_subscriptions')
      .select('subscribed, last_sent_at')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!subErr && subData) {
      subscribed = Boolean(subData.subscribed);
      lastSentAt = subData.last_sent_at || null;
      return res.json({ subscribed, last_sent_at: lastSentAt });
    }
  } catch (err) {
    console.log('[digest-sub:get] Table check fallback:', err.message);
  }

  // Fallback to user metadata
  const metaSub = req.user.user_metadata?.digest_subscribed;
  if (metaSub !== undefined) {
    subscribed = Boolean(metaSub);
    lastSentAt = req.user.user_metadata?.last_digest_sent_at || null;
  }

  res.json({ subscribed, last_sent_at: lastSentAt });
});

// PUT /api/profile/digest-subscription
// Body: { subscribed: boolean }
router.put('/digest-subscription', async (req, res) => {
  const isSubscribed = Boolean(req.body.subscribed);

  try {
    await supabase
      .from('digest_subscriptions')
      .upsert(
        {
          user_id: req.user.id,
          subscribed: isSubscribed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  } catch (err) {
    console.log('[digest-sub:put] Table upsert fallback:', err.message);
  }

  try {
    await supabase.auth.admin.updateUserById(req.user.id, {
      user_metadata: {
        ...(req.user.user_metadata || {}),
        digest_subscribed: isSubscribed,
      },
    });
  } catch (err) {
    console.error('[digest-sub:put] User metadata update error:', err.message);
  }

  res.json({ subscribed: isSubscribed });
});

// POST /api/profile/avatar
// Body: { image: "data:image/webp;base64,..." }
router.post('/avatar', async (req, res) => {
  const { image } = req.body;
  if (!image || !image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image data' });
  }

  try {
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'webp';
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${req.user.id}-${Date.now()}.${extension}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('POST /api/profile/avatar error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
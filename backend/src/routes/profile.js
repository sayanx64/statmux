import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { requireAuth } from '../lib/requireAuth.js';

const router = Router();
router.use(requireAuth);

// GET /api/profile
// Returns the logged-in user's stored handles. If they haven't set any up
// yet, this returns null — that's expected for a brand new user.
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle(); // maybeSingle = don't error if zero rows, unlike .single()

  if (error) {
    console.error('GET /api/profile error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// PUT /api/profile
// Body: { github_username?, codeforces_handle?, leetcode_username? }
// Creates the profile row if it doesn't exist yet, updates it if it does.
router.put('/', async (req, res) => {
  const { github_username, codeforces_handle, leetcode_username } = req.body;

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

  res.json(data);
});

// GET /api/profile/digest-subscription
// Get weekly digest subscription status for current user
router.get('/digest-subscription', async (req, res) => {
  let subscribed = false;
  let lastSentAt = null;

  try {
    const { data: subData, error: subErr } = await supabase
      .from('digest_subscriptions')
      .select('subscribed, last_sent_at')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!subErr && subData) {
      subscribed = !!subData.subscribed;
      lastSentAt = subData.last_sent_at || null;
      return res.json({ subscribed, last_sent_at: lastSentAt });
    }
  } catch (err) {
    console.log('[digest-sub:get] Table check fallback:', err.message);
  }

  // Fallback to user metadata
  const metaSub = req.user.user_metadata?.digest_subscribed;
  if (metaSub !== undefined) {
    subscribed = !!metaSub;
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
      user_metadata: { digest_subscribed: isSubscribed },
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
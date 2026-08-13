import { Router } from 'express';
import { supabase } from '../lib/supabaseClient.js';
import { verifyUnsubscribeToken } from '../lib/digestEngine.js';

const router = Router();

// GET /api/digest/unsubscribe?uid=...&token=...
// One-click unsubscribe link from weekly digest emails.
// Unauthenticated, verified by HMAC-SHA256 signature token.
router.get('/unsubscribe', async (req, res) => {
  const { uid, token } = req.query;

  if (!uid || !token || !verifyUnsubscribeToken(uid, token)) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Invalid Link — statmux</title>
        <style>
          body { background: #09090b; color: #f4f4f5; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { max-width: 440px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center; }
          h1 { color: #f43f5e; font-size: 20px; margin-top: 0; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; }
          a { display: inline-block; margin-top: 16px; background: #27272a; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Invalid or Expired Link</h1>
          <p>This unsubscribe link is invalid or has expired. Please log into your statmux account to manage your notification settings.</p>
          <a href="https://statmux.sayan.cyou/login">Go to statmux</a>
        </div>
      </body>
      </html>
    `);
  }

  // Update subscription to false
  try {
    await supabase
      .from('digest_subscriptions')
      .upsert({ user_id: uid, subscribed: false });
  } catch (err) {
    console.log('[digest:unsubscribe] DB table update fallback:', err.message);
  }

  try {
    await supabase.auth.admin.updateUserById(uid, {
      user_metadata: { digest_subscribed: false },
    });
  } catch (err) {
    console.error('[digest:unsubscribe] Auth user_metadata update failed:', err.message);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Unsubscribed — statmux</title>
      <style>
        body { background: #09090b; color: #f4f4f5; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { max-width: 460px; background: #121215; border: 1px solid #27272a; border-radius: 16px; padding: 36px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .icon { width: 48px; height: 48px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #10b981; font-size: 24px; margin-bottom: 16px; }
        h1 { color: #ffffff; font-size: 20px; margin: 0 0 8px 0; }
        p { color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0; }
        a { display: inline-block; margin-top: 24px; background: #10b981; color: #09090b; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px; }
        a:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">&check;</div>
        <h1>Unsubscribed Successfully</h1>
        <p>You have been removed from the weekly digest email list. You can re-enable it anytime from your Account Settings.</p>
        <a href="https://statmux.sayan.cyou/login">Return to statmux</a>
      </div>
    </body>
    </html>
  `);
});

export default router;

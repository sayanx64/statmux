import { supabase } from './supabaseClient.js';

/**
 * Reads "Authorization: Bearer <token>" from the request, verifies it with
 * Supabase, and attaches the real user to req.user.
 *
 * Why this matters: our backend uses the SERVICE ROLE key, which bypasses
 * RLS entirely. That means the database policies we wrote (auth.uid() =
 * user_id) do NOT protect us here — they only protect direct client access.
 * This middleware is what actually enforces "you can only touch your own
 * data" at the Express layer.
 *
 * Never trust a user_id sent in the request body. Anyone could type any
 * UUID into a POST body. The only trustworthy source of "who is this" is
 * verifying their token here.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user; // real, verified user - safe to trust from here on
  next();
}
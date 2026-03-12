import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { getCorsHeaders } from '../_shared/cors.ts';

/**
 * Public waitlist signup edge function.
 *
 * No authentication required — accepts email + optional referral code.
 * Generates a unique referral code server-side, handles duplicates,
 * and increments referrer counts.
 */

// Simple rate limiting by IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5; // 5 signups per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(ip, entry);
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Clean up stale entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, referred_by } = await req.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('referral_code, referral_count')
      .eq('email', cleanEmail)
      .single();

    if (existing) {
      // Return existing entry
      const { count: position } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      return new Response(JSON.stringify({
        success: true,
        already_registered: true,
        referral_code: existing.referral_code,
        referral_count: existing.referral_count,
        waitlist_position: position || 0,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique referral code (retry on collision)
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: collision } = await supabase
        .from('waitlist')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      if (!collision) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    // Insert new signup
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email: cleanEmail,
        referral_code: referralCode,
        referred_by: referred_by && typeof referred_by === 'string' ? referred_by.trim() : null,
      });

    if (insertError) {
      console.error('Waitlist insert error:', insertError);
      // Handle race condition on duplicate email
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ error: 'Email already registered' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw insertError;
    }

    // Increment referrer's count if referred_by is valid
    if (referred_by && typeof referred_by === 'string') {
      const trimmedRef = referred_by.trim();
      if (trimmedRef) {
        await supabase.rpc('increment_referral_count', { ref_code: trimmedRef }).catch(() => {
          // Non-critical — log and continue
          console.warn(`Failed to increment referral count for code: ${trimmedRef}`);
        });

        // Fallback: direct update if RPC doesn't exist
        await supabase
          .from('waitlist')
          .update({ referral_count: existing ? (existing.referral_count || 0) + 1 : 1 })
          .eq('referral_code', trimmedRef)
          .then(() => {})
          .catch(() => {});
      }
    }

    // Get total count for position
    const { count: position } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    console.log(`[WAITLIST] New signup: ${cleanEmail}, code: ${referralCode}, referred_by: ${referred_by || 'none'}`);

    return new Response(JSON.stringify({
      success: true,
      referral_code: referralCode,
      referral_count: 0,
      waitlist_position: position || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return new Response(JSON.stringify({
      error: 'Something went wrong. Please try again.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

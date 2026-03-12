import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface WaitlistFormProps {
  variant?: 'hero' | 'cta';
}

const REFERRAL_TIERS = [
  { count: 0, label: 'Legendary Egg', emoji: '🥚', desc: 'Free with signup' },
  { count: 3, label: 'Rare Egg', emoji: '🔵', desc: '3 referrals' },
  { count: 5, label: 'Epic Egg', emoji: '🟣', desc: '5 referrals' },
  { count: 10, label: 'Founder Fox', emoji: '🦊', desc: '10 referrals' },
  { count: 25, label: 'Pioneer Island', emoji: '🏝️', desc: '25 referrals' },
];

function getReferredBy(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || null;
  } catch {
    return null;
  }
}

export function WaitlistForm({ variant = 'hero' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    const savedCode = localStorage.getItem('phono_referral_code');
    if (savedCode) {
      setReferralCode(savedCode);
      setStatus('success');
      const savedCount = localStorage.getItem('phono_referral_count');
      if (savedCount) setReferralCount(parseInt(savedCount, 10));
    }
  }, []);

  useEffect(() => {
    fetchWaitlistCount();
  }, []);

  async function fetchWaitlistCount() {
    try {
      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        method: 'GET',
      });
      if (!error && data?.count != null) {
        setWaitlistCount(data.count);
        localStorage.setItem('phono_waitlist_count', String(data.count));
      } else {
        const cached = localStorage.getItem('phono_waitlist_count');
        if (cached) setWaitlistCount(parseInt(cached, 10));
      }
    } catch {
      const cached = localStorage.getItem('phono_waitlist_count');
      if (cached) setWaitlistCount(parseInt(cached, 10));
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      if (!isSupabaseConfigured) {
        await new Promise(r => setTimeout(r, 1200));
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem('phono_referral_code', code);
        localStorage.setItem('phono_email', email);
        setReferralCode(code);
        setStatus('success');
        setWaitlistCount(prev => prev + 1);
        return;
      }

      const referredBy = getReferredBy();

      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        body: {
          email: email.trim(),
          referred_by: referredBy,
        },
      });

      if (error) throw new Error(error.message || 'Signup failed');
      if (data?.error) throw new Error(data.error);

      localStorage.setItem('phono_referral_code', data.referral_code);
      localStorage.setItem('phono_email', email.trim());
      localStorage.setItem('phono_referral_count', String(data.referral_count || 0));

      setReferralCode(data.referral_code);
      setReferralCount(data.referral_count || 0);
      setStatus('success');

      if (data.waitlist_position) {
        setWaitlistCount(data.waitlist_position);
      } else {
        setWaitlistCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  };

  const copyLink = () => {
    const link = `phono.app/?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnX = () => {
    const text = encodeURIComponent(
      "I just joined the PhoNo waitlist — a focus timer that lets you collect pixel art pets and build floating islands. Join me and we both get rewards!"
    );
    const url = encodeURIComponent(`https://phono.app/?ref=${referralCode}`);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const nextTier = REFERRAL_TIERS.find(t => t.count > referralCount);
  const progressPercent = nextTier
    ? (referralCount / nextTier.count) * 100
    : 100;

  // Success state
  if (status === 'success' && referralCode) {
    return (
      <div className="waitlist-success">
        <div className="success-card">
          {/* Badge */}
          <div className="success-badge">
            <span style={{ color: 'var(--primary)', fontSize: 14 }}>&#10003;</span>
            You're in{waitlistCount > 0 ? ` — #${waitlistCount.toLocaleString()}` : ''}
          </div>

          {/* Headline */}
          <h3
            className="display-font"
            style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--fg-deep)' }}
          >
            Welcome to the island.
          </h3>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 20, lineHeight: 1.5 }}>
            We'll email you when PhoNo is ready. Share your link to unlock exclusive rewards.
          </p>

          {/* Referral link */}
          <div className="referral-link-box">
            <input readOnly value={`phono.app/?ref=${referralCode}`} />
            <button onClick={copyLink}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Progress */}
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', textAlign: 'left' }}>
            <strong style={{ color: 'var(--fg-body)' }}>{referralCount}</strong> referral{referralCount !== 1 ? 's' : ''}
            {nextTier && (
              <span> — {nextTier.count - referralCount} more for <strong style={{ color: 'var(--accent-warm)' }}>{nextTier.label}</strong></span>
            )}
          </div>
          <div className="referral-progress">
            <div className="referral-progress__fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>

          {/* Tier badges */}
          <div className="referral-tiers">
            {REFERRAL_TIERS.map((tier) => {
              const unlocked = referralCount >= tier.count;
              const active = nextTier?.count === tier.count;
              return (
                <div
                  key={tier.count}
                  className={`referral-tier ${unlocked ? 'referral-tier--unlocked' : ''} ${active ? 'referral-tier--active' : ''} ${!unlocked && !active ? 'referral-tier--locked' : ''}`}
                >
                  <div className="referral-tier__icon">{tier.emoji}</div>
                  <div className="referral-tier__count">{tier.count === 0 ? 'Free' : tier.count}</div>
                  <div className="referral-tier__label">{tier.label}</div>
                </div>
              );
            })}
          </div>

          {/* Share buttons */}
          <div className="share-buttons">
            <button className="share-btn share-btn--primary" onClick={copyLink}>
              {copied ? '✓ Copied!' : 'Share Your Link'}
            </button>
            <button className="share-btn share-btn--secondary" onClick={shareOnX}>
              Share on 𝕏
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Idle / loading / error state
  return (
    <div id={variant === 'hero' ? 'waitlist' : undefined}>
      <form onSubmit={handleSubmit} style={{ scrollMarginTop: 100 }}>
        <div className="warm-form-container">
          <input
            type="email"
            className="warm-form-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            aria-label="Email address"
          />
          <AnimatePresence mode="wait">
            <motion.button
              key="submit"
              type="submit"
              disabled={status === 'loading'}
              className="warm-form-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === 'loading' ? (
                <span className="warm-form-spinner" />
              ) : (
                'Join the Waitlist'
              )}
            </motion.button>
          </AnimatePresence>
        </div>
      </form>

      {/* Social proof */}
      {waitlistCount > 0 && (
        <div className="waitlist-social-proof">
          <span className="pulse-dot" />
          <span>
            <strong>{waitlistCount.toLocaleString()}</strong> people are already building their islands
          </span>
        </div>
      )}

      {status === 'error' && (
        <p style={{ color: '#e53e3e', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          {errorMessage || 'Something went wrong. Please try again.'}
        </p>
      )}
    </div>
  );
}

import { useState, useEffect, type FormEvent } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface WaitlistFormProps {
  variant?: 'hero' | 'cta';
}

const REFERRAL_TIERS = [
  { count: 0, label: 'Legendary Egg', emoji: '🥚' },
  { count: 3, label: 'Rare Egg', emoji: '🔵' },
  { count: 5, label: 'Epic Egg', emoji: '🟣' },
  { count: 10, label: 'Founder Fox', emoji: '🦊' },
  { count: 25, label: 'Pioneer Island', emoji: '🏝️' },
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
  const [referredBy] = useState<string | null>(() => getReferredBy());

  // Check for existing signup on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('phono_referral_code');
    if (savedCode) {
      setReferralCode(savedCode);
      setStatus('success');
      const savedCount = localStorage.getItem('phono_referral_count');
      if (savedCount) setReferralCount(parseInt(savedCount, 10));
    }
  }, []);

  // Fetch waitlist count on mount
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
        // Fall back to cached count
        const cached = localStorage.getItem('phono_waitlist_count');
        if (cached) setWaitlistCount(parseInt(cached, 10));
      }
    } catch {
      const cached = localStorage.getItem('phono_waitlist_count');
      if (cached) setWaitlistCount(parseInt(cached, 10));
    }
  }

  async function fetchReferralCount() {
    try {
      const savedEmail = localStorage.getItem('phono_email');
      if (!savedEmail) return;
      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        body: { email: savedEmail, referredBy: null },
      });
      if (!error && data?.referralCount != null) {
        setReferralCount(data.referralCount);
        localStorage.setItem('phono_referral_count', String(data.referralCount));
      } else {
        const cached = localStorage.getItem('phono_referral_count');
        if (cached) setReferralCount(parseInt(cached, 10));
      }
    } catch {
      const cached = localStorage.getItem('phono_referral_count');
      if (cached) setReferralCount(parseInt(cached, 10));
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    try {
      if (!isSupabaseConfigured) {
        // Fallback for local dev without env vars
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

      if (error) {
        throw new Error(error.message || 'Signup failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Save to localStorage for return visits
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

  const nextTier = REFERRAL_TIERS.find(t => t.count > referralCount);
  const progressPercent = nextTier
    ? (referralCount / nextTier.count) * 100
    : 100;

  if (status === 'success' && referralCode) {
    return (
      <div className="waitlist-success">
        <div className="legendary-egg-display" />
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          Your Legendary Egg is reserved
        </h3>
        <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginBottom: 20 }}>
          You'll hatch it on launch day. Want more? Refer friends for bonus rewards.
        </p>

        <div className="referral-dashboard">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--fg-muted)' }}>
            Your referral link
          </div>
          <div className="referral-link-box">
            <input readOnly value={`phono.app/?ref=${referralCode}`} />
            <button onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>

          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 12 }}>
            {referralCount} referral{referralCount !== 1 ? 's' : ''}
            {nextTier && ` — ${nextTier.count - referralCount} more for ${nextTier.label}`}
          </div>
          <div className="referral-progress">
            <div className="referral-progress__fill" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
          </div>

          <div className="referral-tiers">
            {REFERRAL_TIERS.map((tier) => {
              const unlocked = referralCount >= tier.count;
              const active = nextTier?.count === tier.count;
              return (
                <div
                  key={tier.count}
                  className={`referral-tier ${!unlocked && !active ? 'referral-tier--locked' : ''} ${active ? 'referral-tier--active' : ''}`}
                >
                  <div className="referral-tier__icon">{tier.emoji}</div>
                  <div className="referral-tier__count">{tier.count}</div>
                  <div className="referral-tier__label">{tier.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form className="waitlist-form" onSubmit={handleSubmit} id={variant === 'hero' ? 'waitlist' : undefined}>
        <input
          type="email"
          className="waitlist-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          className={`egg-button ${status === 'loading' ? '' : ''}`}
          disabled={status === 'loading'}
          title="Hatch My Spot"
        />
      </form>
      {waitlistCount > 0 && (
        <div className="waitlist-counter">
          <strong>{waitlistCount.toLocaleString()}</strong> adventurers waiting
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

import { useState, useEffect, type FormEvent } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface WaitlistFormProps {
  variant?: 'hero' | 'cta';
}

const REFERRAL_TIERS = [
  { count: 0, label: 'Legendary Egg', image: '/icons/egg-legendary.png' },
  { count: 3, label: 'Rare Egg', image: '/icons/egg-rare.png' },
  { count: 5, label: 'Epic Egg', image: '/icons/egg-epic.png' },
  { count: 10, label: 'Founder Fox', image: '/pets/fox-adult.png' },
  { count: 25, label: 'Pioneer Island', image: '/pets/koi-fish-adult.png' },
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
  const [waitlistCount, setWaitlistCount] = useState(847);

  // Check for existing signup on mount
  useEffect(() => {
    const saved = localStorage.getItem('phono_referral_code');
    if (saved) {
      setReferralCode(saved);
      setStatus('success');
      const savedCount = localStorage.getItem('phono_referral_count');
      if (savedCount) setReferralCount(parseInt(savedCount, 10));
    }
  }, []);

  // Animate counter on mount
  useEffect(() => {
    const target = 847 + Math.floor(Math.random() * 200);
    const interval = setInterval(() => {
      setWaitlistCount(prev => {
        if (prev >= target) { clearInterval(interval); return prev; }
        return prev + Math.ceil((target - prev) / 10);
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

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

      if (error) {
        throw new Error(error.message || 'Signup failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

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

  const resetForm = () => {
    localStorage.removeItem('phono_referral_code');
    localStorage.removeItem('phono_email');
    localStorage.removeItem('phono_referral_count');
    setReferralCode(null);
    setReferralCount(0);
    setEmail('');
    setStatus('idle');
  };

  if (status === 'success' && referralCode) {
    return (
      <div className="waitlist-success">
        <img
          src="/icons/egg-legendary.png"
          alt="Legendary Egg"
          className="legendary-egg-display"
        />
        <h3 className="card-title" style={{ fontSize: 22 }}>
          You're in! Your Legendary Egg is reserved.
        </h3>
        <p className="card-desc" style={{ marginBottom: 24 }}>
          You'll hatch it on launch day. Share with friends to unlock bonus rewards.
        </p>

        <div className="referral-dashboard">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--fg-muted)' }}>
            Your referral link
          </div>
          <div className="referral-link-box">
            <input readOnly value={`phono.app/?ref=${referralCode}`} />
            <button onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</button>
          </div>

          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 14 }}>
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
                  <div className="referral-tier__icon">
                    <img
                      src={tier.image}
                      alt={tier.label}
                      style={{ width: 28, height: 28, imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="referral-tier__count">{tier.count}</div>
                  <div className="referral-tier__label">{tier.label}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetForm}
            style={{
              marginTop: 16,
              background: 'none',
              border: 'none',
              color: 'var(--fg-muted)',
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
            }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  const ctaText = variant === 'cta' ? 'Claim Your Spot' : 'Join the Waitlist';

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
          className="cta-primary waitlist-submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Joining...' : ctaText}
          {status !== 'loading' && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          )}
        </button>
      </form>
      <div className="waitlist-counter">
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--primary)',
          flexShrink: 0,
        }} />
        Join <strong>{waitlistCount.toLocaleString()}</strong> others on the waitlist
      </div>
      {status === 'error' && (
        <p style={{ color: '#e53e3e', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          {errorMessage || 'Something went wrong. Please try again.'}
        </p>
      )}
    </div>
  );
}

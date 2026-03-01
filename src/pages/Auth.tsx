import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { getAppBaseUrl, isValidEmail, validatePassword, sanitizeErrorMessage } from '@/lib/apiUtils';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';
import { checkRateLimit, recordRateLimitAttempt, clearRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/security';
import { Capacitor } from '@capacitor/core';

const AUTH_BG = 'linear-gradient(180deg, hsl(40 20% 98%) 0%, hsl(38 15% 95%) 50%, hsl(36 12% 93%) 100%)';
const INPUT_CLASS = 'h-12 rounded-xl bg-white border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-sky-500 focus:ring-sky-500';

// Apple logo SVG component
const AppleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
  </svg>
);

// SHA-256 hash a string and return hex-encoded result (needed for Apple Sign In nonce)
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

type AuthMode = 'welcome' | 'magic-link' | 'email-password' | 'signup' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, continueAsGuest, isGuestMode, isAnonymous, passwordRecoveryPending, clearPasswordRecovery } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // Check for reset-password mode from URL query params or PASSWORD_RECOVERY event
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset-password') {
      setMode('reset-password');
    }
  }, [searchParams]);

  useEffect(() => {
    if (passwordRecoveryPending) {
      setMode('reset-password');
      clearPasswordRecovery();
    }
  }, [passwordRecoveryPending, clearPasswordRecovery]);

  // Redirect to home if already authenticated with Supabase (not guest mode)
  // Guest users should be able to access auth page to create real accounts
  // Stay on auth page during password recovery so user can set new password
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isGuestMode && mode !== 'reset-password') {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, isGuestMode, mode, navigate]);

  // Get the current URL for redirect (works for both web and Capacitor)
  const getRedirectUrl = () => {
    return getAppBaseUrl();
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error('Authentication is not available. Please try again later.');
      return;
    }

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // SECURITY: Check rate limit before attempting auth
    const rateLimitKey = `auth:magic-link:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.auth);
    if (rateLimit.isLimited) {
      toast.error(rateLimit.message);
      return;
    }

    setIsLoading(true);
    try {
      if (isAnonymous) {
        // Anonymous user linking email — use updateUser to preserve their user_id
        const { error } = await supabase.auth.updateUser({ email });
        if (error) {
          recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.auth, false);
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: getRedirectUrl(),
          },
        });

        if (error) {
          recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.auth, false);
          throw error;
        }
      }

      // Clear rate limit on success
      clearRateLimit(rateLimitKey);
      setEmailSentTo(email);
      setEmailSent(true);
    } catch (error: unknown) {
      const message = sanitizeErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // GUARD: If user is an anonymous guest, signInWithPassword would create a
    // NEW session and orphan their anonymous account's purchases/progress.
    // Redirect them to sign-up instead, which uses updateUser() to link.
    if (isAnonymous) {
      toast.info('Create an account first to keep your progress', {
        description: 'Use "Create Account" to add email & password to your guest account.',
      });
      setMode('signup');
      return;
    }

    if (!isSupabaseConfigured) {
      toast.error('Authentication is not available. Please try again later.');
      return;
    }

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // SECURITY: Check rate limit before attempting auth
    const rateLimitKey = `auth:password:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.auth);
    if (rateLimit.isLimited) {
      toast.error(rateLimit.message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.auth, false);
        throw error;
      }

      // Clear rate limit on successful login
      clearRateLimit(rateLimitKey);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: unknown) {
      const message = sanitizeErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error('Authentication is not available. Please try again later.');
      return;
    }

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    // SECURITY: Check rate limit before attempting signup
    const rateLimitKey = `auth:signup:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.auth);
    if (rateLimit.isLimited) {
      toast.error(rateLimit.message);
      return;
    }

    setIsLoading(true);
    try {
      if (isAnonymous) {
        // Anonymous user creating an account — link email+password to their
        // existing anonymous identity. This preserves their user_id so all
        // purchases, coins, and progress carry over seamlessly.
        const { error } = await supabase.auth.updateUser({
          email,
          password,
        });

        if (error) {
          recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.auth, false);
          throw error;
        }

        // Clear rate limit on success — show inline confirmation
        // (Supabase sends a confirmation email to verify the new address)
        clearRateLimit(rateLimitKey);
        setEmailSentTo(email);
      } else {
        // Fresh sign-up (no existing anonymous session)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getRedirectUrl(),
          },
        });

        if (error) {
          recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.auth, false);
          throw error;
        }

        // Check if user already exists (Supabase returns user but with empty identities)
        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          toast.error('An account with this email already exists', {
            description: 'Try signing in instead, or use "Forgot Password" to reset.',
          });
          setMode('email-password');
          setIsLoading(false);
          return;
        }

        // Clear rate limit on success — show inline confirmation
        clearRateLimit(rateLimitKey);
        setEmailSentTo(email);
      }
      setEmailSent(true);
    } catch (error: unknown) {
      const message = sanitizeErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error('Authentication is not available. Please try again later.');
      return;
    }

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // SECURITY: Check rate limit for password reset (stricter limits)
    const rateLimitKey = `auth:reset:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT_CONFIGS.passwordReset);
    if (rateLimit.isLimited) {
      toast.error(rateLimit.message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getRedirectUrl()}/auth?mode=reset-password`,
      });

      if (error) {
        recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.passwordReset, false);
        throw error;
      }

      // Record attempt even on success to prevent email enumeration
      recordRateLimitAttempt(rateLimitKey, RATE_LIMIT_CONFIGS.passwordReset, false);
      toast.success('Password reset email sent!', {
        description: 'Check your email for a link to reset your password.',
      });
      setMode('welcome');
    } catch (error: unknown) {
      const message = sanitizeErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error('Authentication is not available. Please try again later.');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully!', {
        description: 'You can now sign in with your new password.',
      });
      resetForm();
      // Clear the URL params and go to sign in
      navigate('/auth', { replace: true });
      setMode('email-password');
    } catch (error: unknown) {
      const message = sanitizeErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    // Set guest mode flag (creates anonymous Supabase session) and navigate
    await continueAsGuest();
    navigate('/');
  };

  const handleAppleSignIn = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Authentication is not available. Please try again later.');
      return;
    }

    setIsLoading(true);
    try {
      // If user is anonymous, link the Apple identity to their existing account
      // so purchases and progress are preserved.
      if (isAnonymous) {
        const isNativeIOS = Capacitor.getPlatform() === 'ios';

        if (isNativeIOS) {
          // Native iOS: use signInWithIdToken because linkIdentity requires
          // an OAuth redirect which isn't available for native Apple Sign In.
          // NOTE: signInWithIdToken may create a new user instead of linking
          // to the anonymous one — Supabase doesn't reliably auto-link here.
          const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');

          const rawNonce = crypto.randomUUID();
          const hashedNonce = await sha256(rawNonce);

          const result = await SignInWithApple.authorize({
            clientId: 'co.botblock.app',
            redirectURI: 'https://nomoinc.co',
            scopes: 'email name',
            state: crypto.randomUUID(),
            nonce: hashedNonce,
          });

          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: result.response.identityToken,
            nonce: rawNonce,
          });

          if (error) throw error;
        } else {
          // Web: use linkIdentity to associate Apple with the anonymous account
          const { error } = await supabase.auth.linkIdentity({
            provider: 'apple',
            options: {
              redirectTo: getRedirectUrl(),
            },
          });

          if (error) throw error;
        }

        toast.success('Signed in with Apple!');
        navigate('/');
        return;
      }

      // Regular sign-in (not anonymous)
      const isNativeIOS = Capacitor.getPlatform() === 'ios';

      if (isNativeIOS) {
        // Use native Sign in with Apple for iOS
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');

        // Generate nonce: Apple needs SHA-256 hash, Supabase needs raw nonce
        const rawNonce = crypto.randomUUID();
        const hashedNonce = await sha256(rawNonce);

        const result = await SignInWithApple.authorize({
          clientId: 'co.botblock.app',
          redirectURI: 'https://nomoinc.co',
          scopes: 'email name',
          state: crypto.randomUUID(),
          nonce: hashedNonce,
        });

        // Pass the RAW nonce to Supabase — it will hash and verify against the token
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: result.response.identityToken,
          nonce: rawNonce,
        });

        if (error) throw error;

        toast.success('Welcome!');
        navigate('/');
      } else {
        // Use web OAuth redirect for non-iOS platforms
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: getRedirectUrl(),
          },
        });

        if (error) throw error;
      }
    } catch (error: unknown) {
      // Don't show error for user-initiated cancellations
      const errString = String(error);
      const isCancellation = errString.includes('cancel') || errString.includes('Cancel')
        || errString.includes('ASAuthorizationError') || errString.includes('1001');
      if (!isCancellation) {
        const message = sanitizeErrorMessage(error);
        if (message) toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex items-center justify-center pt-safe pb-safe" style={{ background: AUTH_BG }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-stone-200 border-t-sky-500 mx-auto mb-4"></div>
            <p className="text-sm text-stone-400 animate-pulse">Loading...</p>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setEmailSent(false);
    setEmailSentTo('');
  };

  // Welcome screen with options
  if (mode === 'welcome') {
    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative" style={{ background: AUTH_BG }}>
          {/* Subtle center spotlight */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.04) 0%, transparent 60%)' }} />

          <div className="w-full max-w-sm space-y-8 relative z-[1]">
          {/* Logo/Title */}
          <div className="text-center space-y-2 relative">
            <div className="relative inline-block mb-3">
              <img
                src="/app-icon.png"
                alt="BotBlock"
                className="relative w-20 h-20 mx-auto rounded-2xl"
                style={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                }}
              />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-stone-800" style={{ letterSpacing: '-0.01em' }}>
              BotBlock
            </h1>
            <p className="text-sm text-stone-400">Focus, grow, and collect bots!</p>
          </div>

          {/* Auth Options */}
          <div className="space-y-3">
            {/* Apple Sign-In - Standard Apple HIG button */}
            <button
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                height: '50px',
                minHeight: '44px',
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <AppleIcon className="w-5 h-5 text-white" />
              )}
              <span className="text-white text-base font-medium" style={{ fontFamily: '-apple-system, SF Pro Text, system-ui, sans-serif' }}>
                Sign in with Apple
              </span>
            </button>

            <button
              onClick={() => { resetForm(); setMode('magic-link'); }}
              className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98] bg-white border border-stone-200"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-50 border border-sky-100">
                <PixelIcon name="sparkles" size={24} />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-stone-800">Continue with Email</p>
                <p className="text-xs text-stone-400">Passwordless magic link</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300" />
            </button>

            <button
              onClick={() => { resetForm(); setMode('email-password'); }}
              className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98] bg-white border border-stone-200"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-200">
                <PixelIcon name="sword" size={24} />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-stone-800">Sign in with Password</p>
                <p className="text-xs text-stone-400">Use email and password</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300" />
            </button>

            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <button
              onClick={handleGuestMode}
              className="w-full p-4 rounded-xl flex items-center gap-4 transition-all active:scale-[0.98] border border-dashed border-stone-300 hover:border-stone-400"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-50 border border-stone-200">
                <PixelIcon name="ghost" size={24} />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-stone-600">Continue as Guest</p>
                <p className="text-xs text-stone-400">No account needed</p>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-600">
              Guest progress is saved on this device only and won't sync across devices
            </p>
          </div>
        </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Magic Link form
  if (mode === 'magic-link') {
    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative" style={{ background: AUTH_BG }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.04) 0%, transparent 60%)' }} />
          <div className="w-full max-w-sm space-y-6 relative z-[1]" ref={formRef}>
          <button
            onClick={() => { resetForm(); setMode('welcome'); }}
            className="min-h-[44px] min-w-[44px] flex items-center text-sm text-stone-400 hover:text-stone-700 transition-colors -ml-2 px-2"
          >
            ← Back
          </button>

          {emailSent ? (
            /* Inline email confirmation */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'hsl(145 40% 95%)', border: '1px solid hsl(145 35% 80%)' }}
              >
                <PixelIcon name="sparkles" size={36} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-stone-900">Check your email</h2>
                <p className="text-sm text-stone-400">
                  We sent a magic link to
                </p>
                <p className="text-sm font-semibold text-sky-500">{emailSentTo}</p>
              </div>
              <p className="text-xs text-stone-400">
                Click the link in the email to sign in. It may take a minute to arrive.
              </p>
              <div className="pt-2 space-y-3">
                <button
                  className="w-full py-3 text-sm font-semibold rounded-xl bg-stone-100 text-stone-700 border border-stone-200 transition-all active:scale-[0.98]"
                  onClick={() => { setEmailSent(false); }}
                >
                  Didn't receive it? Try again
                </button>
                <button
                  onClick={() => { resetForm(); setMode('welcome'); }}
                  className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Back to sign in options
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
                >
                  <PixelIcon name="sparkles" size={32} />
                </div>
                <h2 className="text-xl font-bold text-stone-900">Magic Link</h2>
                <p className="text-sm text-stone-400">
                  We'll email you a link to sign in instantly
                </p>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-600">Email</label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT_CLASS}
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-sm font-bold tracking-wide disabled:opacity-60 rounded-xl text-white transition-all active:scale-[0.98] bg-sky-500 hover:bg-sky-600 shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Magic Link'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-stone-400">
                Don't have an account?{' '}
                <button
                  onClick={() => { resetForm(); setMode('signup'); }}
                  className="text-sky-500 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Email + Password Sign In
  if (mode === 'email-password') {
    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative" style={{ background: AUTH_BG }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.04) 0%, transparent 60%)' }} />
          <div className="w-full max-w-sm space-y-6 relative z-[1]">
          <button
            onClick={() => { resetForm(); setMode('welcome'); }}
            className="min-h-[44px] min-w-[44px] flex items-center text-sm text-stone-400 hover:text-stone-700 transition-colors -ml-2 px-2"
          >
            ← Back
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
            >
              <PixelIcon name="sword" size={32} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Sign In</h2>
            <p className="text-sm text-stone-400">
              Welcome back! Enter your credentials
            </p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-stone-600">Email</label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-stone-600">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); }}
                  className="text-xs text-sky-500 hover:underline min-h-[44px] flex items-center"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${INPUT_CLASS} pr-12`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-sm font-bold tracking-wide disabled:opacity-60 rounded-xl text-white transition-all active:scale-[0.98] bg-sky-500 hover:bg-sky-600 shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400">
            Don't have an account?{' '}
            <button
              onClick={() => { resetForm(); setMode('signup'); }}
              className="text-sky-500 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Sign Up form
  if (mode === 'signup') {
    const pwChecks = password.length > 0 ? {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    } : null;

    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative" style={{ background: AUTH_BG }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.04) 0%, transparent 60%)' }} />
          <div className="w-full max-w-sm space-y-6 relative z-[1]" ref={formRef}>
          <button
            onClick={() => { resetForm(); setMode('welcome'); }}
            className="min-h-[44px] min-w-[44px] flex items-center text-sm text-stone-400 hover:text-stone-700 transition-colors -ml-2 px-2"
          >
            ← Back
          </button>

          {emailSent ? (
            /* Inline email verification confirmation */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'hsl(145 40% 95%)', border: '1px solid hsl(145 35% 80%)' }}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-stone-900">Verify your email</h2>
                <p className="text-sm text-stone-400">
                  We sent a confirmation link to
                </p>
                <p className="text-sm font-semibold text-sky-500">{emailSentTo}</p>
              </div>
              <p className="text-xs text-stone-400">
                Click the link in the email to activate your account. Check your spam folder if you don't see it.
              </p>
              <div className="pt-2 space-y-3">
                <button
                  className="w-full py-3 text-sm font-semibold rounded-xl bg-sky-500 text-white shadow-[0_2px_8px_rgba(14,165,233,0.3)] transition-all active:scale-[0.98]"
                  onClick={() => { resetForm(); setMode('email-password'); }}
                >
                  I've verified — Sign in
                </button>
                <button
                  onClick={() => { setEmailSent(false); }}
                  className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Didn't receive it? Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="relative inline-block mb-3">
                  <div
                    className="absolute inset-0 rounded-full blur-xl scale-[2]"
                    style={{ background: 'hsl(199 80% 50% / 0.06)' }}
                  />
                  <img
                    src="/app-icon.png"
                    alt="BotBlock"
                    className="relative w-14 h-14 mx-auto rounded-xl"
                    style={{
                      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold text-stone-900">Create Account</h2>
                <p className="text-sm text-stone-400">
                  Join BotBlock and sync your progress
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-stone-600">Email</label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={INPUT_CLASS}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-stone-600">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${INPUT_CLASS} pr-12`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Inline password requirements */}
                  {pwChecks && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                      {[
                        { met: pwChecks.length, label: '8+ characters' },
                        { met: pwChecks.upper, label: 'Uppercase letter' },
                        { met: pwChecks.lower, label: 'Lowercase letter' },
                        { met: pwChecks.number, label: 'Number' },
                        { met: pwChecks.special, label: 'Special character' },
                      ].map(({ met, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          {met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />
                          )}
                          <span className={`text-[11px] ${met ? 'text-emerald-500' : 'text-stone-300'}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-sm font-bold tracking-wide disabled:opacity-60 rounded-xl text-white transition-all active:scale-[0.98] bg-sky-500 hover:bg-sky-600 shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-stone-400">
                Already have an account?{' '}
                <button
                  onClick={() => { resetForm(); setMode('email-password'); }}
                  className="text-sky-500 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Forgot Password form
  if (mode === 'forgot-password') {
    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative" style={{ background: AUTH_BG }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.04) 0%, transparent 60%)' }} />
          <div className="w-full max-w-sm space-y-6 relative z-[1]">
          <button
            onClick={() => setMode('email-password')}
            className="min-h-[44px] min-w-[44px] flex items-center text-sm text-stone-400 hover:text-stone-700 transition-colors -ml-2 px-2"
          >
            ← Back
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
            >
              <PixelIcon name="ice-cube" size={32} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Reset Password</h2>
            <p className="text-sm text-stone-400">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-stone-600">Email</label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-sm font-bold tracking-wide disabled:opacity-60 rounded-xl text-white transition-all active:scale-[0.98] bg-sky-500 hover:bg-sky-600 shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400">
            Remember your password?{' '}
            <button
              onClick={() => { resetForm(); setMode('email-password'); }}
              className="text-sky-500 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
        </div>
      </PageErrorBoundary>
    );
  }

  // Reset Password form (when user clicks link from email)
  if (mode === 'reset-password') {
    return (
      <PageErrorBoundary pageName="authentication page">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative" style={{ background: AUTH_BG }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(14,165,233,0.04) 0%, transparent 60%)' }} />
          <div className="w-full max-w-sm space-y-6 relative z-[1]">
          <button
            onClick={() => { resetForm(); setMode('welcome'); navigate('/auth', { replace: true }); }}
            className="min-h-[44px] min-w-[44px] flex items-center text-sm text-stone-400 hover:text-stone-700 transition-colors -ml-2 px-2"
          >
            ← Back
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
            >
              <PixelIcon name="sword" size={32} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Set New Password</h2>
            <p className="text-sm text-stone-400">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-stone-600">New Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${INPUT_CLASS} pr-12`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-600">Confirm Password</label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={INPUT_CLASS}
                disabled={isLoading}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-sm font-bold tracking-wide disabled:opacity-60 rounded-xl text-white transition-all active:scale-[0.98] bg-sky-500 hover:bg-sky-600 shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
        </div>
      </PageErrorBoundary>
    );
  }

  return null;
}

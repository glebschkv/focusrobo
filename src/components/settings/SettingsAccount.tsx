import { useState } from "react";
import { settingsLogger } from "@/lib/logger";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, LogOut, Trash2, Shield, UserCircle, Loader2, Crown, RefreshCw, ExternalLink } from "lucide-react";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useStoreKit } from "@/hooks/useStoreKit";
import { Capacitor } from "@capacitor/core";

const ConfirmDialog = ({
  open, onCancel, onConfirm, title, description,
  confirmLabel, cancelLabel = "Cancel", confirmClassName, confirmStyle, isLoading, loadingLabel,
}: {
  open: boolean; onCancel: () => void; onConfirm: () => void;
  title: string; description: string; confirmLabel: string;
  cancelLabel?: string; confirmClassName?: string; confirmStyle?: React.CSSProperties;
  isLoading?: boolean; loadingLabel?: string;
}) => {
  if (!open) return null;
  return (
    <div className="settings-dialog-overlay">
      <div className="settings-dialog-scrim" onClick={onCancel} aria-hidden />
      <div className="settings-dialog-card space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">{title}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button className="settings-btn-secondary text-xs py-2" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            className={confirmClassName ?? "settings-btn-primary text-xs py-2"}
            style={confirmStyle}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (<><Loader2 className="w-3 h-3 mr-1 animate-spin inline" />{loadingLabel ?? confirmLabel}</>) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsAccount = () => {
  const { user, isGuestMode, signOut, session } = useAuth();
  const navigate = useNavigate();
  const { isPremium, currentPlan, restorePurchases: restoreMock } = usePremiumStatus();
  const storeKit = useStoreKit();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isLocalOnlyGuest = isGuestMode && !session;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try { await signOut(); navigate('/auth'); }
    catch { /* signOut() already shows a toast */ }
    finally { setIsSigningOut(false); setSignOutDialogOpen(false); }
  };

  const handleSignIn = () => navigate('/auth');

  const handleManageSubscriptions = async () => {
    setIsManaging(true);
    try {
      if (isNative) { await storeKit.manageSubscriptions(); }
      else { window.open('https://apps.apple.com/account/subscriptions', '_blank', 'noopener,noreferrer'); }
    } catch (_error) { toast.error('Failed to open subscription management'); }
    finally { setIsManaging(false); }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      if (isNative) { await storeKit.restorePurchases(); }
      else {
        const result = restoreMock();
        if (result.success) { toast.success(result.message); } else { toast.info(result.message); }
      }
    } catch (_error) { toast.error('Failed to restore purchases'); }
    finally { setIsRestoring(false); }
  };

  const handleDeleteAccount = async () => {
    if (!session?.access_token) { toast.error('You must be signed in to delete your account'); return; }
    setIsDeleting(true);
    try {
      const response = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (response.error) throw new Error(response.error.message || 'Failed to delete account');
      if (!response.data?.success) throw new Error(response.data?.error || 'Failed to delete account');
      toast.success('Account deleted successfully');
      setDeleteDialogOpen(false);
      localStorage.clear();
      window.location.replace('/auth');
    } catch (error: unknown) {
      settingsLogger.error('Error deleting account:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete account. Please try again.';
      toast.error(message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Subscription */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><Crown /></div>
          <span>Subscription</span>
        </div>

        <div className="space-y-3">
          <div className="settings-row">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isPremium
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'settings-icon-box--inactive'
              }`}>
                <Crown className={`w-5 h-5 ${isPremium ? 'text-white' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  {isPremium ? currentPlan?.name || 'Premium' : 'Free Plan'}
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {isPremium
                    ? currentPlan?.period === 'lifetime' ? 'Lifetime access'
                      : `${currentPlan?.period === 'yearly' ? 'Annual' : 'Monthly'} subscription`
                    : 'Limited features'}
                </p>
              </div>
              {isPremium && <span className="settings-badge settings-badge--green">Active</span>}
            </div>
          </div>

          {isPremium && (
            <button onClick={handleManageSubscriptions} disabled={isManaging} className="settings-btn-gold text-sm">
              {isManaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              <span>{isManaging ? 'Opening...' : 'Manage Subscription'}</span>
            </button>
          )}

          <button onClick={handleRestorePurchases} disabled={isRestoring} className="settings-btn-secondary">
            <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
            <span className="text-sm font-semibold">{isRestoring ? 'Restoring...' : 'Restore Purchases'}</span>
          </button>

          <p className="text-[11px] text-[hsl(var(--muted-foreground))] text-center">
            Made a purchase on another device? Tap restore to recover it.
          </p>
        </div>
      </div>

      {/* Account Info */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><UserCircle /></div>
          <span>Account</span>
        </div>

        <div className="space-y-3">
          <div className="settings-row">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isGuestMode ? 'settings-icon-box--inactive' : 'bg-[hsl(var(--primary))] shadow-[0_2px_8px_rgba(76,167,113,0.3)]'
              }`}>
                {isGuestMode ? <User className="w-5 h-5" /> : <Mail className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
                  {isGuestMode ? 'Guest Account' : user?.email}
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {isGuestMode ? 'Not signed in — create an account to save your progress' : 'Synced to cloud'}
                </p>
              </div>
              {isGuestMode && <span className="settings-badge settings-badge--amber">Guest</span>}
            </div>
          </div>

          {isGuestMode && (
            <div className="settings-warning">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[hsl(var(--warning))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--warning))]">
                    {isLocalOnlyGuest ? 'Your progress is only saved on this device' : "You're signed in as a guest"}
                  </p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
                    {isLocalOnlyGuest
                      ? 'Sign in to sync your bots and progress across devices'
                      : 'Create an account to keep your progress and sync across devices'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGuestMode && (
            <button onClick={handleSignIn} className="settings-btn-gold text-sm">
              <Mail className="w-4 h-4" /><span>Sign In or Create Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><LogOut /></div>
          <span>Session</span>
        </div>
        <button className="settings-btn-secondary" disabled={isSigningOut} onClick={() => setSignOutDialogOpen(true)}>
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">{isLocalOnlyGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
        </button>
      </div>

      <ConfirmDialog
        open={signOutDialogOpen}
        onCancel={() => setSignOutDialogOpen(false)}
        onConfirm={handleSignOut}
        title={isLocalOnlyGuest ? 'Exit Guest Mode?' : 'Sign Out?'}
        description={isLocalOnlyGuest
          ? 'Your local progress will be cleared. You can sign in or start fresh as a new guest.'
          : 'You can sign back in anytime to access your synced progress.'}
        confirmLabel={isLocalOnlyGuest ? 'Exit' : 'Sign Out'}
        isLoading={isSigningOut}
      />

      {/* Danger Zone */}
      {!!session && (
        <div className="settings-card" style={{ borderColor: 'rgba(196,100,100,0.25)' }}>
          <div className="settings-section-title">
            <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(196,100,100,0.12)' }}>
              <Trash2 className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" />
            </div>
            <span className="text-[13px] font-bold text-[hsl(var(--destructive))]">Danger Zone</span>
          </div>
          <button className="settings-btn-danger" disabled={isDeleting} onClick={() => setDeleteDialogOpen(true)}>
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
          </button>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-2 text-center">
            This will permanently remove your account and all data
          </p>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        description="This will permanently delete your account and all your data including bots, progress, and achievements. This action cannot be undone."
        confirmLabel="Delete Forever"
        loadingLabel="Deleting..."
        confirmClassName="settings-btn-danger text-xs py-2"
        isLoading={isDeleting}
      />
    </div>
  );
};

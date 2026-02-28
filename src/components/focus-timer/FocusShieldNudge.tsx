/**
 * FocusShieldNudge
 *
 * A one-time dismissible nudge on the timer page that encourages users to
 * set up Focus Shield (app blocking). Only renders on native when shield
 * hasn't been configured yet. Disappears permanently once dismissed or
 * once the user configures their blocked apps.
 *
 * Styled to match the timer page's frosted-glass design language.
 */

import { useState, useEffect, useCallback } from 'react';
import { Shield, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { useDeviceActivity } from '@/hooks/useDeviceActivity';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const DISMISSED_KEY = 'nomoPhone_shieldNudgeDismissed';

/** Read dismissed state synchronously so it never flickers back on remount */
const wasPreviouslyDismissed = (): boolean => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return true; // if storage fails, stay hidden
  }
};

export const FocusShieldNudge = () => {
  const isNative = Capacitor.isNativePlatform();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => isNative && !wasPreviouslyDismissed());

  const {
    isPermissionGranted,
    hasAppsConfigured,
    requestPermissions,
    openAppPicker,
    isLoading,
  } = useDeviceActivity();

  const dismiss = useCallback(() => {
    setVisible(false);
    try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* noop */ }
  }, []);

  const handleAction = async () => {
    if (!isPermissionGranted) {
      await requestPermissions();
    } else {
      await openAppPicker();
    }
  };

  // Auto-dismiss once the user has configured apps — mission accomplished
  useEffect(() => {
    if (hasAppsConfigured) dismiss();
  }, [hasAppsConfigured, dismiss]);

  // Don't render: web, dismissed, or already set up
  if (!isNative || !visible || hasAppsConfigured) return null;

  const actionLabel = !isPermissionGranted ? 'Continue' : 'Set up';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 28 }}
          className="w-full max-w-sm"
        >
          <div
            className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white border border-stone-200 shadow-sm"
          >
            {/* Shield icon */}
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-sky-50 border border-sky-200">
              <Shield className="w-[18px] h-[18px] text-sky-500" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-tight text-stone-900">
                Focus Shield
              </p>
              <p className="text-[11px] leading-tight mt-0.5 text-stone-400">
                Block distracting apps
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAction}
              disabled={isLoading}
              className="flex-shrink-0 flex items-center gap-0.5 px-3.5 min-h-[36px] rounded-lg text-[12px] font-bold transition-all active:scale-95 bg-sky-500 text-white"
              style={{ opacity: isLoading ? 0.6 : 1 }}
            >
              {actionLabel}
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="flex-shrink-0 w-9 h-9 -mr-1 flex items-center justify-center rounded-full transition-all active:scale-90 text-stone-300"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

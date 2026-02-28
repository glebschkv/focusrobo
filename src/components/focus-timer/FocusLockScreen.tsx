import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOCUS_CATEGORIES, FocusCategory } from "@/types/analytics";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { formatTime } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FocusLockScreenProps {
  isVisible: boolean;
  timeRemaining: number;
  category?: FocusCategory;
  taskLabel?: string;
  onReturnToApp: () => void;
  onAbandonSession: () => void;
}

export const FocusLockScreen = ({
  isVisible,
  timeRemaining,
  category,
  taskLabel,
  onReturnToApp,
  onAbandonSession,
}: FocusLockScreenProps) => {
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const categoryInfo = category
    ? FOCUS_CATEGORIES.find(c => c.id === category)
    : null;

  const handleAbandon = () => {
    setShowAbandonConfirm(false);
    onAbandonSession();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#FAFAF9]"
        >
          {/* Background texture */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%">
              <filter id="lockGrain"><feTurbulence baseFrequency="0.9" numOctaves="4" type="fractalNoise" /></filter>
              <rect width="100%" height="100%" filter="url(#lockGrain)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-safe pb-safe">
            {/* Shield Icon */}
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-sky-200/40 rounded-full" />
                <div className="relative w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
              className="text-2xl font-bold text-stone-900 text-center mb-2"
            >
              Focus Mode Active
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.4 }}
              className="text-stone-400 text-center mb-8 max-w-xs"
            >
              Stay focused! You're in a focus session.
            </motion.p>

            {/* Time Remaining */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 }}
              className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 text-center shadow-sm"
            >
              <div className="text-5xl font-mono font-light text-stone-900 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-stone-400 text-sm">remaining</div>
            </motion.div>

            {/* Current Task */}
            {(categoryInfo || taskLabel) && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.6 }}
                className="bg-white border border-stone-200 rounded-xl px-4 py-3 mb-8 max-w-xs w-full"
              >
                <div className="flex items-center gap-2 justify-center">
                  {categoryInfo && (
                    <PixelIcon name={categoryInfo.icon} size={22} />
                  )}
                  <span className="text-stone-600 text-sm">
                    {taskLabel || categoryInfo?.label || "Focusing"}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Return Button */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.7 }}
              className="w-full max-w-xs space-y-3"
            >
              <Button
                onClick={onReturnToApp}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-6 text-lg font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return to Focus
              </Button>

              {!showAbandonConfirm ? (
                <button
                  onClick={() => setShowAbandonConfirm(true)}
                  className="w-full py-3 text-stone-400 hover:text-stone-500 text-sm transition-colors"
                >
                  I need to leave
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 text-red-500 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Abandon Session?</span>
                  </div>
                  <p className="text-stone-400 text-xs mb-3">
                    Your progress won't count towards your goals.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAbandonConfirm(false)}
                      className="flex-1 text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAbandon}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-500"
                    >
                      Abandon
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Motivational Quote */}
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 1 }}
              className="absolute bottom-safe left-0 right-0 text-center text-stone-300 text-xs px-8 pb-4"
            >
              "The secret of getting ahead is getting started."
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

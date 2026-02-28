import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { AchievementGallery } from '@/components/AchievementGallery';
import { Trophy, ChevronRight, Gamepad2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GamificationHubProps {
  onXPReward?: (amount: number) => void;
  onCoinReward?: (amount: number) => void;
}

export const GamificationHub = ({ onXPReward: _onXPReward, onCoinReward: _onCoinReward }: GamificationHubProps) => {
  const [showAchievements, setShowAchievements] = useState(false);

  const {
    achievements,
    unlockedAchievements,
    getTotalAchievementPoints,
    getCompletionPercentage
  } = useAchievementSystem();

  const achievementPoints = getTotalAchievementPoints();
  const achievementPercent = getCompletionPercentage();

  // If achievements view is open, show it instead
  if (showAchievements) {
    return (
      <div className="h-full flex flex-col retro-arcade-container">
        <AchievementGallery
          embedded={true}
          onClose={() => setShowAchievements(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col retro-arcade-container">
      {/* Header */}
      <div className="relative p-4 border-b-4 border-purple-600/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-transparent to-pink-900/50" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 retro-icon-badge">
            <Gamepad2 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold retro-pixel-text retro-neon-text">
              CHALLENGES
            </h1>
            <p className="text-xs text-purple-300/80 uppercase tracking-wider">
              Achievements & Rewards
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4 pb-6">
          {/* Achievements */}
          <button
            className={cn(
              "w-full retro-game-card overflow-hidden cursor-pointer transition-all text-left touch-manipulation select-none active:scale-[0.98]",
              unlockedAchievements.length > 0 && "retro-active-challenge"
            )}
            onClick={() => setShowAchievements(true)}
          >
            <div className="h-2 bg-purple-900/50">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
                style={{ width: `${achievementPercent}%` }}
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white retro-pixel-text">ACHIEVEMENTS</h3>
                  <div className="flex items-center gap-2 text-sm text-purple-300/80">
                    <span className="retro-neon-yellow">{achievementPoints} PTS</span>
                    <span>·</span>
                    <span>{unlockedAchievements.length}/{achievements.length} unlocked</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-400">{achievementPercent}%</div>
                  <div className="text-[10px] text-purple-300/60">Complete</div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </button>

          {/* Info Panel */}
          <div className="retro-game-card p-4">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-cyan-400 retro-pixel-text">
              <Zap className="w-4 h-4" />
              HOW IT WORKS
            </h4>
            <ul className="text-sm text-purple-300/80 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">►</span>
                Complete focus sessions to earn XP and level up
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">►</span>
                Keep your streak going for bonus rewards
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">►</span>
                Unlock achievements for extra coins and badges
              </li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default GamificationHub;

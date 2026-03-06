import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { useQuestSystem } from '@/hooks/useQuestSystem';
import { AchievementGallery } from '@/components/AchievementGallery';
import { ChevronRight } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';
import type { Quest } from '@/types/quest-system';

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

  const {
    dailyQuests,
    weeklyQuests,
    completeQuest,
  } = useQuestSystem();

  const achievementPoints = getTotalAchievementPoints();
  const achievementPercent = getCompletionPercentage();

  // If achievements view is open, show it instead
  if (showAchievements) {
    return (
      <div className="h-full flex flex-col bg-[#F8F8F4]">
        <AchievementGallery
          embedded={true}
          onClose={() => setShowAchievements(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F8F4]">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(45 90% 55%))',
              boxShadow: '0 2px 8px hsla(38, 80%, 50%, 0.25), inset 0 1px 0 hsla(0,0%,100%,0.3)',
            }}
          >
            <PixelIcon name="trophy" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight">
              Challenges
            </h1>
            <p className="text-xs text-stone-400">
              Achievements & Rewards
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 pt-1 pb-6 space-y-4">
          {/* Achievement Card */}
          <button
            className="w-full overflow-hidden cursor-pointer text-left touch-manipulation select-none active:scale-[0.98] transition-transform duration-150 rounded-2xl bg-white border border-stone-200/60"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
            onClick={() => setShowAchievements(true)}
          >
            {/* Progress bar at top */}
            <div className="h-1.5 bg-stone-100 rounded-t-2xl overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${achievementPercent}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #eab308)',
                }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Trophy icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 3px 10px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  <PixelIcon name="trophy" size={28} />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-[15px]">Achievements</h3>
                  <div className="flex items-center gap-2 text-sm mt-0.5">
                    <span className="font-bold text-amber-600">{achievementPoints} pts</span>
                    <span className="text-stone-300">·</span>
                    <span className="text-stone-400">{unlockedAchievements.length}/{achievements.length} unlocked</span>
                  </div>
                </div>

                {/* Completion percentage */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-amber-500 tabular-nums">{achievementPercent}%</div>
                  <div className="text-[10px] text-stone-400 font-medium">Complete</div>
                </div>

                <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0" />
              </div>
            </div>
          </button>

          {/* Daily Quests */}
          {dailyQuests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 px-1">
                Daily Quests
              </h3>
              <div className="space-y-2">
                {dailyQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onClaim={completeQuest} />
                ))}
              </div>
            </div>
          )}

          {/* Weekly Quests */}
          {weeklyQuests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 px-1">
                Weekly Quests
              </h3>
              <div className="space-y-2">
                {weeklyQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onClaim={completeQuest} />
                ))}
              </div>
            </div>
          )}

          {/* Info Panel */}
          <div
            className="rounded-xl p-4 border border-stone-200/50"
            style={{
              background: 'linear-gradient(180deg, hsl(40 20% 98%), hsl(40 15% 96%))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            <h4 className="font-semibold text-stone-700 mb-3 flex items-center gap-2 text-[13px]">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <PixelIcon name="lightning" size={12} />
              </div>
              How It Works
            </h4>
            <ul className="text-sm text-stone-500 space-y-2.5">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                Complete focus sessions to earn XP and level up
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                Keep your streak going for bonus rewards
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
                Unlock achievements for extra coins and badges
              </li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

function QuestCard({ quest, onClaim }: { quest: Quest; onClaim: (id: string) => void }) {
  const objective = quest.objectives[0];
  const progress = objective ? Math.min(100, (objective.current / objective.target) * 100) : 0;
  const isReady = quest.objectives.every(o => o.current >= o.target) && !quest.isCompleted;
  const rewardText = quest.rewards.map(r => r.description).join(' + ');

  return (
    <div
      className="rounded-xl bg-white border border-stone-200/60 p-3.5 transition-all"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        opacity: quest.isCompleted ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: quest.isCompleted
              ? 'linear-gradient(135deg, #a3e635, #84cc16)'
              : isReady
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
          }}
        >
          <PixelIcon
            name={quest.isCompleted ? 'check' : isReady ? 'star' : 'target'}
            size={16}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-stone-800 leading-tight">{quest.title}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">{quest.description}</p>
          {/* Progress bar */}
          {!quest.isCompleted && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: isReady
                      ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                      : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-stone-400">
                  {objective ? `${objective.current}/${objective.target}` : ''}
                </span>
                <span className="text-[10px] font-semibold text-stone-500">{rewardText}</span>
              </div>
            </div>
          )}
        </div>
        {isReady && (
          <button
            onClick={() => onClaim(quest.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            Claim
          </button>
        )}
        {quest.isCompleted && (
          <span className="flex-shrink-0 text-[10px] font-bold text-lime-600 uppercase">Done</span>
        )}
      </div>
    </div>
  );
}

export default GamificationHub;

import {
  Sunrise,
  Moon,
  Timer,
  Zap,
  Shield,
  Flame,
  CheckCircle,
  Compass,
  Crown,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusPersonality, FOCUS_ARCHETYPES } from "@/types/analytics";

interface FocusPersonalityProps {
  personality: FocusPersonality;
  isPremium: boolean;
  onUpgrade: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunrise,
  Moon,
  Timer,
  Zap,
  Shield,
  Flame,
  CheckCircle,
  Compass,
};

const TRAIT_LABELS: { key: keyof FocusPersonality['traits']; label: string; color: string }[] = [
  { key: 'endurance', label: 'Endurance', color: 'bg-emerald-500' },
  { key: 'consistency', label: 'Consistency', color: 'bg-blue-500' },
  { key: 'quality', label: 'Quality', color: 'bg-violet-500' },
  { key: 'volume', label: 'Volume', color: 'bg-orange-500' },
  { key: 'growth', label: 'Growth', color: 'bg-cyan-500' },
];

export const AnalyticsFocusPersonality = ({
  personality,
  isPremium,
  onUpgrade,
}: FocusPersonalityProps) => {
  const archetype = FOCUS_ARCHETYPES[personality.primary];
  const secondaryArchetype = FOCUS_ARCHETYPES[personality.secondary];
  const IconComponent = ICON_MAP[archetype.icon] || Compass;

  if (!isPremium) {
    // Free teaser — mystery card
    return (
      <button
        onClick={onUpgrade}
        className="w-full retro-card p-4 text-left transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, hsl(280 60% 50% / 0.2) 0%, hsl(220 60% 50% / 0.15) 100%)',
              border: '1.5px solid hsl(280 40% 50% / 0.2)',
            }}
          >
            <HelpCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-sm font-bold">Focus Personality</span>
            <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Premium
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mystery personality icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(280 40% 50% / 0.15) 0%, hsl(220 40% 50% / 0.1) 100%)',
              border: '2px dashed hsl(280 30% 50% / 0.3)',
            }}
          >
            <HelpCircle className="w-8 h-8 text-purple-300/60" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-xs font-bold text-muted-foreground">What's your focus type?</div>
            {/* Blurred trait bars teaser */}
            {TRAIT_LABELS.map(trait => (
              <div key={trait.key} className="blur-[3px] select-none pointer-events-none">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] text-muted-foreground">{trait.label}</span>
                  <span className="text-[9px] font-bold">??</span>
                </div>
                <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", trait.color)} style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, hsl(35 80% 50% / 0.12) 0%, hsl(35 90% 40% / 0.06) 100%)',
            border: '1.5px solid hsl(35 70% 50% / 0.25)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Discover your focus personality</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-500/60" />
        </div>
      </button>
    );
  }

  return (
    <div className="retro-card overflow-hidden">
      {/* Gradient header */}
      <div
        className={cn("px-4 pt-4 pb-3 bg-gradient-to-br", archetype.gradient)}
      >
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">Focus Personality</span>
          <span className="ml-auto text-[10px] text-muted-foreground">Updated weekly</span>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {/* Archetype icon */}
          <div
            className={cn("w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0", archetype.color)}
            style={{
              background: 'hsl(var(--card))',
              border: '2px solid hsl(var(--border))',
              boxShadow: '0 2px 8px hsl(var(--foreground) / 0.08)',
            }}
          >
            <IconComponent className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <div className={cn("text-lg font-extrabold leading-tight", archetype.color)}>
              {archetype.label}
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              {archetype.description}
            </div>
            {/* Secondary type badge */}
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[9px] text-muted-foreground/60 font-medium">Also:</span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", secondaryArchetype.color)}
                style={{ background: 'hsl(var(--muted) / 0.3)' }}
              >
                {secondaryArchetype.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trait bars */}
      <div className="px-4 pb-4 pt-3 space-y-2">
        {TRAIT_LABELS.map(trait => {
          const value = personality.traits[trait.key];
          return (
            <div key={trait.key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-muted-foreground font-medium">{trait.label}</span>
                <span className="text-[10px] font-bold tabular-nums">{value}</span>
              </div>
              <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", trait.color)}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

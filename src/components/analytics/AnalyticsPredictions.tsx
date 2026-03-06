import {
  Clock,
  TrendingUp,
  Coins,
  Grid3x3,
  Crown,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Prediction } from "@/types/analytics";

interface PredictionsProps {
  predictions: Prediction[];
  isPremium: boolean;
  onUpgrade: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  TrendingUp,
  Coins,
  Grid3x3,
  Sparkles,
};

const CONFIDENCE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'High' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Med' },
  low: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Low' },
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <ArrowUp className="w-3 h-3 text-green-500" />;
  if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export const AnalyticsPredictions = ({ predictions, isPremium, onUpgrade }: PredictionsProps) => {
  if (predictions.length === 0) {
    return (
      <div className="retro-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">Predictions</span>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="text-xs">Predictions will appear after a few sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-bold">Predictions</span>
        <span className="ml-auto text-[10px] text-muted-foreground">AI-powered</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {predictions.map((prediction, index) => {
          const IconComponent = ICON_MAP[prediction.icon] || Sparkles;
          const confidence = CONFIDENCE_STYLES[prediction.confidence] || CONFIDENCE_STYLES.medium;
          const isLocked = !isPremium && index > 0;

          return (
            <div
              key={prediction.id}
              className={cn(
                "relative p-3 rounded-lg border border-border/50 bg-muted/10",
                isLocked && "blur-[4px] select-none pointer-events-none"
              )}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <IconComponent className="w-3.5 h-3.5 text-primary" />
                <TrendIcon trend={prediction.trend} />
              </div>
              <div className="text-base font-extrabold tabular-nums leading-tight">
                {prediction.value}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">
                {prediction.label}
              </div>
              {prediction.date && (
                <div className="text-[9px] text-muted-foreground/60 mt-1">
                  by {prediction.date}
                </div>
              )}
              <div className={cn("inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold mt-1.5", confidence.bg, confidence.text)}>
                {confidence.label} confidence
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium CTA for free users */}
      {!isPremium && predictions.length > 1 && (
        <button
          onClick={onUpgrade}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98] mt-3"
          style={{
            background: 'linear-gradient(135deg, hsl(35 80% 50% / 0.12) 0%, hsl(35 90% 40% / 0.06) 100%)',
            border: '1.5px solid hsl(35 70% 50% / 0.25)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700">Unlock all predictions</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-500/60" />
        </button>
      )}
    </div>
  );
};

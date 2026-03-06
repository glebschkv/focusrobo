import { useState, memo, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { FocusCategory, FOCUS_CATEGORIES } from "@/types/analytics";
import { TimerPreset } from "./constants";
import { PixelIcon } from "@/components/ui/PixelIcon";

interface TaskIntentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (category: FocusCategory, taskLabel?: string) => void;
  selectedPreset: TimerPreset;
}

const CATEGORY_COLORS: Record<FocusCategory, { bg: string; border: string; text: string; activeBg: string }> = {
  work: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    activeBg: "bg-blue-100",
  },
  study: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-700",
    activeBg: "bg-purple-100",
  },
  creative: {
    bg: "bg-pink-50",
    border: "border-pink-300",
    text: "text-pink-700",
    activeBg: "bg-pink-100",
  },
  personal: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-700",
    activeBg: "bg-green-100",
  },
  health: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    activeBg: "bg-orange-100",
  },
  other: {
    bg: "bg-teal-50",
    border: "border-teal-300",
    text: "text-teal-700",
    activeBg: "bg-teal-100",
  },
};

function getPetSizeHint(duration: number): { emoji: string; label: string } | null {
  if (duration < 25) return null;
  if (duration < 60) return { emoji: '🌱', label: 'Baby pet' };
  if (duration < 120) return { emoji: '🌿', label: 'Teen pet' };
  return { emoji: '🌳', label: 'Adult pet' };
}

export const TaskIntentionModal = memo(({
  isOpen,
  onClose,
  onStart,
  selectedPreset,
}: TaskIntentionModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState<FocusCategory>("work");
  const [taskLabel, setTaskLabel] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    onStart(selectedCategory, taskLabel.trim() || undefined);
    setTaskLabel("");
  };

  const handleClose = () => {
    setTaskLabel("");
    onClose();
  };

  const petHint = getPetSizeHint(selectedPreset.duration);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DrawerContent className="max-h-[80vh] pb-safe">
        <VisuallyHidden>
          <DrawerTitle>Ready to Focus?</DrawerTitle>
        </VisuallyHidden>

        <div className="px-5 pt-1 pb-6 space-y-5">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-2"
              style={{
                background: 'hsl(var(--primary) / 0.1)',
              }}
            >
              <PixelIcon name="target" size={24} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Ready to Focus?
            </h2>
          </div>

          {/* Category Pills — horizontal scroll */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Category
            </label>
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {FOCUS_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const colors = CATEGORY_COLORS[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full border whitespace-nowrap",
                      "transition-all duration-150 active:scale-95 touch-manipulation flex-shrink-0",
                      isSelected
                        ? cn(colors.activeBg, colors.border, colors.text, "font-semibold")
                        : "bg-background border-border text-muted-foreground hover:border-foreground/20"
                    )}
                  >
                    <PixelIcon name={cat.icon} size={18} />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Input — inline */}
          <input
            value={taskLabel}
            onChange={(e) => setTaskLabel(e.target.value)}
            placeholder="What's your focus? (optional)"
            className={cn(
              "w-full px-4 py-3 rounded-xl text-sm text-foreground",
              "bg-muted/50 border border-border",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20",
              "transition-all duration-150"
            )}
            maxLength={50}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
          />

          {/* Duration Display */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <PixelIcon name="hourglass" size={18} />
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {selectedPreset.duration === Infinity ? '∞' : `${selectedPreset.duration} min`}
                </span>
                <span className="text-xs text-muted-foreground ml-1.5">
                  {selectedPreset.name}
                </span>
              </div>
            </div>
            {petHint && (
              <span className="text-[11px] text-muted-foreground font-medium">
                {petHint.emoji} {petHint.label}
              </span>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className={cn(
              "w-full py-3.5 rounded-xl font-bold text-sm text-white tracking-wide",
              "transition-all duration-150 touch-manipulation select-none",
              "active:scale-[0.97]"
            )}
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 3px 0 hsl(var(--primary) / 0.7), 0 6px 16px hsl(var(--primary) / 0.2)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <PixelIcon name="play" size={16} />
              Start Focus
            </span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}, (prev, next) =>
  prev.isOpen === next.isOpen && prev.selectedPreset === next.selectedPreset
);

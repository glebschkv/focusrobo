/**
 * ZoneGrid Component
 *
 * Renders the zone selection grid.
 * Extracted from BotCollectionGrid for better maintainability.
 */

import { memo, useCallback, useRef } from "react";
import {
  Factory,
  Wrench,
  MapPin,
  Sun,
  Eye,
  Leaf,
  Building2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ZONE_DATABASE } from "@/data/RobotDatabase";

// Zone icons match zone themes
const ZONE_ICONS = {
  'Assembly Line': Factory,
  'Workshop': Wrench,
  'Stealth Lab': Eye,
  'Biotech Zone': Leaf,
  'Solar Fields': Sun,
  'Cyber District': Building2,
} as const;

interface ZoneGridProps {
  currentLevel: number;
  currentBiome: string;
  equippedBackground: string | null;
  onSwitchBiome: (biomeName: string) => void;
}

export const ZoneGrid = memo(({
  currentLevel,
  currentBiome,
  equippedBackground,
  onSwitchBiome,
}: ZoneGridProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((zone: typeof ZONE_DATABASE[number], isUnlocked: boolean) => {
    if (isUnlocked) {
      onSwitchBiome(zone.name);
    }
  }, [onSwitchBiome]);

  // Keyboard navigation for arrow keys within the list
  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    const total = ZONE_DATABASE.length;
    let nextIndex = currentIndex;
    let handled = false;

    switch (e.key) {
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : total - 1;
        handled = true;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex < total - 1 ? currentIndex + 1 : 0;
        handled = true;
        break;
      case 'Home':
        nextIndex = 0;
        handled = true;
        break;
      case 'End':
        nextIndex = total - 1;
        handled = true;
        break;
      default:
        return;
    }

    if (handled) {
      e.preventDefault();
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (buttons && buttons[nextIndex]) {
        buttons[nextIndex].focus();
      }
    }
  }, []);

  return (
    <div ref={listRef} className="space-y-2" role="listbox" aria-label="Zone selection">
      {ZONE_DATABASE.map((zone, index) => {
        const Icon = ZONE_ICONS[zone.name as keyof typeof ZONE_ICONS] || Sun;
        const isActive = zone.name === currentBiome && !equippedBackground;
        const isUnlocked = zone.unlockLevel <= currentLevel;

        return (
          <button
            key={zone.name}
            onClick={() => handleClick(zone, isUnlocked)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={!isUnlocked}
            role="option"
            aria-selected={isActive}
            aria-label={isUnlocked ? `${zone.name} zone${isActive ? ', currently selected' : ''}` : `${zone.name} zone, locked, unlocks at level ${zone.unlockLevel}`}
            className={cn(
              "w-full overflow-hidden transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[hsl(180,60%,50%)] rounded-lg",
              isActive
                ? "ring-2 ring-[hsl(180,60%,50%)] bg-[hsl(256,38%,19%)] border border-[hsl(180,40%,35%)]"
                : "bg-[hsl(256,35%,17%)] border border-[hsl(255,35%,28%)]",
              !isUnlocked && "opacity-40"
            )}
          >
            <div className="flex items-stretch">
              {/* Preview Image */}
              <div className="w-20 h-16 flex-shrink-0 bg-[hsl(252,30%,13%)] overflow-hidden">
                {zone.backgroundImage && isUnlocked ? (
                  <img
                    src={zone.backgroundImage}
                    alt={zone.name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {isUnlocked ? (
                      <Icon className="w-6 h-6 text-[hsl(255,22%,42%)]" />
                    ) : (
                      <Lock className="w-5 h-5 text-[hsl(255,15%,38%)]" />
                    )}
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 flex items-center justify-between px-3 py-2">
                <div className="text-left">
                  <div className="font-bold text-sm text-[hsl(45,20%,80%)]">
                    {isUnlocked ? zone.name : "???"}
                  </div>
                  <div className="text-[10px] text-[hsl(255,18%,48%)]">
                    {isUnlocked ? (
                      isActive ? 'Currently here' : `Level ${zone.unlockLevel}+`
                    ) : (
                      `Unlock at Lv.${zone.unlockLevel}`
                    )}
                  </div>
                </div>

                {isUnlocked && (
                  isActive ? (
                    <div className="px-2 py-1 text-[10px] font-bold flex items-center gap-1 rounded-md bg-[hsl(180,40%,30%)] text-[hsl(180,80%,75%)] border border-[hsl(180,40%,40%)]">
                      <MapPin className="w-3 h-3" />
                      Here
                    </div>
                  ) : (
                    <div className="px-3 py-1 text-xs font-semibold rounded-md bg-[hsl(256,30%,24%)] text-[hsl(255,20%,58%)] border border-[hsl(255,30%,32%)]">
                      Visit
                    </div>
                  )
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
});

ZoneGrid.displayName = 'ZoneGrid';

/** @deprecated Use ZoneGrid instead */
export const WorldGrid = ZoneGrid;

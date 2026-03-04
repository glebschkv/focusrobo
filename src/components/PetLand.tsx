/**
 * PetLand Component
 *
 * The home screen — displays a floating isometric island where pets are placed
 * after focus sessions. Pets are positioned organically across the island surface
 * with depth-based scaling and z-ordering.
 *
 * Touch-drag rotates the island in 3D (limited ±28° with spring-back physics).
 * Rotation uses direct DOM updates (ref-based) to avoid React re-renders.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLandStore, LAND_SIZE } from '@/stores/landStore';
import { IslandPet } from '@/components/IslandPet';
import { ISLAND_POSITIONS, getDepthZIndex } from '@/data/islandPositions';
import { useHaptics } from '@/hooks/useHaptics';

/** Get time-of-day lighting color */
function getTimeOfDayColor(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return 'rgba(255, 200, 100, 0.06)'; // morning golden
  if (hour >= 10 && hour < 16) return 'transparent'; // midday clear
  if (hour >= 16 && hour < 20) return 'rgba(255, 150, 100, 0.08)'; // evening amber
  return 'rgba(100, 120, 200, 0.10)'; // night blue
}

/** Get growth stage class based on fill count */
function getGrowthStage(count: number): string {
  if (count < 25) return 'pet-land--sparse';
  if (count < 50) return 'pet-land--growing';
  if (count < 75) return 'pet-land--lush';
  return 'pet-land--paradise';
}

// -- Touch rotation constants --
const MAX_ROTATE_Y = 28; // degrees
const DRAG_SENSITIVITY = 0.7; // degrees per pixel of horizontal drag
const SPRING_STIFFNESS = 0.1; // spring return speed
const SPRING_DAMPING = 0.78; // velocity decay per frame
const MOMENTUM_DECAY = 0.95; // velocity decay on release
const MIN_VELOCITY = 0.1; // stop threshold

/** DEBUG: Award a random pet at a random session length */
const useDebugAwardPet = () => {
  const generateRandomPet = useLandStore((s) => s.generateRandomPet);
  const placePendingPet = useLandStore((s) => s.placePendingPet);

  return useCallback(() => {
    const durations = [25, 30, 45, 60, 90, 120, 180];
    const mins = durations[Math.floor(Math.random() * durations.length)];
    const level = Math.floor(Math.random() * 40) + 1;
    generateRandomPet(mins, level);
    placePendingPet();
  }, [generateRandomPet, placePendingPet]);
};

/** Touch-drag rotation hook — ref-based DOM updates to avoid React re-renders */
function useIslandRotation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const currentAngle = useRef(0);
  const animFrameId = useRef<number>(0);

  const updateCSS = useCallback(() => {
    containerRef.current?.style.setProperty('--island-rotate-y', `${currentAngle.current}deg`);
  }, []);

  // Spring animation — runs when not dragging to return to 0
  const animateSpring = useCallback(() => {
    if (isDragging.current) return;

    const angle = currentAngle.current;

    // Apply momentum decay
    velocity.current *= MOMENTUM_DECAY;

    // Spring force toward 0
    const springForce = -angle * SPRING_STIFFNESS;
    velocity.current += springForce;
    velocity.current *= SPRING_DAMPING;

    currentAngle.current = Math.max(-MAX_ROTATE_Y, Math.min(MAX_ROTATE_Y,
      angle + velocity.current
    ));

    updateCSS();

    // Stop when close to 0 and slow
    if (Math.abs(currentAngle.current) < 0.3 && Math.abs(velocity.current) < MIN_VELOCITY) {
      currentAngle.current = 0;
      velocity.current = 0;
      updateCSS();
      return;
    }

    animFrameId.current = requestAnimationFrame(animateSpring);
  }, [updateCSS]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only respond to primary pointer (touch or left mouse)
    if (e.button !== 0) return;
    isDragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    cancelAnimationFrame(animFrameId.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;

    velocity.current = dx * DRAG_SENSITIVITY;
    currentAngle.current = Math.max(-MAX_ROTATE_Y, Math.min(MAX_ROTATE_Y,
      currentAngle.current + dx * DRAG_SENSITIVITY
    ));
    updateCSS();
  }, [updateCSS]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // Start spring-back animation
    animFrameId.current = requestAnimationFrame(animateSpring);
  }, [animateSpring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameId.current);
  }, []);

  return {
    containerRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}

export const PetLand = () => {
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const debugAwardPet = useDebugAwardPet();
  const lastPlacedIndex = useLandStore((s) => s.lastPlacedIndex);
  const landJustCompleted = useLandStore((s) => s.landJustCompleted);
  const clearLastPlaced = useLandStore((s) => s.clearLastPlaced);
  const clearLandCompleted = useLandStore((s) => s.clearLandCompleted);
  const milestoneReached = useLandStore((s) => s.milestoneReached);
  const clearMilestone = useLandStore((s) => s.clearMilestone);
  const { haptic } = useHaptics();
  const progressPct = (filledCount / LAND_SIZE) * 100;

  // Ref-based touch-drag rotation (no React re-renders during drag)
  const { containerRef, handlers: rotationHandlers } = useIslandRotation();

  // Single active tooltip — only one pet tooltip open at a time
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  // Clear the "new pet" glow after 8 seconds
  useEffect(() => {
    if (lastPlacedIndex !== null) {
      const timer = setTimeout(clearLastPlaced, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastPlacedIndex, clearLastPlaced]);

  // Auto-dismiss land completion overlay
  useEffect(() => {
    if (landJustCompleted !== null) {
      haptic('heavy');
      const timer = setTimeout(clearLandCompleted, 3500);
      return () => clearTimeout(timer);
    }
  }, [landJustCompleted, clearLandCompleted, haptic]);

  // Auto-dismiss milestone overlay
  useEffect(() => {
    if (milestoneReached !== null) {
      haptic('success');
      const timer = setTimeout(clearMilestone, 2500);
      return () => clearTimeout(timer);
    }
  }, [milestoneReached, clearMilestone, haptic]);

  const handleToggleTooltip = useCallback((index: number) => {
    setActiveTooltipIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleCloseTooltips = useCallback(() => {
    setActiveTooltipIndex(null);
  }, []);

  const slotElements = useMemo(() => {
    return currentLand.cells.map((cell, index) => {
      if (cell) {
        return (
          <IslandPet
            key={`${currentLand.id}-${index}`}
            cell={cell}
            index={index}
            isNew={index === lastPlacedIndex}
            showTooltip={activeTooltipIndex === index}
            onToggleTooltip={() => handleToggleTooltip(index)}
          />
        );
      }
      // Render subtle empty slot marker
      const pos = ISLAND_POSITIONS[index];
      if (!pos) return null;
      return (
        <div
          key={`${currentLand.id}-empty-${index}`}
          className="island-slot-marker"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            zIndex: getDepthZIndex(index),
          }}
        />
      );
    });
  }, [currentLand.cells, currentLand.id, lastPlacedIndex, activeTooltipIndex, handleToggleTooltip]);

  const growthClass = getGrowthStage(filledCount);
  const lightingColor = useMemo(() => getTimeOfDayColor(), []);

  // Ambient particles — 6 floating motes
  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      top: `${20 + Math.random() * 50}%`,
      duration: `${6 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
      background: i % 2 === 0
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(200, 230, 120, 0.4)',
    }));
  }, []);

  return (
    <div className={`pet-land ${growthClass}`}>
      {/* SVG noise filter for grass texture */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="grass-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
      </svg>

      {/* Sky with sun and clouds */}
      <div className="pet-land__sky">
        <div className="pet-land__sun" />
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
        <div className="pet-land__cloud pet-land__cloud--distant" />
        {/* Distant scenery — hills/mountains behind island */}
        <div className="pet-land__scenery" />
      </div>

      {/* Time-of-day lighting overlay */}
      <div
        className="pet-land__lighting"
        style={{ background: lightingColor }}
      />

      {/* Floating island — wrapper handles the bob animation */}
      <div
        className="pet-land__island-wrapper"
        {...rotationHandlers}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Ambient floating particles — constrained to island area */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="pet-land__particle"
            style={{
              left: p.left,
              top: p.top,
              animationDuration: p.duration,
              animationDelay: p.delay,
              background: p.background,
            }}
          />
        ))}

        {/* 3D tilted island container — rotateY driven by touch drag via CSS variable */}
        <div
          className="pet-land__island-container"
          ref={containerRef}
        >
          {/* Island surface (grass top) */}
          <div className="pet-land__island-surface">
            <div className="pet-land__island-grass-detail" />
          </div>

          {/* Unified cliff side */}
          <div className="pet-land__cliff" />

          {/* CSS decorations that appear as island fills */}
          <div className="pet-land__deco-layer">
            <div className="pet-land__tree pet-land__tree--1" />
            <div className="pet-land__tree pet-land__tree--2" />
            <div className="pet-land__bush pet-land__bush--1" />
            <div className="pet-land__bush pet-land__bush--2" />
            <div className="pet-land__bush pet-land__bush--3" />
            <div className="pet-land__rock pet-land__rock--1" />
            <div className="pet-land__rock pet-land__rock--2" />
          </div>

          {/* Waterfall cascading from cliff */}
          <div className="pet-land__waterfall" />

          {/* Soft shadow beneath floating island */}
          <div className="pet-land__island-shadow" />

          {/* Pets layer — absolutely positioned pets */}
          <div
            className="pet-land__pets-layer"
            onClick={handleCloseTooltips}
          >
            {slotElements}

            {/* Empty state hint for new users */}
            {filledCount === 0 && (
              <div className="pet-land__empty-hint">
                <span className="pet-land__empty-hint-text">
                  Complete a focus session<br />to earn your first pet!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Land completion celebration overlay */}
      {landJustCompleted !== null && (
        <div className="pet-land__land-complete" onClick={clearLandCompleted}>
          <span className="pet-land__land-complete-text">
            Land {landJustCompleted} Complete!
          </span>
          <span className="pet-land__land-complete-sub">
            Starting a new island...
          </span>
        </div>
      )}

      {/* Milestone celebration */}
      {milestoneReached !== null && (
        <div className="pet-land__milestone" onClick={clearMilestone}>
          <span className="pet-land__milestone-text">{milestoneReached}% filled!</span>
          <span className="pet-land__milestone-sub">Your island is growing</span>
        </div>
      )}

      {/* Land progress bar + label */}
      <div className="pet-land__progress">
        <div className="pet-land__progress-bar-track">
          <div className="pet-land__progress-bar-fill" style={{ width: `${progressPct}%` }} />
          <div className="pet-land__progress-marker" style={{ left: '25%' }} />
          <div className="pet-land__progress-marker" style={{ left: '50%' }} />
          <div className="pet-land__progress-marker" style={{ left: '75%' }} />
        </div>
        <span className="pet-land__progress-label">
          Land {currentLand.number} · {filledCount}/{LAND_SIZE}
        </span>
      </div>

      {/* DEBUG: Award pet button — only renders in development */}
      {import.meta.env.DEV && (
        <button
          onClick={debugAwardPet}
          style={{
            position: 'fixed',
            bottom: 100,
            right: 16,
            zIndex: 9999,
            padding: '8px 14px',
            background: 'rgba(76, 175, 80, 0.9)',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          + Award Pet
        </button>
      )}
    </div>
  );
};

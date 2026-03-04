/**
 * PetLand Component
 *
 * Home screen — flat isometric diamond island where pets are placed after
 * focus sessions. Touch-drag rotates the island on Y axis.
 * Rotation uses direct DOM updates (ref-based) to avoid React re-renders.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLandStore, LAND_SIZE } from '@/stores/landStore';
import { IslandPet } from '@/components/IslandPet';
import { ISLAND_POSITIONS, getDepthZIndex } from '@/data/islandPositions';
import { useHaptics } from '@/hooks/useHaptics';

function getGrowthStage(count: number): string {
  if (count < 25) return 'pet-land--sparse';
  if (count < 50) return 'pet-land--growing';
  if (count < 75) return 'pet-land--lush';
  return 'pet-land--paradise';
}

// Touch rotation constants
const MAX_ROTATE_Y = 25;
const DRAG_SENSITIVITY = 0.7;
const SPRING_STIFFNESS = 0.1;
const SPRING_DAMPING = 0.78;
const MOMENTUM_DECAY = 0.95;
const MIN_VELOCITY = 0.1;

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

/** Ref-based touch rotation — zero React re-renders during drag */
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

  const animateSpring = useCallback(() => {
    if (isDragging.current) return;

    velocity.current *= MOMENTUM_DECAY;
    const springForce = -currentAngle.current * SPRING_STIFFNESS;
    velocity.current += springForce;
    velocity.current *= SPRING_DAMPING;

    currentAngle.current = Math.max(-MAX_ROTATE_Y, Math.min(MAX_ROTATE_Y,
      currentAngle.current + velocity.current
    ));
    updateCSS();

    if (Math.abs(currentAngle.current) < 0.3 && Math.abs(velocity.current) < MIN_VELOCITY) {
      currentAngle.current = 0;
      velocity.current = 0;
      updateCSS();
      return;
    }

    animFrameId.current = requestAnimationFrame(animateSpring);
  }, [updateCSS]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
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
    animFrameId.current = requestAnimationFrame(animateSpring);
  }, [animateSpring]);

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

  const { containerRef, handlers: rotationHandlers } = useIslandRotation();
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  // Clear new pet glow after 8 seconds
  useEffect(() => {
    if (lastPlacedIndex !== null) {
      const timer = setTimeout(clearLastPlaced, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastPlacedIndex, clearLastPlaced]);

  // Auto-dismiss land completion
  useEffect(() => {
    if (landJustCompleted !== null) {
      haptic('heavy');
      const timer = setTimeout(clearLandCompleted, 3500);
      return () => clearTimeout(timer);
    }
  }, [landJustCompleted, clearLandCompleted, haptic]);

  // Auto-dismiss milestone
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

  const particles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      top: `${20 + Math.random() * 50}%`,
      duration: `${6 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
      background: i % 2 === 0
        ? 'rgba(255, 255, 255, 0.4)'
        : 'rgba(200, 230, 120, 0.3)',
    }));
  }, []);

  return (
    <div className={`pet-land ${growthClass}`}>
      {/* Sky */}
      <div className="pet-land__sky">
        <div className="pet-land__sun" />
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
        <div className="pet-land__scenery" />
      </div>

      {/* Floating island */}
      <div
        className="pet-land__island-wrapper"
        {...rotationHandlers}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Ambient particles */}
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

        {/* Island container — rotateY driven by touch drag via CSS variable */}
        <div className="pet-land__island-container" ref={containerRef}>
          {/* Diamond grass surface */}
          <div className="pet-land__island-surface">
            <div className="pet-land__island-grass-detail" />
          </div>

          {/* Subtle grid overlay */}
          <div className="pet-land__island-grid" />

          {/* Dirt/earth edge visible beneath grass */}
          <div className="pet-land__island-edge" />

          {/* Shadow beneath island */}
          <div className="pet-land__island-shadow" />

          {/* Pets layer */}
          <div className="pet-land__pets-layer" onClick={handleCloseTooltips}>
            {slotElements}

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

      {/* Land completion overlay */}
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

      {/* Milestone */}
      {milestoneReached !== null && (
        <div className="pet-land__milestone" onClick={clearMilestone}>
          <span className="pet-land__milestone-text">{milestoneReached}% filled!</span>
          <span className="pet-land__milestone-sub">Your island is growing</span>
        </div>
      )}

      {/* Progress bar */}
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

      {/* Debug button — dev only */}
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

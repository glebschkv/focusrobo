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
import { IslandSVG } from '@/components/IslandSVG';
import { useHaptics } from '@/hooks/useHaptics';

function getGrowthStage(count: number): string {
  if (count < 25) return 'pet-land--sparse';
  if (count < 50) return 'pet-land--growing';
  if (count < 75) return 'pet-land--lush';
  return 'pet-land--paradise';
}

// Parallax tilt constants
const MAX_OFFSET = 12; // max px shift for the deepest layer
const DRAG_SENSITIVITY = 0.5;
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.8;
const MOMENTUM_DECAY = 0.94;
const MIN_VELOCITY = 0.05;

// Parallax layer speeds (higher = moves more)
const LAYER_SKY = 0.15;
const LAYER_ISLAND = 0.5;
const LAYER_PETS = 0.85;

// Zoom constants
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 2.0;
const ZOOM_DEFAULT = 1.0;
const ZOOM_WHEEL_STEP = 0.06;
const ZOOM_DOUBLE_TAP = 1.5;


/** Ref-based parallax tilt + zoom — zero React re-renders during drag/pinch */
function useIslandParallax() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const petsRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const currentOffset = useRef(0); // -MAX_OFFSET to +MAX_OFFSET
  const animFrameId = useRef<number>(0);

  // Zoom state
  const currentZoom = useRef(ZOOM_DEFAULT);
  const isPinching = useRef(false);
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(ZOOM_DEFAULT);
  const lastTapTime = useRef(0);

  const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

  const updateCSS = useCallback(() => {
    const offset = currentOffset.current;
    if (skyRef.current) {
      skyRef.current.style.transform = `translateX(${offset * LAYER_SKY}px)`;
    }
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${offset * LAYER_ISLAND}px) scale(${currentZoom.current})`;
    }
    if (petsRef.current) {
      petsRef.current.style.transform = `translateX(${offset * LAYER_PETS}px)`;
    }
  }, []);

  const animateSpring = useCallback(() => {
    if (isDragging.current) return;

    velocity.current *= MOMENTUM_DECAY;
    const springForce = -currentOffset.current * SPRING_STIFFNESS;
    velocity.current += springForce;
    velocity.current *= SPRING_DAMPING;

    currentOffset.current = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET,
      currentOffset.current + velocity.current
    ));
    updateCSS();

    if (Math.abs(currentOffset.current) < 0.2 && Math.abs(velocity.current) < MIN_VELOCITY) {
      currentOffset.current = 0;
      velocity.current = 0;
      updateCSS();
      return;
    }

    animFrameId.current = requestAnimationFrame(animateSpring);
  }, [updateCSS]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (isPinching.current) return;
    isDragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    cancelAnimationFrame(animFrameId.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || isPinching.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    velocity.current = dx * DRAG_SENSITIVITY;
    currentOffset.current = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET,
      currentOffset.current + dx * DRAG_SENSITIVITY
    ));
    updateCSS();
  }, [updateCSS]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    animFrameId.current = requestAnimationFrame(animateSpring);
  }, [animateSpring]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_WHEEL_STEP : ZOOM_WHEEL_STEP;
    currentZoom.current = clampZoom(currentZoom.current + delta);
    updateCSS();
  }, [updateCSS]);

  // Touch pinch-to-zoom
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function getTouchDist(e: TouchEvent): number {
      const [a, b] = [e.touches[0], e.touches[1]];
      return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        isPinching.current = true;
        isDragging.current = false;
        pinchStartDist.current = getTouchDist(e);
        pinchStartZoom.current = currentZoom.current;
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
          currentZoom.current = currentZoom.current > 1.1 ? ZOOM_DEFAULT : ZOOM_DOUBLE_TAP;
          updateCSS();
          lastTapTime.current = 0;
          e.preventDefault();
        } else {
          lastTapTime.current = now;
        }
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (isPinching.current && e.touches.length === 2) {
        const dist = getTouchDist(e);
        const ratio = dist / pinchStartDist.current;
        currentZoom.current = clampZoom(pinchStartZoom.current * ratio);
        updateCSS();
        e.preventDefault();
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (isPinching.current && e.touches.length < 2) {
        isPinching.current = false;
      }
    }

    wrapper.addEventListener('touchstart', onTouchStart, { passive: false });
    wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
    wrapper.addEventListener('touchend', onTouchEnd);
    wrapper.addEventListener('touchcancel', onTouchEnd);

    return () => {
      wrapper.removeEventListener('touchstart', onTouchStart);
      wrapper.removeEventListener('touchmove', onTouchMove);
      wrapper.removeEventListener('touchend', onTouchEnd);
      wrapper.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [updateCSS]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameId.current);
  }, []);

  return {
    wrapperRef,
    skyRef,
    containerRef,
    petsRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onWheel: handleWheel,
    },
  };
}

export const PetLand = () => {
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const lastPlacedIndex = useLandStore((s) => s.lastPlacedIndex);
  const landJustCompleted = useLandStore((s) => s.landJustCompleted);
  const clearLastPlaced = useLandStore((s) => s.clearLastPlaced);
  const clearLandCompleted = useLandStore((s) => s.clearLandCompleted);
  const milestoneReached = useLandStore((s) => s.milestoneReached);
  const clearMilestone = useLandStore((s) => s.clearMilestone);
  const { haptic } = useHaptics();
  const progressPct = (filledCount / LAND_SIZE) * 100;

  const { wrapperRef, skyRef, containerRef, petsRef, handlers: parallaxHandlers } = useIslandParallax();
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

  const speciesAffinity = useLandStore((s) => s.speciesAffinity);

  const slotElements = useMemo(() => {
    return currentLand.cells.map((cell, index) => {
      if (cell) {
        const affinityCount = speciesAffinity[cell.petId] || 0;
        return (
          <IslandPet
            key={`${currentLand.id}-${index}`}
            cell={cell}
            index={index}
            isNew={index === lastPlacedIndex}
            isDevotion={affinityCount >= 10}
            showTooltip={activeTooltipIndex === index}
            onToggleTooltip={() => handleToggleTooltip(index)}
          />
        );
      }
      return null;
    });
  }, [currentLand.cells, currentLand.id, lastPlacedIndex, speciesAffinity, activeTooltipIndex, handleToggleTooltip]);

  const growthClass = getGrowthStage(filledCount);

  const particles = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${15 + Math.random() * 55}%`,
      duration: `${7 + Math.random() * 5}s`,
      delay: `${Math.random() * 6}s`,
      background: [
        'rgba(255, 255, 240, 0.5)',
        'rgba(255, 240, 200, 0.4)',
        'rgba(200, 230, 120, 0.3)',
        'rgba(255, 255, 255, 0.45)',
      ][i % 4],
    }));
  }, []);

  const sparkles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: `${8 + Math.random() * 84}%`,
      top: `${10 + Math.random() * 60}%`,
      duration: `${3 + Math.random() * 3}s`,
      delay: `${Math.random() * 4}s`,
    }));
  }, []);

  return (
    <div className={`pet-land ${growthClass}`}>
      {/* Sky — parallax layer (slowest) */}
      <div className="pet-land__sky" ref={skyRef}>
        {/* Sun with atmospheric glow */}
        <div className="pet-land__sun" />

        {/* God rays from sun */}
        <div className="pet-land__rays">
          <div className="pet-land__ray pet-land__ray--1" />
          <div className="pet-land__ray pet-land__ray--2" />
          <div className="pet-land__ray pet-land__ray--3" />
          <div className="pet-land__ray pet-land__ray--4" />
          <div className="pet-land__ray pet-land__ray--5" />
        </div>

        {/* Clouds — 5 layers at varying depths */}
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
        <div className="pet-land__cloud pet-land__cloud--4" />
        <div className="pet-land__cloud pet-land__cloud--5" />

        {/* Distant landscape silhouettes */}
        <div className="pet-land__mountains-far" />
        <div className="pet-land__mountains-near" />
        <div className="pet-land__treeline" />

        {/* Warm horizon haze */}
        <div className="pet-land__haze" />
      </div>

      {/* Floating island — parallax drag handler */}
      <div
        ref={wrapperRef}
        className="pet-land__island-wrapper"
        {...parallaxHandlers}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Ambient dust motes */}
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
              color: p.background,
            }}
          />
        ))}

        {/* Glinting sparkles */}
        {sparkles.map((s) => (
          <div
            key={`sparkle-${s.id}`}
            className="pet-land__sparkle"
            style={{
              left: s.left,
              top: s.top,
              animationDuration: s.duration,
              animationDelay: s.delay,
            }}
          />
        ))}

        {/* Island container — parallax layer (medium) */}
        <div className="pet-land__island-container" ref={containerRef}>
          {/* Pixel-art island — SVG with flat fills */}
          <IslandSVG />

          {/* Shadow beneath island */}
          <div className="pet-land__island-shadow" />

          {/* Pets layer — parallax layer (fastest) */}
          <div className="pet-land__pets-layer" ref={petsRef} onClick={handleCloseTooltips}>
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

    </div>
  );
};

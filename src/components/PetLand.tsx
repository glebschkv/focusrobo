/**
 * PetLand Component
 *
 * Home screen — flat isometric diamond island where pets are placed after
 * focus sessions. Touch-drag rotates the island on Y axis.
 * Rotation uses direct DOM updates (ref-based) to avoid React re-renders.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLandStore } from '@/stores/landStore';
import { IslandPet } from '@/components/IslandPet';
import { PetDetailCard } from '@/components/PetDetailCard';
import { IslandSVG } from '@/components/IslandSVG';
import { useHaptics } from '@/hooks/useHaptics';
import { getIslandScale, getAvailableCellCount } from '@/data/islandPositions';
import type { LandCell } from '@/stores/landStore';

function getGrowthStage(count: number): string {
  if (count < 25) return 'pet-land--sparse';
  if (count < 50) return 'pet-land--growing';
  if (count < 75) return 'pet-land--lush';
  return 'pet-land--paradise';
}

// Parallax tilt constants (used when zoom <= 1.0)
const MAX_OFFSET = 12;
const DRAG_SENSITIVITY = 0.5;
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.8;
const MOMENTUM_DECAY = 0.94;
const MIN_VELOCITY = 0.05;

// Parallax layer speeds
const LAYER_SKY = 0.15;
const LAYER_ISLAND = 0.5;
const LAYER_PETS = 0.85;

// Zoom constants
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 3.0;
const ZOOM_DEFAULT = 1.0;
const ZOOM_WHEEL_STEP = 0.08;
const ZOOM_DOUBLE_TAP = 2.0;

// Pan constants (used when zoom > 1.0)
const PAN_MOMENTUM_DECAY = 0.95;
const PAN_SPRING_STIFFNESS = 0.12;
const PAN_SPRING_DAMPING = 0.75;
const PAN_MIN_VELOCITY = 0.3;

/** Ref-based parallax tilt + zoom + pan — zero React re-renders */
function useIslandParallax() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const petsRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const velocity = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const currentOffset = useRef(0);
  const panX = useRef(0);
  const panY = useRef(0);
  const animFrameId = useRef<number>(0);

  // Zoom state
  const currentZoom = useRef(ZOOM_DEFAULT);
  const targetZoom = useRef(ZOOM_DEFAULT);
  const isPinching = useRef(false);
  const pinchStartDist = useRef(0);
  const pinchStartZoom = useRef(ZOOM_DEFAULT);
  const pinchCenterX = useRef(0);
  const pinchCenterY = useRef(0);
  const lastTapTime = useRef(0);
  const zoomAnimating = useRef(false);

  const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

  const isZoomed = () => currentZoom.current > 1.05;

  /** Compute max pan bounds based on zoom level */
  const getPanBounds = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return { maxX: 0, maxY: 0 };
    const z = currentZoom.current;
    const rect = wrapper.getBoundingClientRect();
    const maxX = Math.max(0, (rect.width * (z - 1)) / 2);
    const maxY = Math.max(0, (rect.height * (z - 1)) / 2);
    return { maxX, maxY };
  }, []);

  const clampPan = useCallback(() => {
    const { maxX, maxY } = getPanBounds();
    panX.current = Math.max(-maxX, Math.min(maxX, panX.current));
    panY.current = Math.max(-maxY, Math.min(maxY, panY.current));
  }, [getPanBounds]);

  const updateCSS = useCallback(() => {
    const offset = currentOffset.current;
    const z = currentZoom.current;
    const px = panX.current;
    const py = panY.current;

    if (skyRef.current) {
      skyRef.current.style.transform = `translate3d(${offset * LAYER_SKY}px, 0, 0)`;
    }
    if (scalerRef.current) {
      // Apply zoom + pan on the scaler so it encompasses the island and pets together
      scalerRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${z})`;
    }
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${offset * LAYER_ISLAND}px, 0, 0)`;
    }
    if (petsRef.current) {
      petsRef.current.style.transform = `translate3d(${offset * (LAYER_PETS - LAYER_ISLAND)}px, 0, 0)`;
    }
  }, []);

  /** Animate smooth zoom transition */
  const animateZoom = useCallback(() => {
    const diff = targetZoom.current - currentZoom.current;
    if (Math.abs(diff) < 0.005) {
      currentZoom.current = targetZoom.current;
      zoomAnimating.current = false;
      clampPan();
      updateCSS();
      return;
    }
    currentZoom.current += diff * 0.15;
    clampPan();
    updateCSS();
    requestAnimationFrame(animateZoom);
  }, [updateCSS, clampPan]);

  const smoothZoomTo = useCallback((z: number) => {
    targetZoom.current = clampZoom(z);
    if (!zoomAnimating.current) {
      zoomAnimating.current = true;
      requestAnimationFrame(animateZoom);
    }
  }, [animateZoom]);

  /** Parallax spring (zoom <= 1) */
  const animateParallaxSpring = useCallback(() => {
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

    animFrameId.current = requestAnimationFrame(animateParallaxSpring);
  }, [updateCSS]);

  /** Pan momentum + bounce (zoom > 1) */
  const animatePanSpring = useCallback(() => {
    if (isDragging.current) return;

    const { maxX, maxY } = getPanBounds();

    // Apply momentum
    panX.current += velocityX.current;
    panY.current += velocityY.current;

    // Rubber-band if out of bounds
    if (panX.current > maxX) {
      const overX = panX.current - maxX;
      panX.current = maxX + overX * 0.5;
      velocityX.current *= 0.5;
    } else if (panX.current < -maxX) {
      const overX = -maxX - panX.current;
      panX.current = -maxX - overX * 0.5;
      velocityX.current *= 0.5;
    }
    if (panY.current > maxY) {
      const overY = panY.current - maxY;
      panY.current = maxY + overY * 0.5;
      velocityY.current *= 0.5;
    } else if (panY.current < -maxY) {
      const overY = -maxY - panY.current;
      panY.current = -maxY - overY * 0.5;
      velocityY.current *= 0.5;
    }

    // Spring back to bounds
    if (panX.current > maxX) {
      velocityX.current += (maxX - panX.current) * PAN_SPRING_STIFFNESS;
    } else if (panX.current < -maxX) {
      velocityX.current += (-maxX - panX.current) * PAN_SPRING_STIFFNESS;
    }
    if (panY.current > maxY) {
      velocityY.current += (maxY - panY.current) * PAN_SPRING_STIFFNESS;
    } else if (panY.current < -maxY) {
      velocityY.current += (-maxY - panY.current) * PAN_SPRING_STIFFNESS;
    }

    velocityX.current *= PAN_MOMENTUM_DECAY;
    velocityY.current *= PAN_MOMENTUM_DECAY;
    velocityX.current *= PAN_SPRING_DAMPING;
    velocityY.current *= PAN_SPRING_DAMPING;

    updateCSS();

    const speed = Math.abs(velocityX.current) + Math.abs(velocityY.current);
    const inBounds = Math.abs(panX.current) <= maxX + 0.5 && Math.abs(panY.current) <= maxY + 0.5;
    if (speed < PAN_MIN_VELOCITY && inBounds) {
      clampPan();
      updateCSS();
      return;
    }

    animFrameId.current = requestAnimationFrame(animatePanSpring);
  }, [updateCSS, getPanBounds, clampPan]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (isPinching.current) return;
    isDragging.current = true;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    velocity.current = 0;
    velocityX.current = 0;
    velocityY.current = 0;
    cancelAnimationFrame(animFrameId.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || isPinching.current) return;
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;
    lastX.current = e.clientX;
    lastY.current = e.clientY;

    if (isZoomed()) {
      // Pan mode when zoomed in
      velocityX.current = dx;
      velocityY.current = dy;
      panX.current += dx;
      panY.current += dy;
      clampPan();
      updateCSS();
    } else {
      // Parallax tilt mode when not zoomed
      velocity.current = dx * DRAG_SENSITIVITY;
      currentOffset.current = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET,
        currentOffset.current + dx * DRAG_SENSITIVITY
      ));
      updateCSS();
    }
  }, [updateCSS, clampPan]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (isZoomed()) {
      animFrameId.current = requestAnimationFrame(animatePanSpring);
    } else {
      animFrameId.current = requestAnimationFrame(animateParallaxSpring);
    }
  }, [animateParallaxSpring, animatePanSpring]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_WHEEL_STEP : ZOOM_WHEEL_STEP;
    const newZoom = clampZoom(currentZoom.current + delta);
    smoothZoomTo(newZoom);

    // Reset pan when zooming back to 1x
    if (newZoom <= 1.05) {
      panX.current = 0;
      panY.current = 0;
    }
  }, [smoothZoomTo]);

  // Touch pinch-to-zoom + double-tap
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function getTouchDist(e: TouchEvent): number {
      const [a, b] = [e.touches[0], e.touches[1]];
      return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }

    function getTouchCenter(e: TouchEvent): { x: number; y: number } {
      const [a, b] = [e.touches[0], e.touches[1]];
      return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        isPinching.current = true;
        isDragging.current = false;
        pinchStartDist.current = getTouchDist(e);
        pinchStartZoom.current = currentZoom.current;
        const center = getTouchCenter(e);
        pinchCenterX.current = center.x;
        pinchCenterY.current = center.y;
        e.preventDefault();
      }

      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
          // Double-tap: toggle between 1x and zoomed, smooth animation
          if (currentZoom.current > 1.1) {
            smoothZoomTo(ZOOM_DEFAULT);
            panX.current = 0;
            panY.current = 0;
          } else {
            smoothZoomTo(ZOOM_DOUBLE_TAP);
          }
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
        const newZoom = clampZoom(pinchStartZoom.current * ratio);
        currentZoom.current = newZoom;
        targetZoom.current = newZoom;

        // Reset pan when zooming back to 1x
        if (newZoom <= 1.05) {
          panX.current = 0;
          panY.current = 0;
        }

        clampPan();
        updateCSS();
        e.preventDefault();
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (isPinching.current && e.touches.length < 2) {
        isPinching.current = false;
        // Snap to 1.0 if close
        if (currentZoom.current > 0.95 && currentZoom.current < 1.1) {
          smoothZoomTo(ZOOM_DEFAULT);
          panX.current = 0;
          panY.current = 0;
        }
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
  }, [updateCSS, smoothZoomTo, clampPan]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameId.current);
  }, []);

  return {
    wrapperRef,
    skyRef,
    containerRef,
    petsRef,
    scalerRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onWheel: handleWheel,
    },
    setZoom: (z: number) => {
      targetZoom.current = clampZoom(z);
      currentZoom.current = clampZoom(z);
      updateCSS();
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

  const gridSize = currentLand.gridSize || 5;
  const tierCapacity = getAvailableCellCount(gridSize);
  const tierScale = getIslandScale(gridSize);
  const progressPct = (filledCount / tierCapacity) * 100;

  const { wrapperRef, skyRef, containerRef, petsRef, scalerRef, handlers: parallaxHandlers, setZoom } = useIslandParallax();

  // Auto-zoom for larger islands so pets remain visible
  useEffect(() => {
    if (gridSize >= 17) setZoom(1.3);
    else if (gridSize >= 14) setZoom(1.15);
  }, [gridSize, setZoom]);

  // Pet detail card state (replaces old tooltip)
  const [selectedPet, setSelectedPet] = useState<{ cell: LandCell; index: number } | null>(null);

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

  const handlePetTap = useCallback((index: number) => {
    const cell = currentLand.cells[index];
    if (cell) {
      setSelectedPet({ cell, index });
    }
  }, [currentLand.cells]);

  const handleCloseDetail = useCallback(() => {
    setSelectedPet(null);
  }, []);

  // Determine how many pets for performance class
  const petCount = filledCount;

  // Build pet elements — memo() on IslandPet ensures minimal re-renders
  const slotElements = useMemo(() => {
    return currentLand.cells.map((cell, index) => {
      if (cell) {
        return (
          <IslandPet
            key={`${currentLand.id}-${index}`}
            cell={cell}
            index={index}
            gridSize={gridSize}
            isNew={index === lastPlacedIndex}
            showTooltip={false}
            onToggleTooltip={handlePetTap}
            reducedAnimations={petCount > 60}
          />
        );
      }
      return null;
    });
  }, [currentLand.cells, currentLand.id, gridSize, lastPlacedIndex, handlePetTap, petCount]);

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

  // Performance class: disable heavy animations when many pets
  const perfClass = petCount > 100 ? 'pet-land--perf-low' : petCount > 60 ? 'pet-land--perf-med' : '';

  return (
    <div className={`pet-land ${growthClass} ${perfClass}`}>
      {/* Sky — parallax layer (slowest) */}
      <div className="pet-land__sky" ref={skyRef}>
        <div className="pet-land__sun" />

        <div className="pet-land__rays">
          <div className="pet-land__ray pet-land__ray--1" />
          <div className="pet-land__ray pet-land__ray--2" />
          <div className="pet-land__ray pet-land__ray--3" />
          <div className="pet-land__ray pet-land__ray--4" />
          <div className="pet-land__ray pet-land__ray--5" />
        </div>

        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
        <div className="pet-land__cloud pet-land__cloud--4" />
        <div className="pet-land__cloud pet-land__cloud--5" />

        <div className="pet-land__mountains-far" />
        <div className="pet-land__mountains-near" />
        <div className="pet-land__treeline" />

        <div className="pet-land__haze" />
      </div>

      {/* Floating island — parallax drag handler */}
      <div
        ref={wrapperRef}
        className="pet-land__island-wrapper"
        {...parallaxHandlers}
        style={{ touchAction: 'none' }}
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

        {/* Zoom + pan layer (controlled by ref) */}
        <div
          className="pet-land__zoom-layer"
          ref={scalerRef}
        >
          {/* Island scaler — tier growth animation */}
          <div
            className="pet-land__island-scaler"
            style={{ transform: `scale(${tierScale})` }}
          >
            {/* Island container — parallax layer (medium) */}
            <div className="pet-land__island-container" ref={containerRef}>
            <IslandSVG gridSize={gridSize} />
            <div className="pet-land__island-shadow" />

            {/* Pets layer — parallax layer (fastest) */}
            <div className="pet-land__pets-layer" ref={petsRef} role="group" aria-label="Your pet island">
              {slotElements}

              {filledCount === 0 && (
                <div className="pet-land__empty-hint">
                  <span className="pet-land__empty-hint-text">
                    Complete a focus session<br />to discover your first pet!
                  </span>
                  <button
                    className="pet-land__empty-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'timer' }));
                    }}
                  >
                    Start Focusing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Pet detail card */}
      {selectedPet && (
        <PetDetailCard
          cell={selectedPet.cell}
          index={selectedPet.index}
          landNumber={currentLand.number}
          onClose={handleCloseDetail}
        />
      )}

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
          <span className="pet-land__milestone-text">
            {milestoneReached} pets!
          </span>
          <span className="pet-land__milestone-sub">Your island is expanding</span>
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
        <span className="pet-land__progress-label tabular-nums">
          Land {currentLand.number} · {filledCount}/{tierCapacity}
          {gridSize < 20 && ` · ${gridSize}×${gridSize}`}
        </span>
      </div>

    </div>
  );
};

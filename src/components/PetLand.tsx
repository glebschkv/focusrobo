/**
 * PetLand Component
 *
 * Home screen — flat isometric diamond island where pets are placed after
 * focus sessions. Touch-drag rotates the island on Y axis.
 * Rotation uses direct DOM updates (ref-based) to avoid React re-renders.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLandStore } from '@/stores/landStore';
import { useThemeStore } from '@/stores/themeStore';
import { useShopStore } from '@/stores/shopStore';
import { IslandPet } from '@/components/IslandPet';
import { IslandDecoration } from '@/components/IslandDecoration';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { DecorationPicker } from '@/components/DecorationPicker';
import { PetTooltip } from '@/components/PetTooltip';
import { IslandSVG } from '@/components/IslandSVG';
import { useHaptics } from '@/hooks/useHaptics';
import { getIslandScale, getAvailableCellCount, getIslandPosition, findNearestEmptyCell } from '@/data/islandPositions';
import { getIslandTheme, ISLAND_THEMES } from '@/data/IslandThemes';
import { usePremiumStore } from '@/stores/premiumStore';
import { PremiumSubscription } from '@/components/PremiumSubscription';
import { HomeGoalsWidget } from '@/components/HomeGoalsWidget';
import { WeatherParticles, getTimePeriod, getWeatherType, getSkyColors } from '@/components/WeatherParticles';
import { useIslandAmbientEnabled, useIslandAmbientVolume } from '@/stores/soundStore';
import { useXPStore } from '@/stores/xpStore';
import { useStreakStore } from '@/stores/streakStore';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { type LandCell, type DecorationCell, isPetCell, isDecorationCell } from '@/stores/landStore';
import { IslandSwitcher } from '@/components/IslandSwitcher';
import { IslandUnlockModal } from '@/components/IslandUnlockModal';

function getGrowthStage(count: number): string {
  if (count < 25) return 'pet-land--sparse';
  if (count < 50) return 'pet-land--growing';
  if (count < 75) return 'pet-land--lush';
  return 'pet-land--paradise';
}

// Parallax tilt constants (used when zoom <= 1.0)
const MAX_OFFSET = 20;
const DRAG_SENSITIVITY = 0.7;
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.8;
const MOMENTUM_DECAY = 0.94;
const MIN_VELOCITY = 0.05;

// Parallax layer speeds (increased for more noticeable effect)
const LAYER_SKY = 0.25;
const LAYER_ISLAND = 0.7;
const LAYER_PETS = 1.0;

// Vertical parallax wobble
const MAX_OFFSET_Y = 12;

// Auto-drift: slow idle sine wave when not touching
const AUTO_DRIFT_AMPLITUDE = 5; // ±5px
const AUTO_DRIFT_AMPLITUDE_Y = 3; // ±3px vertical
const AUTO_DRIFT_PERIOD = 8000; // 8 seconds full cycle
const AUTO_DRIFT_PERIOD_Y = 11000; // slightly different period for organic feel

// Zoom constants
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 4.0;
const ZOOM_DEFAULT = 1.0;
const ZOOM_WHEEL_STEP = 0.08;
const ZOOM_DOUBLE_TAP = 2.0;

// Pan constants (used when zoom > 1.0)
const PAN_MOMENTUM_DECAY = 0.95;
const PAN_SPRING_STIFFNESS = 0.12;
const PAN_SPRING_DAMPING = 0.75;
const PAN_MIN_VELOCITY = 0.3;

/** Ref-based parallax tilt + zoom + pan — zero React re-renders */
function useIslandParallax(options?: { disabledRef?: React.MutableRefObject<boolean> }) {
  const disabledRef = options?.disabledRef;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const petsRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const velocity = useRef(0);
  const velocityVert = useRef(0); // vertical parallax velocity
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const currentOffset = useRef(0);
  const currentOffsetY = useRef(0); // vertical parallax offset
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
    const offY = currentOffsetY.current;
    const z = currentZoom.current;
    const px = panX.current;
    const py = panY.current;

    if (skyRef.current) {
      skyRef.current.style.transform = `translate3d(${offset * LAYER_SKY}px, ${offY * LAYER_SKY}px, 0)`;
    }
    if (scalerRef.current) {
      // Apply zoom + pan on the scaler so it encompasses the island and pets together
      scalerRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${z})`;
    }
    if (containerRef.current) {
      containerRef.current.style.transform = `translate3d(${offset * LAYER_ISLAND}px, ${offY * LAYER_ISLAND * 0.5}px, 0)`;
    }
    if (petsRef.current) {
      petsRef.current.style.transform = `translate3d(${offset * (LAYER_PETS - LAYER_ISLAND)}px, ${offY * 0.15}px, 0)`;
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

  /** Parallax spring (zoom <= 1) — handles both X and Y axes */
  const animateParallaxSpring = useCallback(() => {
    if (isDragging.current) return;

    // Horizontal spring
    velocity.current *= MOMENTUM_DECAY;
    const springForce = -currentOffset.current * SPRING_STIFFNESS;
    velocity.current += springForce;
    velocity.current *= SPRING_DAMPING;
    currentOffset.current = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET,
      currentOffset.current + velocity.current
    ));

    // Vertical spring
    velocityVert.current *= MOMENTUM_DECAY;
    const springForceY = -currentOffsetY.current * SPRING_STIFFNESS;
    velocityVert.current += springForceY;
    velocityVert.current *= SPRING_DAMPING;
    currentOffsetY.current = Math.max(-MAX_OFFSET_Y, Math.min(MAX_OFFSET_Y,
      currentOffsetY.current + velocityVert.current
    ));

    updateCSS();

    const settled = Math.abs(currentOffset.current) < 0.2 && Math.abs(velocity.current) < MIN_VELOCITY
      && Math.abs(currentOffsetY.current) < 0.2 && Math.abs(velocityVert.current) < MIN_VELOCITY;
    if (settled) {
      currentOffset.current = 0;
      currentOffsetY.current = 0;
      velocity.current = 0;
      velocityVert.current = 0;
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
    if (disabledRef?.current) return;
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
      // Parallax tilt mode when not zoomed — X + Y axes
      velocity.current = dx * DRAG_SENSITIVITY;
      velocityVert.current = dy * DRAG_SENSITIVITY * 0.6;
      currentOffset.current = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET,
        currentOffset.current + dx * DRAG_SENSITIVITY
      ));
      currentOffsetY.current = Math.max(-MAX_OFFSET_Y, Math.min(MAX_OFFSET_Y,
        currentOffsetY.current + dy * DRAG_SENSITIVITY * 0.6
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
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.cancelable) e.preventDefault();
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
        if (e.cancelable) e.preventDefault();
      }

      if (e.touches.length === 1) {
        // Skip double-tap zoom when tapping on a pet element
        const target = e.target as HTMLElement;
        if (target.closest('.island-pet')) return;

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
          if (e.cancelable) e.preventDefault();
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
        if (e.cancelable) e.preventDefault();
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
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener('touchstart', onTouchStart);
      wrapper.removeEventListener('touchmove', onTouchMove);
      wrapper.removeEventListener('touchend', onTouchEnd);
      wrapper.removeEventListener('touchcancel', onTouchEnd);
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [updateCSS, smoothZoomTo, clampPan, handleWheel]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameId.current);
  }, []);

  // Auto-drift: subtle idle parallax when user isn't interacting
  useEffect(() => {
    let driftFrameId: number;
    const startTime = Date.now();

    function driftTick() {
      // Skip drift during active interaction or zoomed-in state
      if (isDragging.current || isPinching.current || isZoomed()) {
        driftFrameId = requestAnimationFrame(driftTick);
        return;
      }
      // Don't override active spring animation
      if (Math.abs(velocity.current) > MIN_VELOCITY) {
        driftFrameId = requestAnimationFrame(driftTick);
        return;
      }

      const elapsed = Date.now() - startTime;
      const drift = Math.sin((elapsed / AUTO_DRIFT_PERIOD) * Math.PI * 2) * AUTO_DRIFT_AMPLITUDE;
      const driftY = Math.sin((elapsed / AUTO_DRIFT_PERIOD_Y) * Math.PI * 2) * AUTO_DRIFT_AMPLITUDE_Y;
      currentOffset.current = drift;
      currentOffsetY.current = driftY;
      updateCSS();
      driftFrameId = requestAnimationFrame(driftTick);
    }

    driftFrameId = requestAnimationFrame(driftTick);
    return () => cancelAnimationFrame(driftFrameId);
  }, [updateCSS]);

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
    },
    setZoom: (z: number) => {
      targetZoom.current = clampZoom(z);
      currentZoom.current = clampZoom(z);
      updateCSS();
    },
    resetView: () => {
      cancelAnimationFrame(animFrameId.current);
      targetZoom.current = ZOOM_DEFAULT;
      currentZoom.current = ZOOM_DEFAULT;
      panX.current = 0;
      panY.current = 0;
      currentOffset.current = 0;
      currentOffsetY.current = 0;
      velocity.current = 0;
      velocityVert.current = 0;
      velocityX.current = 0;
      velocityY.current = 0;
      updateCSS();
    },
  };
}

/** Plays a soft ambient brown noise on the island when enabled */
function useIslandAmbientAudio() {
  const enabled = useIslandAmbientEnabled();
  const volume = useIslandAmbientVolume();
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      if (contextRef.current) {
        contextRef.current.close();
        contextRef.current = null;
      }
      return;
    }

    try {
      const ctx = new AudioContext();
      contextRef.current = ctx;

      // Generate brown noise buffer (2 seconds, looped)
      const sampleRate = ctx.sampleRate;
      const bufferSize = sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5; // normalize
      }

      const gain = ctx.createGain();
      gain.gain.value = (volume / 100) * 0.15; // keep it very soft
      gain.connect(ctx.destination);
      gainRef.current = gain;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      sourceRef.current = source;
    } catch {
      // Web Audio not available
    }

    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* noop */ }
        sourceRef.current = null;
      }
      if (contextRef.current) {
        try { contextRef.current.close(); } catch { /* noop */ }
        contextRef.current = null;
      }
    };
  }, [enabled]);

  // Update volume without recreating the audio
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = (volume / 100) * 0.15;
    }
  }, [volume]);
}

export const PetLand = () => {
  useIslandAmbientAudio();
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const lastPlacedIndex = useLandStore((s) => s.lastPlacedIndex);
  const landJustCompleted = useLandStore((s) => s.landJustCompleted);
  const clearLastPlaced = useLandStore((s) => s.clearLastPlaced);
  const clearLandCompleted = useLandStore((s) => s.clearLandCompleted);
  const milestoneReached = useLandStore((s) => s.milestoneReached);
  const clearMilestone = useLandStore((s) => s.clearMilestone);
  const { haptic } = useHaptics();
  const themeId = useThemeStore((s) => s.homeBackground);
  const ownedBackgrounds = useShopStore((s) => s.ownedBackgrounds);
  const isPremium = usePremiumStore((s) => s.isPremium());

  // Fall back to default theme if user has a premium theme but lost premium
  const effectiveThemeId = (!isPremium && ISLAND_THEMES[themeId]?.premiumOnly) ? 'day' : themeId;
  const theme = getIslandTheme(effectiveThemeId);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [unlockIslandIndex, setUnlockIslandIndex] = useState<number | null>(null);
  const [celebrationBurst, setCelebrationBurst] = useState(false);
  const [shareFlash, setShareFlash] = useState(false);
  const islandCaptureRef = useRef<HTMLDivElement>(null);

  // Decoration edit mode
  const [isDecorMode, setIsDecorMode] = useState(false);
  const [selectedDecorationId, setSelectedDecorationId] = useState<string | null>(null);
  const placeDecoration = useLandStore((s) => s.placeDecoration);
  const removeDecoration = useLandStore((s) => s.removeDecoration);
  const decorationInventory = useLandStore((s) => s.decorationInventory);
  const hasDecorations = Object.values(decorationInventory).some(q => q > 0);

  const handleShareIsland = useCallback(async () => {
    const captureEl = islandCaptureRef.current;
    if (!captureEl || filledCount === 0) return;

    haptic('light');
    setShareFlash(true);
    setTimeout(() => setShareFlash(false), 400);

    try {
      const level = useXPStore.getState().currentLevel;
      const streak = useStreakStore.getState().currentStreak;
      const petCountForShare = filledCount;

      const dataUrl = await toPng(captureEl, {
        pixelRatio: 2,
        backgroundColor: undefined,
        width: captureEl.offsetWidth,
        height: captureEl.offsetHeight,
      });

      // Create a canvas to add stats overlay
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const size = Math.max(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Center the island capture in a square
      const offsetX = (size - img.width) / 2;
      const offsetY = (size - img.height) / 2;
      ctx.drawImage(img, offsetX, offsetY);

      // Stats banner at bottom
      const bannerHeight = 60;
      const bannerY = size - bannerHeight;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, bannerY, size, bannerHeight);

      ctx.font = 'bold 24px -apple-system, "SF Pro Display", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const statsText = `Lv.${level} · ${petCountForShare} Pets · ${streak}-day Streak`;
      ctx.fillText(statsText, size / 2, bannerY + bannerHeight / 2 - 2);

      // Small watermark
      ctx.font = '12px -apple-system, "SF Pro Display", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'right';
      ctx.fillText('PhoNo', size - 12, bannerY + bannerHeight - 10);

      const shareDataUrl = canvas.toDataURL('image/png');

      if (navigator.share) {
        const blob = await (await fetch(shareDataUrl)).blob();
        const file = new File([blob], 'my-island.png', { type: 'image/png' });
        await navigator.share({
          title: 'My PhoNo Island',
          text: `Lv.${level} · ${petCountForShare} Pets · ${streak}-day Streak`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.download = 'my-island.png';
        link.href = shareDataUrl;
        link.click();
        toast.success('Island saved!', { description: 'Image downloaded' });
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') {
        toast.error("Couldn't capture island");
      }
    }
  }, [filledCount, haptic]);

  // Listen for help open event from TopStatusBar
  useEffect(() => {
    const handleOpenHelp = () => setShowHowItWorks(true);
    window.addEventListener('openHelp', handleOpenHelp);
    return () => window.removeEventListener('openHelp', handleOpenHelp);
  }, []);

  const gridSize = currentLand.gridSize || 5;
  const tierCapacity = getAvailableCellCount(gridSize);
  const tierScale = getIslandScale(gridSize);
  const progressPct = (filledCount / tierCapacity) * 100;

  const parallaxDisabledRef = useRef(false);
  useEffect(() => {
    parallaxDisabledRef.current = isDecorMode && !!selectedDecorationId;
  }, [isDecorMode, selectedDecorationId]);
  const { wrapperRef, skyRef, containerRef, petsRef, scalerRef, handlers: parallaxHandlers, setZoom, resetView } = useIslandParallax({ disabledRef: parallaxDisabledRef });

  // Auto-zoom for larger islands so pets remain visible
  useEffect(() => {
    if (gridSize >= 17) setZoom(1.3);
    else if (gridSize >= 14) setZoom(1.15);
  }, [gridSize, setZoom]);

  // Pet detail card state (replaces old tooltip)
  const [selectedPet, setSelectedPet] = useState<{ cell: LandCell; index: number; rect?: DOMRect } | null>(null);

  // Clear new pet glow after 8 seconds
  useEffect(() => {
    if (lastPlacedIndex !== null) {
      const timer = setTimeout(clearLastPlaced, 8000);
      return () => clearTimeout(timer);
    }
  }, [lastPlacedIndex, clearLastPlaced]);

  // Listen for "goToPet" event — zoom/pan to a newly placed pet
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ cellIndex: number }>).detail;
      if (detail?.cellIndex >= 0) {
        const pos = getIslandPosition(detail.cellIndex, gridSize);
        if (pos) {
          // Zoom in slightly and reset view to center on the pet
          setZoom(ZOOM_DOUBLE_TAP);
          resetView();
        }
      }
    };
    window.addEventListener('goToPet', handler);
    return () => window.removeEventListener('goToPet', handler);
  }, [gridSize, setZoom, resetView]);

  // Auto-dismiss land completion + burst particles
  useEffect(() => {
    if (landJustCompleted !== null) {
      haptic('heavy');
      setCelebrationBurst(true);
      const burstTimer = setTimeout(() => setCelebrationBurst(false), 2000);
      const timer = setTimeout(clearLandCompleted, 3500);
      return () => { clearTimeout(timer); clearTimeout(burstTimer); };
    }
  }, [landJustCompleted, clearLandCompleted, haptic]);

  // Auto-dismiss milestone + burst particles
  useEffect(() => {
    if (milestoneReached !== null) {
      haptic('success');
      setCelebrationBurst(true);
      const burstTimer = setTimeout(() => setCelebrationBurst(false), 2000);
      const timer = setTimeout(clearMilestone, 2500);
      return () => { clearTimeout(timer); clearTimeout(burstTimer); };
    }
  }, [milestoneReached, clearMilestone, haptic]);

  const handlePetTap = useCallback((index: number, rect?: DOMRect) => {
    const cell = currentLand.cells[index];
    if (cell && isPetCell(cell)) {
      setSelectedPet({ cell, index, rect });
    }
  }, [currentLand.cells]);

  // Handle decoration tap in edit mode (pick up)
  const handleDecorationTap = useCallback((index: number) => {
    if (isDecorMode) {
      removeDecoration(index);
      haptic('light');
    }
  }, [isDecorMode, removeDecoration, haptic]);

  const handleCloseDetail = useCallback(() => {
    setSelectedPet(null);
  }, []);

  // Determine how many pets for performance class
  const petCount = filledCount;

  // Build pet + decoration elements
  const slotElements = useMemo(() => {
    return currentLand.cells.map((cell, index) => {
      if (cell && isPetCell(cell)) {
        return (
          <IslandPet
            key={`${currentLand.id}-pet-${index}`}
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
      if (cell && isDecorationCell(cell)) {
        return (
          <IslandDecoration
            key={`${currentLand.id}-deco-${index}`}
            cell={cell}
            index={index}
            gridSize={gridSize}
            isEditMode={isDecorMode}
            onTap={isDecorMode ? handleDecorationTap : undefined}
          />
        );
      }
      return null;
    });
  }, [currentLand.cells, currentLand.id, gridSize, lastPlacedIndex, handlePetTap, petCount, isDecorMode, handleDecorationTap]);

  // Tap-to-place: user taps island to place selected decoration on nearest empty cell
  const petsLayerRef = useRef<HTMLDivElement>(null);

  const handleDecorClick = useCallback((e: React.MouseEvent) => {
    if (!isDecorMode || !selectedDecorationId) return;
    const layer = petsLayerRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const nearest = findNearestEmptyCell(xPct, yPct, currentLand.cells, gridSize);
    if (nearest === null) return;
    const success = placeDecoration(selectedDecorationId, nearest);
    if (success) {
      haptic('light');
      const remaining = (decorationInventory[selectedDecorationId] || 1) - 1;
      if (remaining <= 0) {
        setSelectedDecorationId(null);
      }
    }
  }, [isDecorMode, selectedDecorationId, currentLand.cells, gridSize, placeDecoration, haptic, decorationInventory]);

  const growthClass = getGrowthStage(filledCount);

  const particles = useMemo(() => {
    const colors = theme.particleColors;
    return Array.from({ length: 7 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${15 + Math.random() * 55}%`,
      duration: `${7 + Math.random() * 5}s`,
      delay: `${Math.random() * 6}s`,
      background: colors[i % colors.length],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveThemeId]);

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

  // Island mood based on last session recency
  const getIslandMood = useLandStore((s) => s.getIslandMood);
  const mood = getIslandMood();
  const moodClass = mood !== 'happy' ? `pet-land--mood-${mood}` : '';

  // Zzz particles for sleepy/lonely mood
  const zzzCount = mood === 'lonely' ? 5 : mood === 'sleepy' ? 3 : 0;
  const zzzParticles = useMemo(() => {
    return Array.from({ length: zzzCount }, (_, i) => ({
      id: i,
      left: `${30 + Math.random() * 40}%`,
      top: `${20 + Math.random() * 30}%`,
      delay: `${i * 0.8}s`,
    }));
  }, [zzzCount]);

  // Time-of-day + weather system
  const [timePeriod, setTimePeriod] = useState(getTimePeriod);
  const [weather, setWeather] = useState(() => getWeatherType(getTimePeriod()));

  // Refresh time period every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const tp = getTimePeriod();
      setTimePeriod(tp);
      setWeather(getWeatherType(tp));
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Override sky colors for time of day
  const timeSkyCols = getSkyColors(timePeriod);

  const timeOfDayClass = useMemo(() => {
    if (timePeriod === 'dawn') return 'pet-land--dawn-atmo';
    if (timePeriod === 'night') return 'pet-land--night';
    if (timePeriod === 'dusk') return 'pet-land--dusk';
    return '';
  }, [timePeriod]);

  const skyColors = timeSkyCols || theme.sky;
  const skyGradient = `linear-gradient(180deg, ${skyColors[0]} 0%, ${skyColors[1]} 35%, ${skyColors[2]} 65%, ${skyColors[3]} 100%)`;

  return (
    <div className={`pet-land ${growthClass} ${perfClass} ${timeOfDayClass} ${moodClass}`} style={{ background: skyGradient }}>
      {/* Sky — parallax layer (slowest), theme-responsive cloud/sun colors */}
      {/* Sky — parallax layer (slowest), all decorative */}
      <div
        className="pet-land__sky"
        ref={skyRef}
        aria-hidden="true"
        style={{
          '--cloud-color': theme.cloudColor,
          '--sun-color': theme.sunColor,
        } as React.CSSProperties}
      >
        <div className="pet-land__sun" />

        <div className="pet-land__rays">
          <div className="pet-land__ray pet-land__ray--1" />
          <div className="pet-land__ray pet-land__ray--2" />
          <div className="pet-land__ray pet-land__ray--3" />
          <div className="pet-land__ray pet-land__ray--4" />
          <div className="pet-land__ray pet-land__ray--5" />
        </div>

        {/* Clouds — 8 volumetric clouds in 3 depth layers */}
        {/* Back layer — distant, blurred, slow */}
        <div className="pet-land__cloud pet-land__cloud--3">
          <div className="pet-land__cloud-lobe" />
        </div>
        <div className="pet-land__cloud pet-land__cloud--4">
          <div className="pet-land__cloud-lobe" />
        </div>
        <div className="pet-land__cloud pet-land__cloud--7">
          <div className="pet-land__cloud-lobe" />
          <div className="pet-land__cloud-lobe" />
        </div>
        {/* Mid layer — standard depth */}
        <div className="pet-land__cloud pet-land__cloud--1">
          <div className="pet-land__cloud-lobe" />
          <div className="pet-land__cloud-lobe" />
          <div className="pet-land__cloud-lobe" />
        </div>
        <div className="pet-land__cloud pet-land__cloud--5">
          <div className="pet-land__cloud-lobe" />
          <div className="pet-land__cloud-lobe" />
        </div>
        <div className="pet-land__cloud pet-land__cloud--8">
          <div className="pet-land__cloud-lobe" />
        </div>
        {/* Front layer — close, sharp, faster */}
        <div className="pet-land__cloud pet-land__cloud--2">
          <div className="pet-land__cloud-lobe" />
          <div className="pet-land__cloud-lobe" />
          <div className="pet-land__cloud-lobe" />
        </div>
        <div className="pet-land__cloud pet-land__cloud--6">
          <div className="pet-land__cloud-lobe" />
        </div>

        <div className="pet-land__mountains-far" />
        <div className="pet-land__mountains-near" />
        <div className="pet-land__treeline" />

        <div className="pet-land__haze" />

        {/* Weather particles (rain/petals/fireflies/stars) */}
        <WeatherParticles timePeriod={timePeriod} weather={weather} />
      </div>

      {/* Share flash overlay */}
      {shareFlash && (
        <div
          className="pet-land__share-flash"
          aria-hidden="true"
        />
      )}

      {/* Zzz particles for sleepy/lonely mood */}
      {zzzParticles.map(z => (
        <div
          key={`zzz-${z.id}`}
          className="pet-land__zzz"
          style={{
            left: z.left,
            top: z.top,
            animationDelay: z.delay,
          }}
          aria-hidden="true"
        >
          💤
        </div>
      ))}

      {/* Floating island — parallax drag handler */}
      <div
        ref={wrapperRef}
        className="pet-land__island-wrapper"
        {...parallaxHandlers}
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

        {/* Celebration burst particles */}
        {celebrationBurst && (
          <div className="pet-land__burst" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const dist = 60 + Math.random() * 40;
              return (
                <div
                  key={i}
                  className="pet-land__burst-particle"
                  style={{
                    '--burst-tx': `${Math.round(Math.cos(angle) * dist)}px`,
                    '--burst-ty': `${Math.round(Math.sin(angle) * dist)}px`,
                    '--burst-color': ['#FFD700', '#FF6B6B', '#4ADE80', '#60A5FA', '#F472B6', '#FBBF24'][i % 6],
                    '--burst-delay': `${Math.random() * 0.15}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}

        {/* Zoom + pan layer (controlled by ref) */}
        <div
          className="pet-land__zoom-layer"
          ref={scalerRef}
        >
          {/* Island scaler — tier growth animation */}
          <div
            ref={islandCaptureRef}
            className="pet-land__island-scaler"
            style={{ transform: `scale(${tierScale})` }}
          >
            {/* Island container — parallax layer (medium) */}
            <div className="pet-land__island-container" ref={containerRef}>
            <IslandSVG gridSize={gridSize} themeId={effectiveThemeId} />
            <div className="pet-land__island-shadow" />

            {/* Pets layer — parallax layer (fastest) */}
            <div
              className={`pet-land__pets-layer ${isDecorMode && selectedDecorationId ? 'pet-land--decor-active' : ''}`}
              ref={(el) => {
                // Merge refs: petsRef (parallax) and petsLayerRef (decoration placement)
                if (petsRef) (petsRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                petsLayerRef.current = el;
              }}
              role="group"
              aria-label="Your pet island"
              onClick={handleDecorClick}
            >
              {slotElements}

              {filledCount === 0 && (
                <div className="pet-land__empty-hint">
                  {/* Pixel art egg sitting on the island */}
                  <div className="pet-land__empty-egg">
                    <div className="pet-land__empty-egg-wobble">
                      <PixelIcon name="egg" size={52} />
                    </div>
                    {/* Golden sparkle particles */}
                    <span className="pet-land__empty-sparkle" />
                    <span className="pet-land__empty-sparkle" />
                    <span className="pet-land__empty-sparkle" />
                    <span className="pet-land__empty-sparkle" />
                  </div>
                  <span className="pet-land__empty-title">
                    Your island awaits!
                  </span>
                  <span className="pet-land__empty-hint-text">
                    Complete a focus session to<br />discover your first pet
                  </span>
                  <button
                    className="pet-land__empty-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'timer' }));
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Start Focusing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Home Goals Widget (replaces old nudge chip) */}
      {filledCount > 0 && <HomeGoalsWidget />}

      {/* Island progress ring */}
      {filledCount > 0 && (
        <div className="pet-land__progress-ring" aria-label={`Island ${Math.round(progressPct)}% full`}>
          <svg viewBox="0 0 36 36" width="36" height="36">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="hsl(142 60% 50%)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progressPct * 0.974} ${97.4 - progressPct * 0.974}`}
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <span className="pet-land__progress-ring-text">{Math.round(progressPct)}%</span>
        </div>
      )}

      {/* Compact pet tooltip */}
      {selectedPet && (
        <PetTooltip
          cell={selectedPet.cell}
          index={selectedPet.index}
          gridSize={gridSize}
          petRect={selectedPet.rect}
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

      {/* Share island button */}
      {filledCount > 0 && (
        <button
          className="pet-land__share-btn"
          onClick={handleShareIsland}
          aria-label="Share island screenshot"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
      )}

      {/* Decoration edit mode button — show only when player has decorations in inventory */}
      {hasDecorations && (
        <button
          className={`pet-land__decor-btn ${isDecorMode ? 'pet-land__decor-btn--active' : ''}`}
          onClick={() => {
            const entering = !isDecorMode;
            setIsDecorMode(entering);
            if (!entering) setSelectedDecorationId(null);
            if (entering) resetView();
            haptic('light');
          }}
          aria-label={isDecorMode ? 'Exit decoration mode' : 'Decorate island'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </button>
      )}

      {/* Decoration picker bottom sheet */}
      {isDecorMode && (
        <DecorationPicker
          selectedDecorationId={selectedDecorationId}
          onSelect={setSelectedDecorationId}
          onDone={() => {
            setIsDecorMode(false);
            setSelectedDecorationId(null);
          }}
        />
      )}


      {showHowItWorks && (
        <div className="pet-land__help-overlay pet-land__help-overlay--center" onClick={() => setShowHowItWorks(false)}>
          <div className="pet-land__help-popup" onClick={(e) => e.stopPropagation()}>
            <button className="pet-land__help-close" onClick={() => setShowHowItWorks(false)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <h2 className="pet-land__help-popup-title">How to Play</h2>

            <div className="pet-land__help-steps">
              <div className="pet-land__help-step">
                <span className="pet-land__help-step-num">1</span>
                <div>
                  <strong>Focus to earn pets</strong>
                  <p>Complete a 25+ minute focus session and a random pet is placed on your island.</p>
                </div>
              </div>

              <div className="pet-land__help-step">
                <span className="pet-land__help-step-num">2</span>
                <div>
                  <strong>Longer sessions, bigger pets</strong>
                  <div className="pet-land__help-sizes">
                    <span>Baby <em>25–45 min</em></span>
                    <span>Teen <em>60–90 min</em></span>
                    <span>Adult <em>120+ min</em></span>
                  </div>
                </div>
              </div>

              <div className="pet-land__help-step">
                <span className="pet-land__help-step-num">3</span>
                <div>
                  <strong>Collect 41 species across 5 rarities</strong>
                  <div className="pet-land__help-rarities">
                    <span className="pet-land__help-rarity pet-land__help-rarity--common">Common</span>
                    <span className="pet-land__help-rarity pet-land__help-rarity--uncommon">Uncommon</span>
                    <span className="pet-land__help-rarity pet-land__help-rarity--rare">Rare</span>
                    <span className="pet-land__help-rarity pet-land__help-rarity--epic">Epic</span>
                    <span className="pet-land__help-rarity pet-land__help-rarity--legendary">Legendary</span>
                  </div>
                  <p>Level up to unlock rarer species. Buy eggs in the shop for better odds.</p>
                </div>
              </div>

              <div className="pet-land__help-step">
                <span className="pet-land__help-step-num">4</span>
                <div>
                  <strong>Grow your island</strong>
                  <p>Fill every tile and your island expands (5×5 up to 20×20). Complete it to archive and start fresh.</p>
                </div>
              </div>

              <div className="pet-land__help-step">
                <span className="pet-land__help-step-num">5</span>
                <div>
                  <strong>Build streaks for bonuses</strong>
                  <p>Focus daily to maintain your streak — earn up to +60% bonus XP plus extra coins.</p>
                </div>
              </div>

              <div className="pet-land__help-step">
                <span className="pet-land__help-step-num">6</span>
                <div>
                  <strong>Earn passive income</strong>
                  <p>Your pets generate coins daily based on their rarity and size. Tap the golden button in the top bar to collect!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar moved to TopStatusBar */}

      {/* Premium subscription dialog (triggered by locked theme tap) */}
      {showPremiumDialog && (
        <PremiumSubscription isOpen={showPremiumDialog} onClose={() => setShowPremiumDialog(false)} />
      )}

      {/* Archipelago island switcher */}
      <IslandSwitcher onLockedTap={(index) => setUnlockIslandIndex(index)} />

      {/* Island unlock modal */}
      {unlockIslandIndex !== null && (
        <IslandUnlockModal
          islandIndex={unlockIslandIndex}
          onClose={() => setUnlockIslandIndex(null)}
        />
      )}
    </div>
  );
};

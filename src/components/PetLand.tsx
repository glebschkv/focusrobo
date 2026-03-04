/**
 * PetLand Component
 *
 * The home screen — displays a floating isometric island where pets are placed
 * after focus sessions. Pets are positioned organically across the island surface
 * with depth-based scaling and z-ordering.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLandStore, LAND_SIZE } from '@/stores/landStore';
import { IslandPet } from '@/components/IslandPet';
import { ISLAND_POSITIONS, getDepthZIndex } from '@/data/islandPositions';

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

export const PetLand = () => {
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const debugAwardPet = useDebugAwardPet();
  const lastPlacedIndex = useLandStore((s) => s.lastPlacedIndex);
  const landJustCompleted = useLandStore((s) => s.landJustCompleted);
  const clearLastPlaced = useLandStore((s) => s.clearLastPlaced);
  const clearLandCompleted = useLandStore((s) => s.clearLandCompleted);
  const progressPct = (filledCount / LAND_SIZE) * 100;

  // Single active tooltip — only one pet tooltip open at a time
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  // Clear the "new pet" animation after it plays
  useEffect(() => {
    if (lastPlacedIndex !== null) {
      const timer = setTimeout(clearLastPlaced, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastPlacedIndex, clearLastPlaced]);

  // Auto-dismiss land completion overlay
  useEffect(() => {
    if (landJustCompleted !== null) {
      const timer = setTimeout(clearLandCompleted, 3500);
      return () => clearTimeout(timer);
    }
  }, [landJustCompleted, clearLandCompleted]);

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

  return (
    <div className="pet-land">
      {/* Sky with sun and clouds */}
      <div className="pet-land__sky">
        <div className="pet-land__sun" />
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
      </div>

      {/* Floating island — wrapper handles the bob animation */}
      <div className="pet-land__island-wrapper">
        {/* 3D tilted island container */}
        <div className="pet-land__island-container">
          {/* Island surface (grass top) */}
          <div className="pet-land__island-surface">
            <div className="pet-land__island-grass-detail" />
          </div>

          {/* Island cliff sides */}
          <div className="pet-land__island-cliff" />

          {/* Waterfall cascading from cliff */}
          <div className="pet-land__waterfall" />

          {/* Soft shadow beneath floating island */}
          <div className="pet-land__island-shadow" />

          {/* Decorative elements */}
          <div className="pet-land__deco pet-land__deco--tree-1" />
          <div className="pet-land__deco pet-land__deco--tree-2" />
          <div className="pet-land__deco pet-land__deco--flower-1" />
          <div className="pet-land__deco pet-land__deco--flower-2" />
          <div className="pet-land__deco pet-land__deco--flower-3" />
          <div className="pet-land__deco pet-land__deco--bush-1" />
          <div className="pet-land__deco pet-land__deco--bush-2" />
          <div className="pet-land__deco pet-land__deco--bush-3" />
          <div className="pet-land__deco pet-land__deco--rock-1" />
          <div className="pet-land__deco pet-land__deco--rock-2" />
          <div className="pet-land__deco pet-land__deco--path" />

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

      {/* Land progress label */}
      <div className="pet-land__progress">
        <span className="pet-land__progress-text">
          Land {currentLand.number} · {filledCount}/{LAND_SIZE}
          <span className="pet-land__progress-bar">
            <span
              className="pet-land__progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </span>
        </span>
      </div>

      {/* DEBUG: Award pet button — remove before production */}
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
    </div>
  );
};

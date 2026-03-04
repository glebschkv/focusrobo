/**
 * PetLand Component
 *
 * The home screen — displays a floating isometric island where pets are placed
 * after focus sessions. Pets are positioned organically across the island surface
 * with depth-based scaling and z-ordering.
 */

import { useMemo } from 'react';
import { useLandStore, LAND_SIZE } from '@/stores/landStore';
import { IslandPet } from '@/components/IslandPet';
import { ISLAND_POSITIONS, getDepthZIndex } from '@/data/islandPositions';

export const PetLand = () => {
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const progressPct = (filledCount / LAND_SIZE) * 100;

  const slotElements = useMemo(() => {
    return currentLand.cells.map((cell, index) => {
      if (cell) {
        return (
          <IslandPet
            key={`${currentLand.id}-${index}`}
            cell={cell}
            index={index}
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
  }, [currentLand.cells, currentLand.id]);

  return (
    <div className="pet-land">
      {/* Sky with sun and clouds */}
      <div className="pet-land__sky">
        <div className="pet-land__sun" />
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
      </div>

      {/* Floating island */}
      <div className="pet-land__island-container">
        {/* Island surface (grass top) */}
        <div className="pet-land__island-surface">
          <div className="pet-land__island-grass-detail" />
        </div>

        {/* Island cliff sides */}
        <div className="pet-land__island-cliff" />

        {/* Soft shadow beneath floating island */}
        <div className="pet-land__island-shadow" />

        {/* Decorative elements on island edges */}
        <div className="pet-land__deco pet-land__deco--flower-1" />
        <div className="pet-land__deco pet-land__deco--flower-2" />
        <div className="pet-land__deco pet-land__deco--bush-1" />
        <div className="pet-land__deco pet-land__deco--bush-2" />

        {/* Pets layer — absolutely positioned pets */}
        <div className="pet-land__pets-layer">
          {slotElements}
        </div>
      </div>

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
    </div>
  );
};

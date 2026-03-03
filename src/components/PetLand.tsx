/**
 * PetLand Component
 *
 * The home screen — displays a 10×10 grid of pets placed after focus sessions.
 * Pets are sized based on session duration (baby/adolescent/adult).
 * The grid sits on a pixel art meadow background.
 */

import { useMemo } from 'react';
import { useLandStore } from '@/stores/landStore';
import { PetLandCell } from '@/components/PetLandCell';
import { LAND_COLS, LAND_ROWS } from '@/stores/landStore';

export const PetLand = () => {
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();

  // Memoize grid rendering to avoid re-renders on unrelated state changes
  const gridCells = useMemo(() => {
    return currentLand.cells.map((cell, index) => (
      <PetLandCell
        key={`${currentLand.id}-${index}`}
        cell={cell}
        index={index}
      />
    ));
  }, [currentLand.cells, currentLand.id]);

  return (
    <div className="pet-land">
      {/* Sky */}
      <div className="pet-land__sky">
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
      </div>

      {/* Grid */}
      <div
        className="pet-land__grid"
        style={{
          gridTemplateColumns: `repeat(${LAND_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${LAND_ROWS}, 1fr)`,
        }}
      >
        {gridCells}
      </div>

      {/* Ground */}
      <div className="pet-land__ground" />

      {/* Land progress label */}
      <div className="pet-land__progress">
        <span className="pet-land__progress-text">
          Land {currentLand.number} &middot; {filledCount}/{LAND_COLS * LAND_ROWS}
        </span>
      </div>
    </div>
  );
};

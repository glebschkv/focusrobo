/**
 * PetLand Component
 *
 * The home screen — displays a 10×10 grid of pets placed after focus sessions.
 * Pets are sized based on session duration (baby/adolescent/adult).
 * The grid sits on a floating island with sky, clouds, and decorative elements.
 */

import { useMemo } from 'react';
import { useLandStore } from '@/stores/landStore';
import { PetLandCell } from '@/components/PetLandCell';
import { LAND_COLS, LAND_ROWS, LAND_SIZE } from '@/stores/landStore';

export const PetLand = () => {
  const currentLand = useLandStore((s) => s.currentLand);
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const progressPct = (filledCount / LAND_SIZE) * 100;

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
      {/* Sky with sun and clouds */}
      <div className="pet-land__sky">
        <div className="pet-land__sun" />
        <div className="pet-land__cloud pet-land__cloud--1" />
        <div className="pet-land__cloud pet-land__cloud--2" />
        <div className="pet-land__cloud pet-land__cloud--3" />
      </div>

      {/* Floating island with grid */}
      <div className="pet-land__island">
        <div className="pet-land__island-bg" />

        {/* Decorative trees */}
        <div className="pet-land__deco-tree pet-land__deco-tree--1" />
        <div className="pet-land__deco-tree pet-land__deco-tree--2" />
        <div className="pet-land__deco-tree pet-land__deco-tree--3" />

        {/* 10×10 Grid */}
        <div
          className="pet-land__grid"
          style={{
            gridTemplateColumns: `repeat(${LAND_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${LAND_ROWS}, 1fr)`,
          }}
        >
          {gridCells}
        </div>
      </div>

      {/* Ground strip */}
      <div className="pet-land__ground" />

      {/* Land progress label with mini bar */}
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

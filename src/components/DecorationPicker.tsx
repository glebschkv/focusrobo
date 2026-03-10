/**
 * DecorationPicker Component
 *
 * Bottom sheet that shows the player's decoration inventory during edit mode.
 * Player selects a decoration, then taps an empty tile to place it.
 */

import { useMemo } from 'react';
import { useLandStore } from '@/stores/landStore';
import { getDecorationById, type DecorationDef } from '@/data/DecorationData';

interface DecorationPickerProps {
  selectedDecorationId: string | null;
  onSelect: (decorationId: string | null) => void;
  onDone: () => void;
}

export const DecorationPicker = ({ selectedDecorationId, onSelect, onDone }: DecorationPickerProps) => {
  const decorationInventory = useLandStore((s) => s.decorationInventory);

  const items = useMemo(() => {
    const result: { def: DecorationDef; qty: number }[] = [];
    for (const [id, qty] of Object.entries(decorationInventory)) {
      if (qty <= 0) continue;
      const def = getDecorationById(id);
      if (def) result.push({ def, qty });
    }
    return result;
  }, [decorationInventory]);

  const isEmpty = items.length === 0;

  return (
    <div className="decoration-picker" onClick={(e) => e.stopPropagation()}>
      <div className="decoration-picker__header">
        <span className="decoration-picker__title">Place Decorations</span>
        <button className="decoration-picker__done-btn" onClick={onDone}>
          Done
        </button>
      </div>

      {isEmpty ? (
        <div className="decoration-picker__empty">
          <span>No decorations yet!</span>
          <span className="decoration-picker__empty-hint">Buy some in the Shop → Decor tab</span>
        </div>
      ) : (
        <div className="decoration-picker__grid">
          {items.map(({ def, qty }) => {
            const isSelected = selectedDecorationId === def.id;
            return (
              <button
                key={def.id}
                className={`decoration-picker__item ${isSelected ? 'decoration-picker__item--selected' : ''}`}
                onClick={() => onSelect(isSelected ? null : def.id)}
              >
                <img
                  src={def.sprite}
                  alt={def.name}
                  className="decoration-picker__sprite"
                  draggable={false}
                />
                <span className="decoration-picker__name">{def.name}</span>
                <span className="decoration-picker__qty">×{qty}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

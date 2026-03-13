/**
 * DEV ONLY — Test panel for unlocking everything locally.
 * Bypasses server validation by calling store methods directly.
 * Remove before shipping to production.
 */
import { useState } from 'react';
import { useLandStore } from '@/stores/landStore';
import { useCoinStore } from '@/stores/coinStore';
import { useXPStore } from '@/stores/xpStore';
import { EGG_TYPES } from '@/data/EggData';

const btnBase: React.CSSProperties = {
  fontSize: 11,
  padding: '4px 8px',
  borderRadius: 6,
  fontWeight: 600,
  lineHeight: 1.3,
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
};

export function DevTestPanel() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 1500);
  };

  const handleUnlockAll = () => {
    // Max level first (needed to unlock species in drop pool)
    useXPStore.getState().setLevel(50);
    // Give coins
    useCoinStore.getState().setBalance(999999);
    // Unlock all archipelago islands
    for (let i = 0; i < 6; i++) {
      useLandStore.getState().unlockIsland(i);
    }
    flash('Unlocked everything!');
  };

  const handleCoins = () => {
    useCoinStore.getState().setBalance(
      useCoinStore.getState().balance + 100000
    );
    flash('+100k coins');
  };

  const handleHatchEgg = (eggId: string) => {
    const egg = EGG_TYPES.find(e => e.id === eggId);
    if (!egg) return;
    const level = useXPStore.getState().currentLevel;
    useLandStore.getState().hatchEgg(egg, level);
    useLandStore.getState().placePendingPet();
    flash(`Hatched ${egg.name}!`);
  };

  const handleSwitchIsland = (index: number) => {
    useLandStore.getState().switchIsland(index);
    flash(`Switched to island ${index}`);
  };

  return (
    <div style={{ position: 'relative', marginLeft: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 6,
          background: open ? 'rgba(239,68,68,0.35)' : 'rgba(234,179,8,0.25)',
          border: `1px solid ${open ? 'rgba(239,68,68,0.6)' : 'rgba(234,179,8,0.5)'}`,
          color: open ? '#f87171' : '#eab308',
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        DEV
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            background: 'rgba(15,15,20,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: 10,
            zIndex: 9999,
            width: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {msg && (
            <div style={{ fontSize: 11, color: '#4ade80', textAlign: 'center', fontWeight: 600 }}>
              {msg}
            </div>
          )}

          <button
            onClick={handleUnlockAll}
            style={{ ...btnBase, background: 'rgba(168,85,247,0.3)', color: '#c084fc' }}
          >
            Unlock Everything (lvl 50 + 999k coins + all islands)
          </button>

          <button
            onClick={handleCoins}
            style={{ ...btnBase, background: 'rgba(234,179,8,0.2)', color: '#eab308' }}
          >
            +100k Coins
          </button>

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            HATCH EGGS
          </div>
          {EGG_TYPES.map(egg => (
            <button
              key={egg.id}
              onClick={() => handleHatchEgg(egg.id)}
              style={{ ...btnBase, background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}
            >
              {egg.name}
            </button>
          ))}

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            SWITCH ISLAND
          </div>
          {['Home', 'Coral Reef', 'Snow Peak', 'Desert', 'Moonlit', 'Sakura'].map((name, i) => (
            <button
              key={i}
              onClick={() => handleSwitchIsland(i)}
              style={{ ...btnBase, background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

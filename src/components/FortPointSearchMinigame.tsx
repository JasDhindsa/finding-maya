import React, { useState } from 'react';
import { Compass, MapPin, Waves, X } from 'lucide-react';

interface FortPointSearchMinigameProps {
  onClose: () => void;
  onSuccess: () => void;
}

const WALLS = [
  { id: 'north', label: 'North wall', note: 'Faces the bridge traffic.' },
  { id: 'east', label: 'East wall', note: 'Too exposed to the walkway.' },
  { id: 'west', label: 'West wall', note: 'Closest to the water and easiest to miss at night.' },
];

export const FortPointSearchMinigame = ({ onClose, onSuccess }: FortPointSearchMinigameProps) => {
  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [selectedStone, setSelectedStone] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const solved = selectedWall === 'west' && selectedStone === '2-3';

  return (
    <div className="absolute inset-0 z-[80] bg-[#0c0f12]/95 text-[#e8d8c8] backdrop-blur-md">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#3a3532] px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#c8a86b]">Fort Point Cache Search</div>
            <h2 className="mt-1 text-xl font-bold">Work Maya's hiding clue</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-[#3a3532] p-2 text-[#a49484]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-3xl border border-[#3a3532] bg-[#151312] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#c8a86b]/15 p-3 text-[#c8a86b]">
                <Compass size={22} />
              </div>
              <div>
                <div className="text-sm font-bold">Clue</div>
                <div className="text-xs text-[#a49484]">Third stone from the left. Base of the western wall. Near the water.</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {WALLS.map((wall) => (
                <button
                  key={wall.id}
                  onClick={() => {
                    setSelectedWall(wall.id);
                    setSelectedStone(null);
                    setAttempted(false);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                    selectedWall === wall.id
                      ? 'border-[#c8a86b] bg-[#c8a86b]/10'
                      : 'border-[#3a3532] bg-[#1a1818]'
                  }`}
                >
                  <div className="font-bold">{wall.label}</div>
                  <div className="mt-1 text-xs text-[#a49484]">{wall.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#3a3532] bg-[#151312] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-bold">Western wall stones</div>
              <div className="flex items-center gap-2 text-xs text-[#7aa0c8]">
                <Waves size={14} />
                Waterline
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((row) => (
                <div key={row} className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((column) => {
                    const stoneId = `${row}-${column}`;
                    const isSelected = selectedStone === stoneId;
                    return (
                      <button
                        key={stoneId}
                        onClick={() => {
                          setSelectedStone(stoneId);
                          setAttempted(false);
                        }}
                        className={`aspect-square rounded-xl border text-xs font-bold transition-colors ${
                          isSelected ? 'border-[#5b8c6b] bg-[#5b8c6b]/20 text-[#a9d4b4]' : 'border-[#3a3532] bg-[#1a1818] text-[#a49484]'
                        }`}
                      >
                        {column}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-[#a49484]">
              Bottom row is closest to the water. Count from the left.
            </div>

            <button
              onClick={() => {
                setAttempted(true);
                if (solved) onSuccess();
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5b8c6b] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white"
            >
              <MapPin size={16} />
              Search this spot
            </button>

            {attempted && !solved && (
              <p className="mt-3 text-center text-xs text-[#9c5b5b]">
                Wrong section. Re-check the wall direction and the stone count.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

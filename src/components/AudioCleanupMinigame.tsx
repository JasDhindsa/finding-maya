import React, { useMemo, useState } from 'react';
import { AudioLines, SlidersHorizontal, X } from 'lucide-react';

interface AudioCleanupMinigameProps {
  callerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TARGET = {
  wind: 72,
  traffic: 54,
  voice: 81,
};

const TOLERANCE = 6;

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export const AudioCleanupMinigame = ({ callerName, onClose, onSuccess }: AudioCleanupMinigameProps) => {
  const [controls, setControls] = useState({ wind: 18, traffic: 32, voice: 44 });
  const [confirmed, setConfirmed] = useState(false);

  const clarity = useMemo(() => {
    const deltas = [
      Math.abs(controls.wind - TARGET.wind),
      Math.abs(controls.traffic - TARGET.traffic),
      Math.abs(controls.voice - TARGET.voice),
    ];
    const averageDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
    return clamp(Math.round(100 - averageDelta * 2.2));
  }, [controls]);

  const solved =
    Math.abs(controls.wind - TARGET.wind) <= TOLERANCE &&
    Math.abs(controls.traffic - TARGET.traffic) <= TOLERANCE &&
    Math.abs(controls.voice - TARGET.voice) <= TOLERANCE;

  const updateControl = (key: 'wind' | 'traffic' | 'voice', value: number) => {
    setControls((prev) => ({ ...prev, [key]: value }));
    setConfirmed(false);
  };

  return (
    <div className="absolute inset-0 z-[80] bg-[#120f0f]/95 text-[#e8d8c8] backdrop-blur-md">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#3a3532] px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#5b8c6b]">Voicemail Analysis</div>
            <h2 className="mt-1 text-xl font-bold">Isolate {callerName}'s voice</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-[#3a3532] p-2 text-[#a49484]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-3xl border border-[#3a3532] bg-[#1a1818] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#5b8c6b]/15 p-3 text-[#5b8c6b]">
                  <AudioLines size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold">Signal clarity</div>
                  <div className="text-xs text-[#a49484]">Reduce the outdoor noise until the spoken line cuts through.</div>
                </div>
              </div>
              <div className="text-2xl font-black text-[#5b8c6b]">{clarity}%</div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#2a2522]">
              <div className="h-full rounded-full bg-[#5b8c6b] transition-all duration-200" style={{ width: `${clarity}%` }} />
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  key: 'wind' as const,
                  label: 'Wind reduction',
                  description: 'Bridge gusts are masking the consonants.',
                  value: controls.wind,
                },
                {
                  key: 'traffic' as const,
                  label: 'Traffic gate',
                  description: 'Suppress the road wash without killing the call.',
                  value: controls.traffic,
                },
                {
                  key: 'voice' as const,
                  label: 'Voice focus',
                  description: 'Lift the speaker above the remaining noise floor.',
                  value: controls.voice,
                },
              ].map((control) => (
                <label key={control.key} className="block">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-bold">{control.label}</div>
                      <div className="text-xs text-[#a49484]">{control.description}</div>
                    </div>
                    <span className="font-mono text-[#5b8c6b]">{control.value}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={control.value}
                    onChange={(e) => updateControl(control.key, Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#2a2522]"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-[#3a3532] bg-[#1a1818] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#c8a86b]">
              <SlidersHorizontal size={16} />
              What you are listening for
            </div>
            <p className="text-sm leading-relaxed text-[#d8c8b8]">
              The caller is outdoors. Strip back wind first, then road noise, then push the voice forward until both
              sentences sound clean enough to transcribe.
            </p>

            {solved && (
              <div className="mt-4 rounded-2xl border border-[#5b8c6b]/40 bg-[#5b8c6b]/10 p-4 text-sm text-[#a9d4b4]">
                Voice isolated. The call is intelligible now.
              </div>
            )}

            <button
              onClick={() => {
                setConfirmed(true);
                if (solved) onSuccess();
              }}
              className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-colors ${
                solved ? 'bg-[#5b8c6b] text-white' : 'bg-[#2a2522] text-[#a49484]'
              }`}
            >
              Recover transcript
            </button>

            {confirmed && !solved && (
              <p className="mt-3 text-center text-xs text-[#9c5b5b]">
                Not clean enough yet. Keep tuning the filters until the line locks in.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

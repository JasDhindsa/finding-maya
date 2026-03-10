import React, { useMemo, useState } from 'react';
import { RotateCcw, ScanSearch, X } from 'lucide-react';

interface DeletedPhotoRecoveryMinigameProps {
  photo: any;
  onClose: () => void;
  onSuccess: () => void;
}

type Fragment = {
  id: string;
  title: string;
  body: string;
};

function buildFragments(photo: any): Fragment[] {
  const lines = String(photo.content || photo.bodyVisible || photo.visibleText || photo.description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const usableLines = lines.length > 0 ? lines : [String(photo.description || 'Deleted image data'), 'Metadata recovered', 'Open to inspect'];
  const chunkSize = Math.max(1, Math.ceil(usableLines.length / 3));

  return [0, 1, 2].map((index) => {
    const chunk = usableLines.slice(index * chunkSize, (index + 1) * chunkSize);
    return {
      id: `${photo.id || 'deleted'}_${index}`,
      title: chunk[0] || `Fragment ${index + 1}`,
      body: chunk.slice(1).join('\n') || chunk[0] || 'Recovered OCR fragment',
    };
  });
}

export const DeletedPhotoRecoveryMinigame = ({ photo, onClose, onSuccess }: DeletedPhotoRecoveryMinigameProps) => {
  const fragments = useMemo(() => buildFragments(photo), [photo]);
  const [order, setOrder] = useState([2, 0, 1].slice(0, fragments.length));
  const solved = order.every((fragmentIndex, index) => fragmentIndex === index);

  const moveFragment = (position: number, direction: -1 | 1) => {
    setOrder((prev) => {
      const nextIndex = position + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[position], next[nextIndex]] = [next[nextIndex], next[position]];
      return next;
    });
  };

  const reset = () => setOrder([2, 0, 1].slice(0, fragments.length));

  return (
    <div className="absolute inset-0 z-[80] bg-black/95 text-white backdrop-blur-md">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#0a84ff]">Deleted Photo Recovery</div>
            <h2 className="mt-1 text-xl font-bold">Reassemble the recovered scan</h2>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-white/50">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-3xl border border-white/10 bg-[#111214] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#0a84ff]/15 p-3 text-[#0a84ff]">
                <ScanSearch size={22} />
              </div>
              <div>
                <div className="text-sm font-bold">Recovered OCR blocks</div>
                <div className="text-xs text-white/40">Move the fragments back into the original top-to-bottom order.</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {order.map((fragmentIndex, position) => {
                const fragment = fragments[fragmentIndex];
                return (
                  <div key={`${fragment.id}_${position}`} className="rounded-2xl border border-white/10 bg-[#1c1c1e] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0a84ff]">Fragment {position + 1}</div>
                        <div className="mt-2 text-sm font-bold">{fragment.title}</div>
                        <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-white/60 font-mono">
                          {fragment.body}
                        </pre>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => moveFragment(position, -1)}
                          disabled={position === 0}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold disabled:opacity-30"
                        >
                          Up
                        </button>
                        <button
                          onClick={() => moveFragment(position, 1)}
                          disabled={position === order.length - 1}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold disabled:opacity-30"
                        >
                          Down
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-[#111214] p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                {solved ? 'Sequence restored. The deleted image can be rendered safely.' : 'The scan is still out of order.'}
              </div>
              <button onClick={reset} className="flex items-center gap-2 text-xs font-bold text-white/50">
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <button
              onClick={onSuccess}
              disabled={!solved}
              className="mt-5 w-full rounded-2xl bg-[#0a84ff] px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:bg-[#2c2c2e] disabled:text-white/35"
            >
              Restore deleted image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

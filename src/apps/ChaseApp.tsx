import React from 'react';
import { CreditCard, Lock, ScanFace, ShieldAlert } from 'lucide-react';
import { useGame } from '../store/GameContext';

export const ChaseApp = () => {
  const { state } = useGame();

  if (state.activeDevice !== 'victim') {
    return <div className="p-4 text-white">No banking data available.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1720] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#28313b] bg-[#16202a] flex items-center gap-3">
        <CreditCard size={24} className="text-[#5b8c6b]" />
        <span className="text-2xl font-bold">Chase Mobile</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-[#16202a] border border-[#28313b] flex items-center justify-center mb-6">
          <ScanFace size={40} className="text-[#a49484]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Face ID Failed</h2>
        <p className="text-[#a49484] max-w-[280px] mb-6">
          Face not recognized. Maya&apos;s banking app is locked behind Face ID or her device passcode.
        </p>
        <div className="w-full max-w-sm rounded-2xl border border-[#28313b] bg-[#16202a] p-4 text-left">
          <div className="flex items-center gap-2 text-[#c8a86b] mb-3">
            <ShieldAlert size={18} />
            <span className="font-bold">Investigation Note</span>
          </div>
          <p className="text-sm text-[#a49484] leading-relaxed mb-3">
            This app is intentionally locked. The low-balance notification already tells you Maya was under financial pressure.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#d8c8b8]">
            <Lock size={14} />
            <span>Try another clue source before forcing this.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

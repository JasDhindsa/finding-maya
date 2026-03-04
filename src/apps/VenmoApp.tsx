import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useGame } from '../store/GameContext';

export const VenmoApp = () => {
  const { state } = useGame();
  const venmoData = state.venmo[state.activeDevice];

  if (!venmoData) {
    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
        <div className="px-6 pb-4 border-b border-[#3a3532] text-xl font-bold bg-[#1a1818] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#3b6b9c] flex items-center justify-center text-white font-bold italic">V</div> Venmo
        </div>
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center text-[#a49484]">
          No Venmo account associated with this device.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
      <div className="px-6 pb-4 border-b border-[#3a3532] text-xl font-bold bg-[#1a1818] flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#3b6b9c] flex items-center justify-center text-white font-bold italic">V</div> Venmo
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-[#2a2522] border-4 border-[#3a3532] flex items-center justify-center mb-6">
          <DollarSign size={40} className="text-[#5b8c6b]" />
        </div>
        <h2 className="text-3xl font-bold mb-2">{venmoData.balance}</h2>
        <p className="text-[#a49484] mb-8">Current Balance</p>

        <div className="w-full bg-[#2a2522] rounded-xl p-4 border border-[#3a3532] text-left mt-6 space-y-4">
          <h3 className="font-bold text-[#e8d8c8] mb-2">Recent Activity</h3>
          {venmoData.transactions.map((tx: any, idx: number) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div className="w-full h-px bg-[#3a3532]"></div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3a3532] flex items-center justify-center flex-shrink-0">
                    {tx.type === 'payment' ? (
                      <ArrowDownLeft size={16} className="text-[#9c5b5b]" />
                    ) : (
                      <ArrowUpRight size={16} className="text-[#5b8c6b]" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#e8d8c8]">{tx.name}</div>
                    <div className="text-sm text-[#a49484]">{tx.note}</div>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'payment' ? 'text-[#9c5b5b]' : 'text-[#5b8c6b]'}`}>
                  {tx.amount}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

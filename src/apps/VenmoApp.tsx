import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const VenmoApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
    <div className="px-6 pb-4 border-b border-[#3a3532] text-xl font-bold bg-[#1a1818] flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-[#3b6b9c] flex items-center justify-center text-white font-bold italic">V</div> Venmo
    </div>
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-[#2a2522] border-4 border-[#3a3532] flex items-center justify-center mb-6">
        <DollarSign size={40} className="text-[#5b8c6b]" />
      </div>
      <h2 className="text-3xl font-bold mb-2">$142.50</h2>
      <p className="text-[#a49484] mb-8">Current Balance</p>
      
      <div className="w-full bg-[#2a2522] rounded-xl p-4 border border-[#3a3532] text-left mt-6 space-y-4">
        <h3 className="font-bold text-[#e8d8c8] mb-2">Recent Activity</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3a3532] flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft size={16} className="text-[#9c5b5b]" />
            </div>
            <div>
              <div className="font-bold text-[#e8d8c8]">Liam Keller</div>
              <div className="text-sm text-[#a49484]">Coffee ☕</div>
            </div>
          </div>
          <div className="font-bold text-[#9c5b5b]">-$5.50</div>
        </div>
        <div className="w-full h-px bg-[#3a3532]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3a3532] flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={16} className="text-[#5b8c6b]" />
            </div>
            <div>
              <div className="font-bold text-[#e8d8c8]">Sophie Rodriguez</div>
              <div className="text-sm text-[#a49484]">Lunch 🥗</div>
            </div>
          </div>
          <div className="font-bold text-[#5b8c6b]">+$18.00</div>
        </div>
      </div>
    </div>
  </div>
);

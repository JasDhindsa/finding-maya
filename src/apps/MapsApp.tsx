import React from 'react';
import { MapPin } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { victimMaps } from '../data/victimContent';

export const MapsApp = () => {
  const { state } = useGame();

  if (state.activeDevice !== 'victim') return <div className="p-4 text-white">No Maps available.</div>;

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="flex-1 relative">
        {/* Fake Map Background */}
        <div className="absolute inset-0 bg-[#2a2522] overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-full h-full border-[20px] border-[#3a3532] rounded-full opacity-50"></div>
          <div className="absolute top-1/2 left-1/3 w-full h-full border-[15px] border-[#4a4542] rounded-full opacity-50"></div>
          <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-[#5b8c6b] rounded-full border-2 border-[#1a1818] shadow-lg z-10">
            <div className="absolute inset-0 bg-[#5b8c6b] rounded-full animate-ping opacity-50"></div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 bg-[#1a1818] border border-[#3a3532] rounded-xl shadow-md p-3 flex items-center gap-3 z-20">
          <MapPin className="text-[#a49484]" size={20} />
          <input type="text" placeholder="Search Maps" className="flex-1 bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a49484]" readOnly />
        </div>
      </div>

      {/* Location History Panel */}
      <div className="h-1/2 bg-[#1a1818] border-t border-[#3a3532] rounded-t-3xl shadow-[0_-4px_15px_rgba(0,0,0,0.5)] z-20 flex flex-col">
        <div className="w-12 h-1.5 bg-[#3a3532] rounded-full mx-auto mt-3 mb-4"></div>
        <div className="px-6 pb-4 border-b border-[#3a3532]">
          <h2 className="text-xl font-bold text-[#e8d8c8]">Location History</h2>
          <p className="text-sm text-[#a49484]">Thursday, November 16th</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative pl-6 border-l-2 border-[#5b8c6b] ml-4 space-y-6">
            {victimMaps.map((loc, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 bg-[#1a1818] border-4 border-[#5b8c6b] rounded-full"></div>
                <div className="font-medium text-[#e8d8c8]">{loc.location}</div>
                <div className="text-sm text-[#a49484]">{loc.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

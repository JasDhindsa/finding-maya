import React from 'react';
import { Car, MapPin, Search, Home, Clock, User, ChevronRight } from 'lucide-react';

export const UberApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
    <div className="flex-1 overflow-y-auto">
      {/* Map Placeholder */}
      <div className="h-64 bg-[#2a2522] relative overflow-hidden border-b border-[#3a3532]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5b8c6b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#1a1818] rounded-full border-4 border-[#5b8c6b] flex items-center justify-center shadow-lg">
          <Car size={20} className="text-[#5b8c6b]" />
        </div>
      </div>

      <div className="p-4 -mt-6 relative z-10">
        <div className="bg-[#2a2522] rounded-2xl p-4 shadow-lg border border-[#3a3532]">
          <h2 className="text-xl font-bold mb-4">Where to?</h2>
          <div className="flex items-center gap-3 bg-[#1a1818] p-3 rounded-xl border border-[#3a3532]">
            <Search size={20} className="text-[#a49484]" />
            <span className="text-[#a49484] font-medium">Enter destination</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Recent Rides</h3>
            <span className="text-[#5b8c6b] text-sm font-bold">See All</span>
          </div>
          
          <div className="space-y-3">
            <div className="bg-[#2a2522] rounded-xl p-4 border border-[#3a3532] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1a1818] flex items-center justify-center flex-shrink-0 border border-[#3a3532]">
                <MapPin size={20} className="text-[#e8d8c8]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#e8d8c8]">Axiom Technologies HQ</div>
                <div className="text-xs text-[#a49484] mt-1">Nov 16, 6:45 PM • $14.50</div>
              </div>
              <ChevronRight size={20} className="text-[#a49484]" />
            </div>
            
            <div className="bg-[#2a2522] rounded-xl p-4 border border-[#3a3532] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1a1818] flex items-center justify-center flex-shrink-0 border border-[#3a3532]">
                <MapPin size={20} className="text-[#e8d8c8]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#e8d8c8]">Fort Point</div>
                <div className="text-xs text-[#a49484] mt-1">Nov 16, 9:30 PM • $22.00</div>
              </div>
              <ChevronRight size={20} className="text-[#a49484]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex-none flex justify-around items-center px-6 py-4 bg-[#1a1818] border-t border-[#3a3532]">
      <div className="flex flex-col items-center gap-1 text-[#e8d8c8]">
        <Home size={24} fill="currentColor" />
        <span className="text-[10px] font-bold">Home</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#a49484]">
        <Car size={24} />
        <span className="text-[10px] font-bold">Services</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#a49484]">
        <Clock size={24} />
        <span className="text-[10px] font-bold">Activity</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#a49484]">
        <User size={24} />
        <span className="text-[10px] font-bold">Account</span>
      </div>
    </div>
  </div>
);

import React from 'react';
import { Search, Globe } from 'lucide-react';

export const BrowserApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
    <div className="px-4 pb-4 flex items-center gap-2 border-b border-[#3a3532]">
      <div className="flex-1 bg-[#2a2522] rounded-full px-4 py-2.5 text-sm text-[#a49484] flex items-center gap-2 border border-[#3a3532]">
        <Search size={16} />
        Search or type URL
      </div>
    </div>
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-[#a49484]">
      <Globe size={64} className="mb-4 opacity-20" />
      <p>New Tab</p>
      
      <div className="mt-12 w-full max-w-[240px] space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#a49484] mb-2">Favorites</div>
        {['Google', 'Wikipedia', 'News'].map((site) => (
          <div key={site} className="flex items-center gap-3 p-3 bg-[#2a2522] rounded-xl border border-[#3a3532]">
            <div className="w-8 h-8 rounded-full bg-[#3a3532] flex items-center justify-center text-xs font-bold">
              {site[0]}
            </div>
            <span className="text-sm font-medium">{site}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

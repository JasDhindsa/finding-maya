import React, { useState } from 'react';
import { Music, SkipBack, Play, Pause, SkipForward } from 'lucide-react';

export const MusicApp = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
      <div className="px-6 pb-4 text-xl font-medium text-center border-b border-[#3a3532]">Now Playing</div>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full aspect-square bg-[#2a2522] rounded-3xl shadow-2xl mb-8 flex items-center justify-center border-4 border-[#3a3532]">
          <Music size={64} className="text-[#a49484] opacity-50" />
        </div>
        <div className="text-2xl font-bold mb-2 text-[#c8a86b]">Cartoon Theme</div>
        <div className="text-[#a49484] mb-8 font-medium">Unknown Artist</div>
        
        <div className="w-full h-1.5 bg-[#3a3532] rounded-full mb-8 relative cursor-pointer">
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#c8a86b] rounded-full"></div>
          <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"></div>
        </div>

        <div className="flex items-center gap-8">
          <button className="text-[#a49484] hover:text-[#e8d8c8] transition-colors"><SkipBack size={32} /></button>
          <button 
            className="w-16 h-16 rounded-full bg-[#c8a86b] flex items-center justify-center text-[#1a1818] active:scale-95 transition-transform shadow-lg"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-[#a49484] hover:text-[#e8d8c8] transition-colors"><SkipForward size={32} /></button>
        </div>
      </div>
    </div>
  );
};

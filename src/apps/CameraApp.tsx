import React from 'react';
import { Settings, RefreshCcw } from 'lucide-react';

export const CameraApp = () => (
  <div className="flex flex-col h-full bg-black text-white relative">
    <div className="absolute top-4 left-0 right-0 flex justify-between px-6 z-10">
      <Settings size={24} className="cursor-pointer text-white/70 hover:text-white transition-colors" />
      <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center cursor-pointer">
        <div className="w-6 h-6 rounded-full border border-white"></div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900"></div>
      <div className="w-full h-[100vw] border-y border-white/20 flex items-center justify-center relative z-10 bg-[#1a1818]">
        <span className="text-white/30 font-mono text-sm tracking-widest">CAMERA VIEWFINDER</span>
      </div>
    </div>
    <div className="h-32 flex items-center justify-center gap-12 pb-4 bg-black z-10">
      <div className="w-12 h-12 rounded-full bg-gray-800 cursor-pointer border border-gray-700"></div>
      <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-white active:scale-95 transition-transform"></div>
      </div>
      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer border border-gray-700 text-white/70 hover:text-white transition-colors">
        <RefreshCcw size={20} />
      </div>
    </div>
  </div>
);

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const GalleryApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
    <div className="px-6 pb-4 text-xl font-medium border-b border-[#3a3532]">Gallery</div>
    <div className="flex-1 overflow-y-auto p-1 grid grid-cols-3 gap-1">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="aspect-square bg-[#2a2522] relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-br from-[#9c5b5b]/20 to-[#5b8c6b]/20"></div>
          <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#a49484] opacity-20" size={24} />
        </div>
      ))}
    </div>
  </div>
);

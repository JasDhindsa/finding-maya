import React from 'react';
import { Smile, MessageCircle, Heart, Star } from 'lucide-react';

export const SmileApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
    <div className="px-6 pb-4 border-b border-[#3a3532] text-xl font-bold bg-[#1a1818] flex items-center gap-2">
      <Smile className="text-[#c8a86b]" /> Smile
    </div>
    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
      <div className="w-32 h-32 rounded-full bg-[#2a2522] border-4 border-[#3a3532] flex items-center justify-center mb-8 animate-bounce">
        <Smile size={64} className="text-[#c8a86b]" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-[#e8d8c8]">Daily Affirmation</h2>
      <p className="text-xl text-[#a49484] italic mb-12">"You are doing great today!"</p>
      
      <div className="flex gap-6">
        <button className="w-16 h-16 rounded-full bg-[#2a2522] border-2 border-[#3a3532] flex items-center justify-center text-[#9c5b5b] hover:bg-[#3a3532] transition-colors">
          <Heart size={28} />
        </button>
        <button className="w-16 h-16 rounded-full bg-[#2a2522] border-2 border-[#3a3532] flex items-center justify-center text-[#c8a86b] hover:bg-[#3a3532] transition-colors">
          <Star size={28} />
        </button>
        <button className="w-16 h-16 rounded-full bg-[#2a2522] border-2 border-[#3a3532] flex items-center justify-center text-[#5b8c6b] hover:bg-[#3a3532] transition-colors">
          <MessageCircle size={28} />
        </button>
      </div>
    </div>
  </div>
);

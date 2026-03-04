import React from 'react';
import { ChevronLeft } from 'lucide-react';

export const SettingsApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-4">
    <div className="px-6 pb-4 border-b border-[#3a3532] text-xl font-bold bg-[#1a1818]">Settings</div>
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {['Wi-Fi', 'Bluetooth', 'Display', 'Sound', 'Battery', 'Storage', 'About Phone'].map((setting) => (
        <div key={setting} className="flex items-center justify-between p-4 bg-[#2a2522] rounded-xl border border-[#3a3532] cursor-pointer active:bg-[#3a3532] transition-colors">
          <span className="font-medium">{setting}</span>
          <ChevronLeft size={20} className="text-[#a49484] rotate-180" />
        </div>
      ))}
    </div>
  </div>
);

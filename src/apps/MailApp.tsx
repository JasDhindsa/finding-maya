import React, { useState } from 'react';
import { ChevronLeft, Mail } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { victimMail } from '../data/victimContent';

export const MailApp = () => {
  const { state } = useGame();
  const [activeEmail, setActiveEmail] = useState<any | null>(null);

  if (state.activeDevice !== 'victim') return <div className="p-4 text-white">No Mail available.</div>;

  if (activeEmail) {
    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setActiveEmail(null)} className="text-[#5b8c6b]">
            <ChevronLeft size={28} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h1 className="text-2xl font-bold mb-4">{activeEmail.subject}</h1>
          <div className="flex items-center gap-3 mb-6 border-b border-[#3a3532] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#3a3532] flex items-center justify-center text-[#a49484] font-bold">
              {activeEmail.from ? activeEmail.from[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="font-medium text-[#e8d8c8]">{activeEmail.from || 'Maya Chen'}</div>
              <div className="text-xs text-[#a49484]">To: {activeEmail.to || 'Maya Chen'}</div>
            </div>
            <div className="ml-auto text-xs text-[#a49484]">{activeEmail.time}</div>
          </div>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#d8c8b8]">
            {activeEmail.body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#3a3532] text-2xl font-bold bg-[#2a2522] flex items-center gap-2">
        <Mail className="text-[#5b8c6b]" /> Inbox
      </div>
      <div className="flex-1 overflow-y-auto">
        {victimMail.map((email, idx) => (
          <div
            key={idx}
            onClick={() => setActiveEmail(email)}
            className="p-4 border-b border-[#3a3532]/50 cursor-pointer active:bg-[#2a2522] transition-colors"
          >
            <div className="flex justify-between items-baseline mb-1">
              <div className="font-bold text-[#e8d8c8] truncate pr-2">{email.from || 'To: ' + email.to.split(',')[0]}</div>
              <div className="text-xs text-[#a49484] flex-shrink-0">{email.time.split(',')[0]}</div>
            </div>
            <div className="text-sm font-medium text-[#d8c8b8] truncate mb-1">{email.subject}</div>
            <div className="text-sm text-[#a49484] truncate">{email.body.replace(/\n/g, ' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

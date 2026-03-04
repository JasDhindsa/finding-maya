import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Hash, Lock, Send, Plus, Search, Menu, Edit } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { victimSlack } from '../data/victimContent';

export const SlackApp = () => {
  const { state } = useGame();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (state.activeDevice !== 'victim') return <div className="p-4 text-white">No Slack available.</div>;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChannel]);

  if (activeChannel) {
    const channelData = victimSlack.find((c) => c.channel === activeChannel);
    if (!channelData) return null;

    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setActiveChannel(null)} className="text-[#5b8c6b]">
            <ChevronLeft size={24} />
          </button>
          <div className="font-medium flex items-center gap-1 flex-1">
            {activeChannel.includes('🔒') ? <Lock size={16} /> : activeChannel.startsWith('DM') ? null : <Hash size={16} />}
            {activeChannel.replace('🔒', '').trim()}
          </div>
          <Search size={20} className="text-[#a49484]" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {channelData.messages.map((msg, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="w-10 h-10 rounded bg-[#3a3532] flex-shrink-0 flex items-center justify-center font-bold text-[#a49484]">
                {msg.sender[0]}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-[#e8d8c8]">{msg.sender}</span>
                  <span className="text-xs text-[#a49484]">{msg.time}</span>
                </div>
                <div className={`text-sm mt-1 ${msg.sender === 'System' ? 'italic text-[#a49484]' : 'text-[#d8c8b8]'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 pb-8 bg-[#2a2522] border-t border-[#3a3532] flex items-center gap-3">
          <button className="text-[#a49484] hover:text-[#e8d8c8] transition-colors">
            <Plus size={24} />
          </button>
          <div className="flex-1 bg-[#1a1818] rounded-md border border-[#3a3532] flex items-center px-3 py-2">
            <input 
              type="text" 
              placeholder={`Message ${activeChannel.replace('🔒', '').trim()}`} 
              className="flex-1 bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a49484]"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  setInputValue('');
                }
              }}
            />
            <button 
              className={`${inputValue.trim() ? 'text-[#5b8c6b]' : 'text-[#a49484]'} ml-2 transition-colors`}
              onClick={() => {
                if (inputValue.trim()) setInputValue('');
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-4 py-3 border-b border-[#3a3532] bg-[#2a2522] flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#3a3532] flex items-center justify-center text-[#e8d8c8]">
          <Menu size={20} />
        </div>
        <div className="flex-1 font-bold text-lg">Axiom Technologies</div>
        <div className="w-8 h-8 rounded-full bg-[#5b8c6b] flex items-center justify-center text-white">
          <Edit size={16} />
        </div>
      </div>
      <div className="px-4 py-2 bg-[#1a1818] border-b border-[#3a3532]">
        <div className="bg-[#2a2522] rounded-md px-3 py-1.5 flex items-center gap-2 border border-[#3a3532]">
          <Search size={16} className="text-[#a49484]" />
          <span className="text-sm text-[#a49484]">Jump to...</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#a49484] uppercase tracking-wider mb-2 px-2">Channels</h3>
          {['#general', '#product-team', '#meridian-project 🔒'].map((channel) => (
            <div
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-[#2a2522] cursor-pointer"
            >
              {channel.includes('🔒') ? <Lock size={16} className="text-[#a49484]" /> : <Hash size={16} className="text-[#a49484]" />}
              <span className={channel.includes('meridian') ? 'font-bold text-white' : 'text-[#d8c8b8]'}>
                {channel.replace('🔒', '').trim()}
              </span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#a49484] uppercase tracking-wider mb-2 px-2">Direct Messages</h3>
          {['DM: Liam Keller', 'DM: Sophie Rodriguez'].map((dm) => (
            <div
              key={dm}
              onClick={() => setActiveChannel(dm)}
              className="flex items-center gap-2 px-2 py-2 rounded hover:bg-[#2a2522] cursor-pointer"
            >
              <div className="w-4 h-4 rounded bg-[#5b8c6b] flex-shrink-0"></div>
              <span className="font-bold text-white">{dm.replace('DM: ', '')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

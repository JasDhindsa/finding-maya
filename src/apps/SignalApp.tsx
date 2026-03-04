import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Shield, Send, Plus, Phone, Video, Edit } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { victimSignal } from '../data/victimContent';

export const SignalApp = () => {
  const { state } = useGame();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (state.activeDevice !== 'victim') return <div className="p-4 text-white">No Signal available.</div>;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread]);

  if (activeThread) {
    const thread = victimSignal.find((m) => m.id === activeThread);
    if (!thread) return null;

    return (
      <div className="flex flex-col h-full bg-[#121212] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          <button onClick={() => setActiveThread(null)} className="text-[#4a7ab0]">
            <ChevronLeft size={24} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#4a7ab0] flex items-center justify-center text-sm font-bold text-white">
            {thread.name[0]}
          </div>
          <div className="font-medium flex-1">{thread.name}</div>
          <div className="flex items-center gap-4 text-[#4a7ab0]">
            <Video size={20} />
            <Phone size={20} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-[#2a2a2a] text-[#a4a4a4] text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Shield size={12} /> Messages are end-to-end encrypted
            </div>
          </div>
          {thread.messages.map((msg, idx) => {
            const isMe = msg.sender === 'Maya';
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#4a7ab0] text-white rounded-br-sm'
                      : 'bg-[#2a2a2a] text-[#e8d8c8] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#a4a4a4] mt-1 mx-1">{msg.time}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 pb-8 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center gap-3">
          <button className="text-[#a4a4a4] hover:text-[#e8d8c8] transition-colors">
            <Plus size={24} />
          </button>
          <div className="flex-1 bg-[#2a2a2a] rounded-full border border-[#3a3a3a] flex items-center px-4 py-2">
            <input 
              type="text" 
              placeholder="Signal message" 
              className="flex-1 bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a4a4a4]"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  setInputValue('');
                }
              }}
            />
            <button 
              className={`${inputValue.trim() ? 'text-[#4a7ab0]' : 'text-[#a4a4a4]'} ml-2 transition-colors`}
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
    <div className="flex flex-col h-full bg-[#121212] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#2a2a2a] text-2xl font-bold bg-[#1a1a1a] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>Signal</span>
          <Shield size={20} className="text-[#4a7ab0]" />
        </div>
        <button className="text-[#4a7ab0]">
          <Edit size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {victimSignal.map((thread) => {
          const lastMsg = thread.messages[thread.messages.length - 1];
          return (
            <div
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className="flex items-center gap-4 p-4 border-b border-[#2a2a2a]/50 cursor-pointer active:bg-[#1a1a1a] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#4a7ab0] flex-shrink-0 flex items-center justify-center text-xl font-bold text-white">
                {thread.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-medium truncate">{thread.name}</div>
                  <div className="text-xs text-[#a4a4a4] flex-shrink-0 ml-2">{lastMsg.time}</div>
                </div>
                <div className="text-sm text-[#a4a4a4] truncate">{lastMsg.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

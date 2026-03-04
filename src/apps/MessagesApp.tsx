import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Image as ImageIcon, Plus, Phone, Video, Edit } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { victimMessages } from '../data/victimContent';
import { playerMessages } from '../data/playerContent';

export const MessagesApp = () => {
  const { state } = useGame();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = state.activeDevice === 'victim' ? victimMessages : playerMessages;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread, messages]);

  if (activeThread) {
    const thread = messages.find((m) => m.id === activeThread);
    if (!thread) return null;

    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setActiveThread(null)} className="text-[#5b8c6b]">
            <ChevronLeft size={24} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#9c5b5b] flex items-center justify-center text-sm font-bold">
            {thread.name[0]}
          </div>
          <div className="font-medium flex-1">{thread.name}</div>
          <div className="flex items-center gap-4 text-[#5b8c6b]">
            <Phone size={20} />
            <Video size={20} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.messages.map((msg, idx) => {
            const isMe = state.activeDevice === 'victim' ? msg.sender === 'Maya' : msg.sender === 'You';
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    isMe
                      ? 'bg-[#5b8c6b] text-white rounded-br-sm'
                      : 'bg-[#3a3532] text-[#e8d8c8] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#a49484] mt-1 mx-1">{msg.time}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 pb-8 bg-[#2a2522] border-t border-[#3a3532] flex items-center gap-3">
          <button className="text-[#a49484] hover:text-[#e8d8c8] transition-colors">
            <Plus size={24} />
          </button>
          <div className="flex-1 bg-[#1a1818] rounded-full border border-[#3a3532] flex items-center px-4 py-2">
            <input 
              type="text" 
              placeholder="iMessage" 
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
      <div className="px-6 py-4 border-b border-[#3a3532] text-2xl font-bold bg-[#1a1818] flex justify-between items-center">
        <span>Messages</span>
        <button className="text-[#5b8c6b]">
          <Edit size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.map((thread) => {
          const lastMsg = thread.messages[thread.messages.length - 1];
          return (
            <div
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className="flex items-center gap-4 p-4 border-b border-[#3a3532]/50 cursor-pointer active:bg-[#2a2522] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#9c5b5b] flex-shrink-0 flex items-center justify-center text-xl font-bold">
                {thread.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-medium truncate">{thread.name}</div>
                  <div className="text-xs text-[#a49484] flex-shrink-0 ml-2">{lastMsg.time}</div>
                </div>
                <div className="text-sm text-[#a49484] truncate">{lastMsg.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

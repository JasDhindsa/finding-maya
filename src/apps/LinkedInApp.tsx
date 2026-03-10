import React, { useMemo, useState } from 'react';
import { Briefcase, MessageSquare, Search } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';

export const LinkedInApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const { reportAction } = useStoryStore();
  const [query, setQuery] = useState('');

  const linkedIn = story?.victimLinkedIn;
  const profile = linkedIn?.profile;
  const activity = linkedIn?.recentActivity || [];
  const inbox = linkedIn?.linkedInMessages || [];

  const filteredMessages = useMemo(() => {
    if (!query.trim()) return inbox;
    const normalized = query.toLowerCase();
    return inbox.filter((message: any) =>
      String(message.from || '').toLowerCase().includes(normalized) ||
      String(message.text || '').toLowerCase().includes(normalized)
    );
  }, [inbox, query]);

  if (state.activeDevice !== 'victim' || !linkedIn || !profile) {
    return <div className="p-4 text-white">No LinkedIn data available.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#121212] text-[#e8d8c8]">
      <div className="px-4 py-3 bg-[#2a2522] border-b border-[#3a3532] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3b6b9c] flex items-center justify-center text-white font-bold text-xs">in</div>
        <div className="flex-1 bg-[#1a1818] rounded-md px-3 py-1.5 flex items-center gap-2 border border-[#3a3532]">
          <Search size={16} className="text-[#a49484]" />
          <input
            className="w-full bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a49484]"
            placeholder="Search LinkedIn"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                reportAction('linkedin_searched', { query: query.trim() });
              }
            }}
          />
        </div>
        <MessageSquare size={22} className="text-[#a49484]" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="relative">
          <div className="h-28 bg-[#3b6b9c]" />
          <div className="px-4 pb-4 bg-[#1a1818] border-b border-[#3a3532]">
            <div className="-mt-10 w-20 h-20 rounded-full bg-[#2a2522] border-4 border-[#1a1818] flex items-center justify-center text-2xl font-bold">
              MC
            </div>
            <h1 className="text-2xl font-bold mt-3">{profile.name}</h1>
            <p className="text-sm text-[#d8c8b8] mt-1">{profile.title}</p>
            <p className="text-xs text-[#a49484] mt-2">{profile.location} • {profile.connections} connections</p>
            <p className="text-sm text-[#a49484] mt-4 leading-relaxed">{profile.about}</p>
          </div>
        </section>

        <section className="p-4 border-b border-[#3a3532] bg-[#1a1818]">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={16} className="text-[#5b8c6b]" />
            <h2 className="font-bold">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {activity.map((item: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[#3a3532] bg-[#2a2522] p-4">
                <div className="text-xs text-[#a49484] mb-2">{item.time} • {item.type}</div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{item.content}</div>
                <div className="text-xs text-[#a49484] mt-3">{item.reactions} reactions • {item.comments} comments</div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-4 bg-[#1a1818]">
          <h2 className="font-bold mb-3">Messages</h2>
          <div className="space-y-3">
            {filteredMessages.map((message: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl border border-[#3a3532] bg-[#2a2522] p-4 cursor-pointer active:bg-[#323030]"
                onClick={() => {
                  if (message.from && message.from.toLowerCase().includes('liam')) {
                    reportAction('linkedin_searched', { query: 'Liam Keller' });
                  }
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-bold">{message.from}</div>
                  <div className="text-xs text-[#a49484]">{message.time}</div>
                </div>
                <div className="text-sm text-[#d8c8b8] mt-2 leading-relaxed whitespace-pre-wrap">{message.text}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

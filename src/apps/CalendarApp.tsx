import React from 'react';
import { CalendarDays, Flag } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useGame } from '../store/GameContext';

export const CalendarApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const calendar = story?.victimCalendar;

  if (state.activeDevice !== 'victim' || !calendar) {
    return <div className="p-4 text-white">No calendar data available.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#3a3532] bg-[#2a2522] flex items-center gap-3">
        <CalendarDays size={24} className="text-[#c8a86b]" />
        <span className="text-2xl font-bold">Calendar</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(calendar).map(([day, entries]) => (
          <section key={day}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#a49484] mb-3">{day.replace(/_/g, ' ')}</h2>
            <div className="space-y-3">
              {entries.map((entry: any, index: number) => (
                <div key={`${day}-${index}`} className="rounded-2xl border border-[#3a3532] bg-[#2a2522] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold">{entry.title}</div>
                      <div className="text-sm text-[#a49484] mt-1">{entry.time}</div>
                    </div>
                    {entry.flag && <Flag size={18} className="text-[#9c5b5b]" />}
                  </div>
                  {entry.location && <div className="text-sm text-[#d8c8b8] mt-2">{entry.location}</div>}
                  {entry.status && <div className="text-xs text-[#c8a86b] mt-2">{entry.status}</div>}
                  {entry.note && <div className="text-sm text-[#a49484] mt-3 leading-relaxed">{entry.note}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

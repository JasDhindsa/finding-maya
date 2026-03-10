import React from 'react';
import { AlertTriangle, CheckCircle2, ListTodo } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useGame } from '../store/GameContext';

export const RemindersApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const reminders = story?.victimReminders;

  if (state.activeDevice !== 'victim' || !reminders) {
    return <div className="p-4 text-white">No reminders available.</div>;
  }

  const sections = [
    { key: 'overdue', title: 'Overdue' },
    { key: 'today', title: 'Today' },
    { key: 'thisWeek', title: 'This Week' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#3a3532] bg-[#2a2522] flex items-center gap-3">
        <ListTodo size={24} className="text-[#5b8c6b]" />
        <span className="text-2xl font-bold">Reminders</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map(section => {
          const items = reminders[section.key] || [];
          if (items.length === 0) return null;

          return (
            <section key={section.key}>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#a49484] mb-3">{section.title}</h2>
              <div className="space-y-3">
                {items.map((item: any, index: number) => (
                  <div key={`${section.key}-${index}`} className="rounded-2xl border border-[#3a3532] bg-[#2a2522] p-4">
                    <div className="flex items-start gap-3">
                      {String(item.status || '').toUpperCase().includes('DONE') ? (
                        <CheckCircle2 size={18} className="text-[#5b8c6b] mt-1" />
                      ) : (
                        <AlertTriangle size={18} className="text-[#c8a86b] mt-1" />
                      )}
                      <div>
                        <div className="font-medium">{item.text}</div>
                        {item.status && <div className="text-xs text-[#a49484] mt-1">{item.status}</div>}
                        {item.note && <div className="text-sm text-[#a49484] mt-2 leading-relaxed">{item.note}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

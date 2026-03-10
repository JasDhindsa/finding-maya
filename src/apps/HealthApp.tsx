import React from 'react';
import { Activity, HeartPulse, Pill } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useGame } from '../store/GameContext';

export const HealthApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const health = story?.victimHealthData;

  if (state.activeDevice !== 'victim' || !health) {
    return <div className="p-4 text-white">No health data available.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#111214] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#2a2d31] bg-[#17191d] flex items-center gap-3">
        <HeartPulse size={24} className="text-[#9c5b5b]" />
        <span className="text-2xl font-bold">Health</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#1a1d22] border border-[#2a2d31] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#a49484]">Steps</div>
            <div className="text-3xl font-bold mt-2">{health.steps}</div>
          </div>
          <div className="rounded-2xl bg-[#1a1d22] border border-[#2a2d31] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#a49484]">Flights</div>
            <div className="text-3xl font-bold mt-2">{health.flightsClimbed}</div>
          </div>
        </div>

        <section className="rounded-2xl bg-[#1a1d22] border border-[#2a2d31] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-[#c8a86b]" />
            <h2 className="font-bold">Heart Rate Timeline</h2>
          </div>
          <div className="space-y-4">
            {(health.heartRate || []).map((entry: any, index: number) => (
              <div key={index} className="border-l-2 border-[#9c5b5b] pl-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{entry.time}</div>
                  <div className="text-sm text-[#c8a86b]">{entry.bpm ?? 'NO DATA'} {entry.bpm ? 'BPM' : ''}</div>
                </div>
                <div className="text-xs text-[#a49484] mt-1">{entry.classification}</div>
                {entry.note && <div className="text-sm text-[#a49484] mt-2 leading-relaxed">{entry.note}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-[#1a1d22] border border-[#2a2d31] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Pill size={18} className="text-[#5b8c6b]" />
            <h2 className="font-bold">Medications</h2>
          </div>
          <div className="space-y-3">
            {(health.medications || []).map((entry: any, index: number) => (
              <div key={index} className="rounded-xl border border-[#2a2d31] bg-[#111214] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{entry.name}</div>
                  <div className="text-sm text-[#a49484]">{entry.time}</div>
                </div>
                <div className="text-xs text-[#a49484] mt-1">{entry.prescribed ? 'Prescribed dose' : 'Unprescribed / irregular dose'}</div>
                {entry.note && <div className="text-sm text-[#a49484] mt-2">{entry.note}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

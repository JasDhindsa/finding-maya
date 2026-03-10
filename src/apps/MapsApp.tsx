import React, { useState } from 'react';
import { MapPin, Route, TriangleAlert } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';
import { FortPointSearchMinigame } from '../components/FortPointSearchMinigame';

export const MapsApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const { reportAction, state: storyState } = useStoryStore();
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [showFortPointSearch, setShowFortPointSearch] = useState(false);
  const locationHistory = story?.victimLocationHistory;
  const timeline = locationHistory?.timeline || [];

  if (state.activeDevice !== 'victim' || !locationHistory) {
    return <div className="p-4 text-white">No Maps available.</div>;
  }

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-[#2a2522] overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-full h-full border-[20px] border-[#3a3532] rounded-full opacity-50"></div>
          <div className="absolute top-1/2 left-1/3 w-full h-full border-[15px] border-[#4a4542] rounded-full opacity-50"></div>
          <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-[#5b8c6b] rounded-full border-2 border-[#1a1818] shadow-lg z-10">
            <div className="absolute inset-0 bg-[#5b8c6b] rounded-full animate-ping opacity-50"></div>
          </div>
        </div>

        <div className="absolute top-4 left-4 right-4 bg-[#1a1818] border border-[#3a3532] rounded-xl shadow-md p-3 flex items-center gap-3 z-20">
          <MapPin className="text-[#a49484]" size={20} />
          <input type="text" placeholder={locationHistory.date} className="flex-1 bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a49484]" readOnly />
        </div>
      </div>

      <div className="h-1/2 bg-[#1a1818] border-t border-[#3a3532] rounded-t-3xl shadow-[0_-4px_15px_rgba(0,0,0,0.5)] z-20 flex flex-col">
        <div className="w-12 h-1.5 bg-[#3a3532] rounded-full mx-auto mt-3 mb-4"></div>
        <div className="px-6 pb-4 border-b border-[#3a3532]">
          <h2 className="text-xl font-bold text-[#e8d8c8]">Location History</h2>
          <p className="text-sm text-[#a49484]">{locationHistory.date}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative pl-6 border-l-2 border-[#5b8c6b] ml-4 space-y-6">
            {timeline.map((loc, idx) => (
              <button
                key={idx}
                className="relative w-full text-left"
                onClick={() => handleSelectLocation(loc)}
              >
                <div className="absolute -left-[31px] top-1 w-4 h-4 bg-[#1a1818] border-4 border-[#5b8c6b] rounded-full"></div>
                <div className="font-medium text-[#e8d8c8]">{loc.location}</div>
                <div className="text-sm text-[#a49484]">{loc.time}</div>
                {loc.address && <div className="text-xs text-[#a49484] mt-1">{loc.address}</div>}
              </button>
            ))}
          </div>
        </div>
        {selectedLocation && (
          <div className="border-t border-[#3a3532] bg-[#151312] p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{selectedLocation.location}</div>
                <div className="text-sm text-[#a49484] mt-1">{selectedLocation.time}</div>
              </div>
              {String(selectedLocation.location || '').toLowerCase().includes('fort point') && (
                <TriangleAlert size={18} className="text-[#c8a86b]" />
              )}
            </div>
            {selectedLocation.note && <p className="text-sm text-[#d8c8b8] leading-relaxed">{selectedLocation.note}</p>}
            {String(selectedLocation.location || '').toLowerCase().includes('fort point') && (
              <button
                onClick={() => setShowFortPointSearch(true)}
                className="w-full rounded-xl bg-[#5b8c6b] px-4 py-3 text-sm font-bold text-white flex items-center justify-center gap-2"
              >
                <Route size={16} />
                {storyState.flags.fort_point_cache_found ? 'Review Cache Site' : 'Search Fort Point Cache'}
              </button>
            )}
          </div>
        )}
      </div>

      {showFortPointSearch && (
        <FortPointSearchMinigame
          onClose={() => setShowFortPointSearch(false)}
          onSuccess={async () => {
            await reportAction('flag_set', { flag: 'fort_point_cache_found', value: true });
            await reportAction('location_visited', { location_id: 'fort_point' });
            setShowFortPointSearch(false);
          }}
        />
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Car, ChevronRight, Clock, Home, MapPin, Search, TriangleAlert, User } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';
import { FortPointSearchMinigame } from '../components/FortPointSearchMinigame';

export const UberApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const { reportAction, state: storyState } = useStoryStore();
  const rides = story?.victimLocationHistory?.uberHistory || [];
  const [showFortPointSearch, setShowFortPointSearch] = useState(false);

  useEffect(() => {
    if (state.activeDevice === 'victim' && story?.victimLocationHistory) {
      reportAction('uber_history_checked', {});
    }
  }, [reportAction, state.activeDevice, story]);

  if (state.activeDevice !== 'victim' || !story?.victimLocationHistory) {
    return <div className="p-4 text-white">No Uber history available.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="flex-1 overflow-y-auto">
        <div className="h-64 bg-[#2a2522] relative overflow-hidden border-b border-[#3a3532]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5b8c6b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#1a1818] rounded-full border-4 border-[#5b8c6b] flex items-center justify-center shadow-lg">
            <Car size={20} className="text-[#5b8c6b]" />
          </div>
        </div>

        <div className="p-4 -mt-6 relative z-10">
          <div className="bg-[#2a2522] rounded-2xl p-4 shadow-lg border border-[#3a3532]">
            <h2 className="text-xl font-bold mb-4">Activity</h2>
            <div className="flex items-center gap-3 bg-[#1a1818] p-3 rounded-xl border border-[#3a3532]">
              <Search size={20} className="text-[#a49484]" />
              <span className="text-[#a49484] font-medium">Recent rides from Maya's account</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Recent Rides</h3>
              <span className="text-[#5b8c6b] text-sm font-bold">{rides.length} trips</span>
            </div>

            <div className="space-y-3">
              {rides.map((ride: any, index: number) => {
                const isFortPointRide = String(ride.dropoff || '').toLowerCase().includes('fort point');
                const isAnomalous = String(ride.note || '').toLowerCase().includes('critical');

                return (
                  <div key={index} className="bg-[#2a2522] rounded-xl p-4 border border-[#3a3532]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1a1818] flex items-center justify-center flex-shrink-0 border border-[#3a3532]">
                        <MapPin size={20} className="text-[#e8d8c8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#e8d8c8] truncate">{ride.pickup}</div>
                        <div className="text-sm text-[#a49484] mt-1">to {ride.dropoff}</div>
                        <div className="text-xs text-[#a49484] mt-2">{ride.time} • {ride.fare} • {ride.duration}</div>
                        <div className="text-xs text-[#a49484] mt-1">{ride.driver}</div>
                        {ride.note && (
                          <div className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-relaxed ${isAnomalous ? 'border-[#c8a86b]/40 bg-[#c8a86b]/10 text-[#e8d8c8]' : 'border-[#3a3532] bg-[#1a1818] text-[#a49484]'}`}>
                            <div className="flex items-start gap-2">
                              {isAnomalous && <TriangleAlert size={14} className="text-[#c8a86b] mt-0.5 shrink-0" />}
                              <span>{ride.note}</span>
                            </div>
                          </div>
                        )}
                        {isFortPointRide && (
                          <button
                            onClick={() => setShowFortPointSearch(true)}
                            className="mt-3 rounded-lg bg-[#5b8c6b] px-3 py-2 text-xs font-bold text-white"
                          >
                            {storyState.flags.fort_point_cache_found ? 'Review Cache Site' : 'Search Fort Point Cache'}
                          </button>
                        )}
                      </div>
                      <ChevronRight size={20} className="text-[#a49484] shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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

      <div className="flex-none flex justify-around items-center px-6 py-4 bg-[#1a1818] border-t border-[#3a3532]">
        <div className="flex flex-col items-center gap-1 text-[#a49484]">
          <Home size={24} />
          <span className="text-[10px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#a49484]">
          <Car size={24} />
          <span className="text-[10px] font-bold">Services</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#e8d8c8]">
          <Clock size={24} fill="currentColor" />
          <span className="text-[10px] font-bold">Activity</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#a49484]">
          <User size={24} />
          <span className="text-[10px] font-bold">Account</span>
        </div>
      </div>
    </div>
  );
};

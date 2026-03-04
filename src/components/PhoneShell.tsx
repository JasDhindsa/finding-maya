import React, { useState, useEffect } from 'react';
import { Bot, Bluetooth, Wifi } from 'lucide-react';
import { useGame } from '../store/GameContext';

const SignalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="2,22 22,22 22,2" />
  </svg>
);

const BatteryIcon = ({ level = 100 }) => (
  <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="18" height="12" rx="2" ry="2" />
    <line x1="22" y1="10" x2="22" y2="14" />
    <rect x="4" y="8" width={`${14 * (level / 100)}`} height="8" fill="currentColor" />
  </svg>
);

export const PhoneShell = ({ children }: { children: React.ReactNode }) => {
  const { state, dispatch } = useGame();
  const isVictim = state.activeDevice === 'victim';

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Device Toggle */}
      <div className="flex bg-[#2a2522] p-1 rounded-full border border-[#3a3532]">
        <button
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            !isVictim ? 'bg-[#e8d8c8] text-[#1a1818]' : 'text-[#a49484] hover:text-[#e8d8c8]'
          }`}
          onClick={() => dispatch({ type: 'SWITCH_DEVICE', payload: 'player' })}
        >
          Jordan's Phone
        </button>
        <button
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            isVictim ? 'bg-[#e8d8c8] text-[#1a1818]' : 'text-[#a49484] hover:text-[#e8d8c8]'
          }`}
          onClick={() => dispatch({ type: 'SWITCH_DEVICE', payload: 'victim' })}
        >
          Maya's Phone
        </button>
      </div>

      {/* Phone Container */}
      <div className="relative w-[380px] h-[800px] max-h-[90vh] bg-[#1a1818] overflow-hidden border-[12px] border-black rounded-[3rem] shadow-2xl flex flex-col font-sans select-none">
        
        {/* Background Swirls (only visible on home screen) */}
        {!state.activeApp && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-30%] w-[150%] h-[150%] opacity-30" style={{
              background: isVictim 
                ? 'radial-gradient(ellipse at center, #5a2a2a 0%, transparent 60%)'
                : 'radial-gradient(ellipse at center, #2a4a5a 0%, transparent 60%)',
              transform: 'rotate(-20deg)'
            }}></div>
            <div className="absolute bottom-[-20%] right-[-30%] w-[150%] h-[150%] opacity-20" style={{
              background: isVictim
                ? 'radial-gradient(ellipse at center, #5a2a2a 0%, transparent 60%)'
                : 'radial-gradient(ellipse at center, #2a4a5a 0%, transparent 60%)',
              transform: 'rotate(20deg)'
            }}></div>
          </div>
        )}

        {/* Status Bar */}
        <div className={`flex justify-between items-center px-5 py-3 z-30 absolute top-0 left-0 right-0 ${state.activeApp === 'Browser' ? 'text-black' : 'text-white/90'}`}>
          <div className="flex items-center gap-2 text-xs font-medium">
            {formatTime(currentTime)}
          </div>
          <div className="flex items-center gap-2">
            <Bluetooth size={14} />
            <Wifi size={16} />
            <BatteryIcon level={isVictim ? 34 : 82} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative z-10 pt-10 pb-14 overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Navigation Bar */}
        <div className={`flex justify-around items-center py-4 px-10 z-20 absolute bottom-0 left-0 right-0 ${state.activeApp ? 'bg-black/80 backdrop-blur-sm' : 'bg-gradient-to-t from-black/50 to-transparent'} text-white/70`}>
          <button onClick={() => dispatch({ type: 'OPEN_APP', payload: null })} className="active:scale-90 transition-transform p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="19,4 5,12 19,20" />
            </svg>
          </button>
          <button onClick={() => dispatch({ type: 'OPEN_APP', payload: null })} className="active:scale-90 transition-transform p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
          <button className="active:scale-90 transition-transform p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

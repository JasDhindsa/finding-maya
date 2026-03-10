import React, { useState, useEffect } from 'react';
import { Bot, Bluetooth, Wifi, MessageSquare, Shield, Hash, Mail, Phone } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { LockScreen } from './LockScreen';
import { NotificationItem } from './NotificationItem';

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
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notiDragStart, setNotiDragStart] = useState<number | null>(null);
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

  const hasUnreadPlayer = state.notifications.some(n => n.device === 'player') || state.incomingCall?.device === 'player';
  const hasUnreadVictim = state.notifications.some(n => n.device === 'victim') || state.incomingCall?.device === 'victim';

  const getNotificationIcons = () => {
    const icons = [];
    const deviceNotifications = state.notifications.filter(n => n.device === state.activeDevice);

    // Unique apps with unread notifications
    const apps = Array.from(new Set(deviceNotifications.map(n => n.app)));

    return apps.map(app => {
      switch (app) {
        case 'Messages': return <MessageSquare key={app} size={12} />;
        case 'Signal': return <Shield key={app} size={12} />;
        case 'Slack': return <Hash key={app} size={12} />;
        case 'Mail': return <Mail key={app} size={12} />;
        case 'Phone': return <Phone key={app} size={12} />;
        default: return null;
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Device Toggle */}
      <div className="flex bg-[#2a2522] p-1 rounded-full border border-[#3a3532]">
        <div className="relative">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${!isVictim ? 'bg-[#e8d8c8] text-[#1a1818]' : 'text-[#a49484] hover:text-[#e8d8c8]'
              }`}
            onClick={() => dispatch({ type: 'SWITCH_DEVICE', payload: 'player' })}
          >
            Jordan's Phone
          </button>
          {hasUnreadPlayer && isVictim && (
            <span className="absolute top-1 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </div>
        <div className="relative">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isVictim ? 'bg-[#e8d8c8] text-[#1a1818]' : 'text-[#a49484] hover:text-[#e8d8c8]'
              }`}
            onClick={() => dispatch({ type: 'SWITCH_DEVICE', payload: 'victim' })}
          >
            Maya's Phone
          </button>
          {hasUnreadVictim && !isVictim && (
            <span className="absolute top-1 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* Phone Container stack */}
      <div className="relative w-[380px] h-[800px] max-h-[90vh] bg-[#1a1818] overflow-hidden border-[12px] border-black rounded-[3rem] shadow-2xl flex flex-col font-sans select-none">

        {/* Lock Screen Overlay (Maya only) */}
        <LockScreen />

        {/* Background Swirls (only visible on home screen) */}
        {!state.activeApp && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-30%] w-[150%] h-[150%] opacity-30" style={{
              background: isVictim
                ? 'radial-gradient(ellipse at center, #fcddec 0%, transparent 60%)'
                : 'radial-gradient(ellipse at center, #2a4a5a 0%, transparent 60%)',
              transform: 'rotate(-20deg)'
            }}></div>
            <div className="absolute bottom-[-20%] right-[-30%] w-[150%] h-[150%] opacity-20" style={{
              background: isVictim
                ? 'radial-gradient(ellipse at center, #fcddec 0%, transparent 60%)'
                : 'radial-gradient(ellipse at center, #2a4a5a 0%, transparent 60%)',
              transform: 'rotate(20deg)'
            }}></div>
          </div>
        )}

        {/* Status Bar */}
        <div
          className={`flex justify-between items-center px-5 py-3 z-[60] absolute top-0 left-0 right-0 cursor-pointer ${state.activeApp === 'Browser' ? 'text-black' : 'text-white/90'}`}
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          onTouchStart={(e) => setNotiDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (notiDragStart !== null && e.touches[0].clientY - notiDragStart > 50) {
              setShowNotificationCenter(true);
              setNotiDragStart(null);
            }
          }}
          onMouseDown={(e) => setNotiDragStart(e.clientY)}
          onMouseMove={(e) => {
            if (notiDragStart !== null && e.clientY - notiDragStart > 50) {
              setShowNotificationCenter(true);
              setNotiDragStart(null);
            }
          }}
          onMouseUp={() => setNotiDragStart(null)}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-1 opacity-60">
              {getNotificationIcons()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SignalIcon />
            <Bluetooth size={14} />
            <Wifi size={16} />
            <BatteryIcon level={isVictim ? 34 : 82} />
          </div>
        </div>

        {/* Notification Center Drawer */}
        {showNotificationCenter && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
              className="absolute top-0 left-0 right-0 max-h-[70%] bg-[#1a1818]/90 border-b border-[#3a3532] rounded-b-[2rem] overflow-hidden flex flex-col animate-in slide-in-from-top duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-12 pb-4 border-b border-[#3a3532]/50 flex justify-between items-center">
                <span className="text-xl font-bold text-[#e8d8c8]">Notifications</span>
                <button
                  onClick={() => {
                    dispatch({ type: 'CLEAR_NOTIFICATIONS', payload: { device: state.activeDevice } });
                    setShowNotificationCenter(false);
                  }}
                  className="text-sm text-[#5b8c6b] font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {state.notifications.filter(n => n.device === state.activeDevice).length === 0 ? (
                  <div className="py-10 text-center text-[#a49484] italic">No new notifications</div>
                ) : (
                  state.notifications.filter(n => n.device === state.activeDevice).map((n) => (
                    <NotificationItem
                      key={n.id}
                      app={n.app}
                      title={n.title}
                      message={n.message}
                      timestamp={n.timestamp}
                      onClick={() => {
                        dispatch({ type: 'OPEN_APP', payload: n.app });
                        if (n.threadId) dispatch({ type: 'OPEN_THREAD', payload: n.threadId });
                        setShowNotificationCenter(false);
                      }}
                      compact
                    />
                  ))
                )}
              </div>
              <div
                className="h-1.5 w-12 bg-[#3a3532] rounded-full mx-auto my-3 cursor-pointer"
                onClick={() => setShowNotificationCenter(false)}
              ></div>
            </div>
            {/* Click outside to close */}
            <div className="flex-1 w-full" onClick={() => setShowNotificationCenter(false)}></div>
          </div>
        )}

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

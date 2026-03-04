import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { ChevronUp } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

export const LockScreen = () => {
    const { state, dispatch } = useGame();
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);

    const isVictim = state.activeDevice === 'victim';
    const isLocked = isVictim && !state.victimUnlocked;

    if (!isLocked) return null;

    const deviceNotifications = state.notifications.filter(n => n.device === state.activeDevice);

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart(clientY);
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (dragStart === null) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const offset = Math.max(0, dragStart - clientY);
        setDragOffset(offset);
    };

    const handleTouchEnd = () => {
        if (dragOffset > 150) {
            setIsUnlocking(true);
            setTimeout(() => {
                dispatch({ type: 'UNLOCK_DEVICE', payload: 'victim' });
            }, 500);
        } else {
            setDragOffset(0);
        }
        setDragStart(null);
    };

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div
            className={`absolute inset-0 z-[100] bg-[#f8ecec] overflow-hidden transition-transform duration-500 ${isUnlocking ? '-translate-y-full' : ''}`}
            style={{ transform: `translateY(${-dragOffset}px)` }}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/assets/images/maya_bg.png"
                    className="w-full h-full object-cover"
                    alt="lockscreen bg"
                />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#f8ecec]/80 to-transparent"></div>
            </div>

            {/* Time & Date */}
            <div className="relative pt-20 flex flex-col items-center text-[#4a3a3a]">
                <div className="text-7xl font-light tracking-tighter mb-2 [text-shadow:0_2px_10px_rgba(255,255,255,0.5)]">
                    {hours}:{minutes}
                </div>
                <div className="text-lg font-medium opacity-60 uppercase tracking-widest">
                    {dateStr}
                </div>
            </div>

            <div className="relative mt-12 px-5 space-y-4 max-h-[45%] overflow-y-auto no-scrollbar">
                {deviceNotifications.length === 0 ? (
                    <div className="text-center text-[#4a3a3a] opacity-30 mt-10 italic text-sm">
                        No older notifications
                    </div>
                ) : (
                    deviceNotifications.map((n) => (
                        <NotificationItem
                            key={n.id}
                            app={n.app}
                            title={n.title}
                            message={n.message}
                            timestamp={n.timestamp}
                        />
                    ))
                )}
            </div>

            {/* Swipe Gesture Guide */}
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 animate-bounce">
                <ChevronUp className="text-[#e01e5a] opacity-50" size={24} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#e01e5a] opacity-60">
                    Swipe up to unlock
                </span>
            </div>

            {/* Bottom Bar Decor */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
        </div>
    );
};

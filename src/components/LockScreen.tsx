import React, { useEffect, useState } from 'react';
import { Camera, ChevronUp, Flashlight, Lock } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { NotificationItem } from './NotificationItem';

export const LockScreen = () => {
    const { state, dispatch } = useGame();
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [now, setNow] = useState(() => new Date());

    const isVictim = state.activeDevice === 'victim';
    const isLocked = isVictim && !state.victimUnlocked;

    useEffect(() => {
        if (!isLocked) return;

        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [isLocked]);

    if (!isLocked) return null;

    const deviceNotifications = state.notifications.filter((n) => n.device === 'victim');

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

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    const statusTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <div
            className={`absolute inset-0 z-[100] overflow-hidden text-white transition-transform duration-500 ${isUnlocking ? '-translate-y-full' : ''}`}
            style={{ transform: `translateY(${-dragOffset}px)` }}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute inset-0">
                <img
                    src="/assets/images/maya_bg.png"
                    className="h-full w-full object-cover"
                    alt="lockscreen bg"
                />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.34),_transparent_38%),linear-gradient(to_bottom,_rgba(16,14,18,0.24),_rgba(16,14,18,0.46)_42%,_rgba(16,14,18,0.82)_100%)]" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
            </div>

            <div className="relative flex h-full flex-col px-4 pb-6 pt-4">
                <div className="flex items-center justify-between px-3 text-[13px] font-semibold tracking-[0.02em] text-white/95">
                    <span>{statusTime}</span>
                    <div className="h-7 w-28 rounded-full bg-black/35 backdrop-blur-md" />
                    <div className="flex items-center gap-2 text-[11px] text-white/85">
                        <span>5G</span>
                        <span className="h-2.5 w-2.5 rounded-full bg-white/85" />
                        <span className="rounded-full border border-white/25 bg-black/20 px-2 py-0.5 text-[10px] font-bold">
                            34%
                        </span>
                    </div>
                </div>

                <div className="mt-8 flex flex-col items-center">
                    <div className="mb-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-1.5 backdrop-blur-xl">
                        <Lock size={13} className="text-white/85" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                            Locked
                        </span>
                    </div>
                    <div className="text-sm font-medium uppercase tracking-[0.24em] text-white/75">
                        {dateStr}
                    </div>
                    <div className="mt-1 text-[84px] font-light leading-none tracking-[-0.08em] [text-shadow:0_8px_30px_rgba(0,0,0,0.18)]">
                        {hours}:{minutes}
                    </div>
                </div>

                <div className="mt-8 flex-1 min-h-0">
                    <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
                        Notifications
                    </div>
                    <div className="max-h-full space-y-3 overflow-y-auto px-1 pb-2 no-scrollbar">
                        {deviceNotifications.length === 0 ? (
                            <div className="mx-1 rounded-[28px] border border-white/10 bg-black/20 px-5 py-6 text-center backdrop-blur-2xl">
                                <div className="text-sm font-medium text-white/85">No new notifications</div>
                                <div className="mt-1 text-xs text-white/45">
                                    Anything new will wait here until the phone is unlocked.
                                </div>
                            </div>
                        ) : (
                            deviceNotifications.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    app={n.app}
                                    title={n.title}
                                    message={n.message}
                                    timestamp={n.timestamp}
                                    compact
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-5 flex items-end justify-between px-2">
                    <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-xl"
                    >
                        <Flashlight size={18} />
                    </button>

                    <div className="flex flex-col items-center gap-1.5">
                        <ChevronUp className="text-white/70" size={20} />
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                            Swipe up to unlock
                        </span>
                        <div className="mt-1 h-1.5 w-36 rounded-full bg-white/75" />
                    </div>

                    <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-xl"
                    >
                        <Camera size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/GameContext';
import { NotificationItem } from './NotificationItem';

interface QueuedNotification {
  id: string;
  title: string;
  message: string;
  app: string;
  threadId?: string;
  device: string;
  timestamp: string;
}

export const NotificationBanner = () => {
  const { state, dispatch } = useGame();
  const [queue, setQueue] = useState<QueuedNotification[]>([]);
  const [current, setCurrent] = useState<QueuedNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);
  const shownIds = useRef<Set<string>>(new Set());
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enqueue new notifications that haven't been shown yet
  useEffect(() => {
    const newNotifs = state.notifications.filter(
      n => n.device === state.activeDevice && !shownIds.current.has(n.id)
    );
    if (newNotifs.length === 0) return;

    newNotifs.forEach(n => shownIds.current.add(n.id));
    setQueue(prev => [...prev, ...newNotifs]);
  }, [state.notifications, state.activeDevice]);

  // Process queue
  useEffect(() => {
    if (current || queue.length === 0) return;

    const next = queue[0];
    setQueue(prev => prev.slice(1));
    setCurrent(next);

    // Small delay for entrance animation
    setTimeout(() => {
      setVisible(true);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 80);

    // Auto-dismiss after 5s
    hideTimer.current = setTimeout(() => {
      dismiss();
    }, 5500);
  }, [queue, current]);

  const dismiss = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(false);
    setTimeout(() => setCurrent(null), 400);
  };

  const handleClick = () => {
    if (!current) return;
    dismiss();
    setTimeout(() => {
      if (current.app && current.app !== 'System') {
        dispatch({ type: 'OPEN_APP', payload: current.app });
      }
      if (current.threadId) {
        dispatch({ type: 'OPEN_THREAD', payload: current.threadId });
      }
    }, 420);
  };

  if (!current) return null;

  return (
    <div
      className={`
        absolute top-2 left-2 right-2 z-100
        transition-all duration-400 ease-out
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        ${pulse ? 'scale-[1.02]' : 'scale-100'}
      `}
      style={{ transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease' }}
    >
      {/* Glow effect behind notification */}
      <div className="absolute inset-0 rounded-2xl blur-md opacity-30 bg-linear-to-r from-white/10 to-white/5 pointer-events-none" />

      <NotificationItem
        app={current.app}
        title={current.title}
        message={current.message}
        timestamp={current.timestamp}
        onClick={handleClick}
      />
    </div>
  );
};

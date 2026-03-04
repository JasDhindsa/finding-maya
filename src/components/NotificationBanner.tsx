import React, { useEffect, useState } from 'react';
import { useGame } from '../store/GameContext';
import { NotificationItem } from './NotificationItem';

export const NotificationBanner = () => {
  const { state, dispatch } = useGame();
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const isLocked = state.activeDevice === 'victim' && !state.victimUnlocked;

  const notificationsForDevice = state.notifications.filter(n =>
    n.device === state.activeDevice && !shownIds.has(n.id)
  );

  // Switch device -> clear current banner instantly
  useEffect(() => {
    if (currentNotification && currentNotification.device !== state.activeDevice) {
      setVisible(false);
      setCurrentNotification(null);
    }
  }, [state.activeDevice, currentNotification]);

  useEffect(() => {
    // Don't show banners if phone is locked
    if (isLocked) {
      setVisible(false);
      setCurrentNotification(null);
      return;
    }

    // If we have queue but no active banner, start the next one
    if (notificationsForDevice.length > 0 && !currentNotification) {
      const nextNoti = notificationsForDevice[0];

      // Mark as shown locally immediately
      setShownIds(prev => new Set(prev).add(nextNoti.id));

      const enterTimer = setTimeout(() => {
        setCurrentNotification(nextNoti);
        setVisible(true);
      }, 100);

      const hideTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrentNotification(null);
        }, 600);
      }, 5100);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [notificationsForDevice, currentNotification, isLocked]);

  if (!currentNotification) return null;

  return (
    <div
      className={`absolute top-12 left-4 right-4 z-50 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-20 opacity-0 scale-95'
        }`}
    >
      <NotificationItem
        app={currentNotification.app}
        title={currentNotification.title}
        message={currentNotification.message}
        timestamp={currentNotification.timestamp}
        onClick={() => {
          setVisible(false);
          setTimeout(() => {
            dispatch({ type: 'OPEN_APP', payload: currentNotification.app });
            if (currentNotification.threadId) {
              dispatch({ type: 'OPEN_THREAD', payload: currentNotification.threadId });
            }
            setCurrentNotification(null);
          }, 500);
        }}
      />
    </div>
  );
};

import React, { useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { MessageSquare, Shield } from 'lucide-react';

export const NotificationBanner = () => {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: state.notifications[0].id });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications, dispatch]);

  if (state.notifications.length === 0) return null;

  const notification = state.notifications[0];

  return (
    <div className="absolute top-12 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-[#2a2522]/95 backdrop-blur-md border border-[#3a3532] rounded-2xl p-4 shadow-2xl flex items-start gap-3 cursor-pointer"
           onClick={() => {
             dispatch({ type: 'OPEN_APP', payload: notification.app });
             dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
           }}>
        <div className="w-10 h-10 rounded-xl bg-[#1a1818] flex items-center justify-center flex-shrink-0">
          {notification.app === 'Signal' ? <Shield size={20} className="text-[#4a7ab0]" /> : <MessageSquare size={20} className="text-[#6b7b9c]" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-[#e8d8c8] text-sm">{notification.title}</span>
            <span className="text-xs text-[#a49484]">now</span>
          </div>
          <p className="text-sm text-[#d8c8b8] mt-0.5 line-clamp-2">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

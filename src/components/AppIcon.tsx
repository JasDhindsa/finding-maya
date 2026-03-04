import React from 'react';

export const AppIcon = ({ icon: Icon, label, color, isCircle = false, onClick, badgeCount }: any) => {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={onClick}>
      <div 
        className={`relative flex items-center justify-center w-[64px] h-[64px] border-[3px] border-[#1a1a1a] transition-transform group-active:scale-95 ${isCircle ? 'rounded-full' : 'rounded-[1.25rem]'}`}
        style={{ 
          backgroundColor: color,
          boxShadow: 'inset 2px 4px 6px rgba(255,255,255,0.4), inset -2px -4px 6px rgba(0,0,0,0.6), 0 6px 10px rgba(0,0,0,0.5)'
        }}
      >
        {/* Glossy overlay */}
        <div className={`absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none ${isCircle ? 'rounded-t-full' : 'rounded-t-[1rem]'}`}></div>
        <Icon size={30} color="#1a1a1a" strokeWidth={2.5} className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)] z-10" />
        
        {badgeCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#1a1818] z-20">
            {badgeCount}
          </div>
        )}
      </div>
      {label && <span className="text-[13px] font-medium text-[#e8d8c8] tracking-wide drop-shadow-md">{label}</span>}
    </div>
  );
};

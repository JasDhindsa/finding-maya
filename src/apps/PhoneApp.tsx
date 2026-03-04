import React, { useState, useEffect } from 'react';
import { Phone, Delete, Star, Clock, Users, Grid, Voicemail, PhoneOff, MicOff, Volume2, Plus, Video, User, Info, Play, Trash2 } from 'lucide-react';

const CallButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex flex-col items-center gap-2">
    <button className="w-16 h-16 rounded-full bg-[#2a2522] flex items-center justify-center border-2 border-[#3a3532] active:bg-[#3a3532] transition-colors">
      <Icon size={24} className="text-[#e8d8c8]" />
    </button>
    <span className="text-[11px] text-[#a49484]">{label}</span>
  </div>
);

export const PhoneApp = () => {
  const [number, setNumber] = useState('');
  const [activeTab, setActiveTab] = useState('Keypad');
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCalling) {
      interval = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      setCallTime(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const keypad = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Favorites':
        return (
          <div className="flex-1 flex flex-col p-6">
            <h1 className="text-3xl font-bold mb-6">Favorites</h1>
            <div className="flex-1 flex items-center justify-center text-[#a49484]">
              No Favorites
            </div>
          </div>
        );
      case 'Recents':
        return (
          <div className="flex-1 flex flex-col">
            <div className="px-6 pt-6 pb-2 border-b border-[#3a3532]">
              <h1 className="text-3xl font-bold">Recents</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {[
                { name: 'Liam Keller', type: 'Mobile', time: 'Yesterday', missed: false },
                { name: 'Unknown', type: 'San Francisco, CA', time: 'Tuesday', missed: true },
                { name: 'Sophie Rodriguez', type: 'Mobile', time: 'Monday', missed: false },
              ].map((call, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3 border-b border-[#3a3532]/50">
                  <div className="flex flex-col">
                    <span className={`font-bold text-lg ${call.missed ? 'text-[#9c5b5b]' : 'text-[#e8d8c8]'}`}>{call.name}</span>
                    <span className="text-sm text-[#a49484]">{call.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#a49484]">{call.time}</span>
                    <Info size={20} className="text-[#5b8c6b]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Contacts':
        return (
          <div className="flex-1 flex flex-col">
            <div className="px-6 pt-6 pb-2 border-b border-[#3a3532]">
              <h1 className="text-3xl font-bold">Contacts</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-2 bg-[#2a2522] text-[#a49484] font-bold text-sm">L</div>
              <div className="px-6 py-3 border-b border-[#3a3532]/50 font-bold text-lg">Liam Keller</div>
              <div className="px-6 py-2 bg-[#2a2522] text-[#a49484] font-bold text-sm">S</div>
              <div className="px-6 py-3 border-b border-[#3a3532]/50 font-bold text-lg">Sophie Rodriguez</div>
            </div>
          </div>
        );
      case 'Voicemail':
        return (
          <div className="flex-1 flex flex-col p-6">
            <h1 className="text-3xl font-bold mb-6">Voicemail</h1>
            <div className="bg-[#2a2522] rounded-xl p-4 border border-[#3a3532]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-bold text-lg">Unknown</div>
                  <div className="text-sm text-[#a49484]">San Francisco, CA</div>
                </div>
                <div className="text-sm text-[#a49484]">Tuesday</div>
              </div>
              <div className="flex items-center gap-4 text-[#5b8c6b]">
                <Play size={24} fill="currentColor" />
                <div className="flex-1 h-1 bg-[#3a3532] rounded-full">
                  <div className="w-0 h-full bg-[#5b8c6b] rounded-full"></div>
                </div>
                <span className="text-sm font-bold">0:00</span>
              </div>
              <div className="flex justify-end mt-4 gap-4 text-[#a49484]">
                <Phone size={20} />
                <Trash2 size={20} />
              </div>
            </div>
          </div>
        );
      case 'Keypad':
      default:
        return (
          <div className="flex-1 flex flex-col justify-between pt-8 px-6 pb-6">
            <div>
              <div className="text-center text-4xl mb-1 font-medium h-12 tracking-wider">{number}</div>
              <div className="text-center text-[#5b8c6b] text-sm h-6 cursor-pointer">{number ? 'Add Number' : ''}</div>
            </div>
            
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 max-w-[280px] mx-auto">
              {keypad.map((item) => (
                <button 
                  key={item.num} 
                  onClick={() => setNumber(prev => prev.length < 15 ? prev + item.num : prev)}
                  className="w-20 h-20 rounded-full bg-[#2a2522] flex flex-col items-center justify-center border-2 border-[#3a3532] active:bg-[#3a3532] transition-colors"
                >
                  <span className="text-3xl font-normal leading-none">{item.num}</span>
                  {item.letters && <span className="text-[10px] font-bold text-[#a49484] tracking-widest mt-1">{item.letters}</span>}
                </button>
              ))}
            </div>
            
            <div className="flex justify-center items-center gap-6 relative max-w-[280px] mx-auto w-full mt-4">
              <div className="w-16"></div>
              <button 
                onClick={() => setIsCalling(true)}
                className="w-20 h-20 rounded-full bg-[#5b8c6b] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
              >
                <Phone size={32} fill="currentColor" />
              </button>
              <div className="w-16 flex justify-center">
                {number.length > 0 && (
                  <button 
                    onClick={() => setNumber(prev => prev.slice(0, -1))}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-[#a49484] active:bg-[#2a2522] transition-colors"
                  >
                    <Delete size={28} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (isCalling) {
    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8] pt-16 px-6">
        <div className="text-center mb-12">
          <div className="text-3xl font-medium mb-2">{number || 'Unknown'}</div>
          <div className="text-[#a49484]">{formatTime(callTime)}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-y-8 gap-x-6 max-w-[280px] mx-auto mb-auto w-full">
          <CallButton icon={MicOff} label="mute" />
          <CallButton icon={Grid} label="keypad" />
          <CallButton icon={Volume2} label="speaker" />
          <CallButton icon={Plus} label="add call" />
          <CallButton icon={Video} label="FaceTime" />
          <CallButton icon={User} label="contacts" />
        </div>

        <div className="flex justify-center pb-12">
          <button 
            onClick={() => setIsCalling(false)}
            className="w-16 h-16 rounded-full bg-[#9c5b5b] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
          >
            <PhoneOff size={32} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      {renderContent()}

      <div className="bg-[#2a2522] border-t border-[#3a3532]">
        <div className="flex justify-between items-center px-6 py-3 pb-5">
          {[
            { icon: Star, label: 'Favorites' },
            { icon: Clock, label: 'Recents' },
            { icon: Users, label: 'Contacts' },
            { icon: Grid, label: 'Keypad' },
            { icon: Voicemail, label: 'Voicemail' }
          ].map((tab) => (
            <div 
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === tab.label ? 'text-[#e8d8c8]' : 'text-[#a49484]'}`}
            >
              <tab.icon size={24} fill={activeTab === tab.label ? 'currentColor' : 'none'} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Delete, Star, Clock, Users, Grid, Voicemail, PhoneOff, MicOff, Volume2, Plus, Video, User, Info, Play, Pause, Trash2 } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { geminiLiveService } from '../services/ai/GeminiLiveService';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { AudioCleanupMinigame } from '../components/AudioCleanupMinigame';

const voicemails_day = (time: string) => {
  return "Today";
};

const VoicemailItem: React.FC<{
  voicemail: any;
  isRecovered: boolean;
  onOpenCleanup: () => void;
}> = ({ voicemail, isRecovered, onOpenCleanup }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const baseAudioSource = voicemail.audioFile || voicemail.file;
  const noisyAudioSource = voicemail.noisyAudioFile || voicemail.staticAudioFile || baseAudioSource;
  const cleanAudioSource = voicemail.cleanAudioFile || voicemail.cleanedAudioFile || voicemail.recoveredAudioFile || baseAudioSource;
  const audioSource = isRecovered ? cleanAudioSource : noisyAudioSource;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
  }, [audioSource]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioSource) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSource);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className="bg-[#2a2522] rounded-2xl p-4 border border-[#3a3532] shadow-lg cursor-pointer transition-all hover:bg-[#3a3532]/50"
      onClick={() => setShowTranscript(!showTranscript)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-bold text-lg text-[#e8d8c8]">{voicemail.from}</div>
          <div className="text-xs text-[#a49484] font-medium tracking-wide">Mobile</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#e8d8c8] font-bold">{voicemail.time}</div>
          <div className="text-[10px] text-[#a49484] uppercase font-black opacity-50">{voicemails_day(voicemail.time)}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[#5b8c6b]">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[#1a1818] flex items-center justify-center text-[#5b8c6b] hover:scale-105 active:scale-95 transition-all shadow-inner"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
        </button>
        <div className="flex-1 h-1.5 bg-[#1a1818] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[#5b8c6b] transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(91,140,107,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold w-8 text-right">{voicemail.duration}</span>
      </div>

      {showTranscript && voicemail.transcript && isRecovered && (
        <div className="mt-4 pt-4 border-t border-[#3a3532] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-[10px] font-bold text-[#5b8c6b] uppercase tracking-widest mb-2">Transcription</div>
          <p className="text-sm text-[#d8c8b8] leading-relaxed italic">"{voicemail.transcript}"</p>
          {voicemail.analysis && (
            <div className="mt-3 rounded-xl border border-[#5b8c6b]/30 bg-[#5b8c6b]/10 p-3 text-xs leading-relaxed text-[#a9d4b4]">
              {voicemail.analysis}
            </div>
          )}
        </div>
      )}

      {showTranscript && !isRecovered && (
        <div className="mt-4 pt-4 border-t border-[#3a3532] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-[10px] font-bold text-[#c8a86b] uppercase tracking-widest mb-2">Transcript Locked</div>
          <p className="text-sm leading-relaxed text-[#a49484]">
            Too much wind and road noise. Clean up the recording before the transcript can be trusted.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCleanup();
            }}
            className="mt-3 rounded-xl bg-[#5b8c6b] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white"
          >
            Clean up audio
          </button>
        </div>
      )}

      <div className="flex justify-end mt-4 gap-6 text-[#a49484]">
        <Trash2 size={18} className="hover:text-red-400 transition-colors" />
        <Phone size={18} className="hover:text-[#5b8c6b] transition-colors" />
      </div>
    </div>
  );
};

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
  const [callName, setCallName] = useState(''); // display name during active call
  const [activeTab, setActiveTab] = useState('Keypad');
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [activeVoicemailPuzzle, setActiveVoicemailPuzzle] = useState<any | null>(null);
  const { state, dispatch } = useGame();
  const { state: storyState, reportAction } = useStoryStore();
  const voicemailFlags = storyState.flags || {};
  const voicemailNotificationCount = state.notifications.filter(
    (n) => n.device === state.activeDevice && n.app === 'Phone'
  ).length;

  useEffect(() => {
    if (voicemailNotificationCount > 0) {
      setActiveTab('Voicemail');
    }
  }, [voicemailNotificationCount]);

  useEffect(() => {
    if (activeTab === 'Voicemail' && voicemailNotificationCount > 0) {
      dispatch({ type: 'CLEAR_APP_NOTIFICATIONS', payload: { device: state.activeDevice, app: 'Phone' } });
    }
  }, [activeTab, voicemailNotificationCount, dispatch, state.activeDevice]);

  useEffect(() => {
    if (state.currentCall && !isCalling) {
      const targetNumber = state.currentCall;
      setNumber(targetNumber);
      // We need a small delay to ensure the number state is updated before handleStartCall uses it
      // or we can pass the number directly to handleStartCall
      dispatch({ type: 'SET_CURRENT_CALL', payload: null });
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => { } };
        // Trigger call logic immediately
        startCallSequence(targetNumber);
      }, 100);
    }
  }, [state.currentCall, isCalling]);

  const startCallSequence = async (targetName: string) => {
    console.log('PhoneApp: Starting call to', targetName);
    setCallName(targetName);
    setIsCalling(true);
    try {
      // Look up contact by name (case-insensitive partial match)
      const contact = state.contacts[state.activeDevice].find(c =>
        c.name.toLowerCase().includes(targetName.toLowerCase()) ||
        targetName.toLowerCase().includes(c.name.toLowerCase())
      );

      const personaKey = contact?.id || 'unknown';
      const voiceName = contact?.voice || 'Puck';

      // Special case for 911
      let targetPersona: string;
      if (targetName.includes('911')) {
        targetPersona = "You are a 911 emergency operator. Professional, calm, but firm. Ravenport is under high alert.";
      } else {
        const personaObj = storyState.personas[personaKey] || storyState.personas['unknown'];
        if (personaObj && !personaObj.online) {
          console.log(`PhoneApp: ${personaKey} is offline, cannot call.`);
          setIsCalling(false);
          return;
        }
        targetPersona =
          personaObj?.callPrompt ||
          personaObj?.systemPrompt ||
          personaObj?.prompt ||
          "You are a mysterious person on the phone. Keep your responses short and cryptic.";
      }

      console.log(`PhoneApp: Calling "${targetName}" as persona "${personaKey}" with voice "${voiceName}"`);
      await geminiLiveService.connect(targetPersona, voiceName);
      console.log('PhoneApp: GeminiLive connected.');
      await reportAction('call_started', { number: targetName, persona: personaKey });
    } catch (error) {
      console.error('PhoneApp: Connection error', error);
      setIsCalling(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCalling) {
      interval = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      setCallTime(0);
      setTranscript('');
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  useEffect(() => {
    geminiLiveService.onTranscriptReceived = (text) => {
      setTranscript(prev => (prev + ' ' + text).slice(-100)); // Keep last 100 chars
    };
    geminiLiveService.onHangUp = () => {
      handleHangUp();
    };
  }, []);

  const handleStartCall = async () => {
    startCallSequence(number);
  };

  const handleHangUp = () => {
    geminiLiveService.disconnect();
    // Log to recent calls
    const duration = callTime;
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    dispatch({
      type: 'ADD_RECENT_CALL',
      payload: {
        device: state.activeDevice,
        call: {
          name: callName || number,
          type: `Mobile · ${durationStr}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          missed: false
        }
      }
    });
    setIsCalling(false);
    setCallName('');
    reportAction('call_ended', { number });
  };

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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-6 pb-2 border-b border-[#3a3532] flex-shrink-0">
              <h1 className="text-3xl font-bold">Recents</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {state.recentCalls[state.activeDevice].length === 0 && (
                <div className="flex items-center justify-center p-12 text-[#a49484] italic text-sm">No recent calls</div>
              )}
              {state.recentCalls[state.activeDevice].map((call, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-3 border-b border-[#3a3532]/50 cursor-pointer hover:bg-[#2a2522] active:bg-[#3a3532] transition-colors"
                  onClick={() => { setNumber(call.name); setActiveTab('Keypad'); }}
                >
                  <div className="flex flex-col">
                    <span className={`font-bold text-lg ${call.missed ? 'text-[#9c5b5b]' : 'text-[#e8d8c8]'}`}>{call.name}</span>
                    <span className="text-sm text-[#a49484]">{call.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#a49484]">{call.time}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); startCallSequence(call.name); }}
                      className="text-[#5b8c6b] hover:opacity-70"
                    >
                      <Phone size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Contacts': {
        const sorted = [...state.contacts[state.activeDevice]].sort((a, b) => a.name.localeCompare(b.name));
        // Group by first letter
        const grouped: Record<string, typeof sorted> = {};
        for (const c of sorted) {
          const letter = c.name[0].toUpperCase();
          if (!grouped[letter]) grouped[letter] = [];
          grouped[letter].push(c);
        }
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-6 pb-2 border-b border-[#3a3532] flex-shrink-0">
              <h1 className="text-3xl font-bold">Contacts</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {Object.entries(grouped).map(([letter, contacts]) => (
                <div key={letter}>
                  <div className="px-6 py-1 bg-[#2a2522] text-[#a49484] font-bold text-sm">{letter}</div>
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      className="px-6 py-3 border-b border-[#3a3532]/50 flex items-center justify-between cursor-pointer hover:bg-[#2a2522] active:bg-[#3a3532] transition-colors"
                      onClick={() => { setNumber(contact.name); setActiveTab('Keypad'); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#5b8c6b]/30 border border-[#5b8c6b]/50 flex items-center justify-center text-sm font-bold text-[#5b8c6b]">
                          {contact.name[0]}
                        </div>
                        <span className="font-medium text-base">{contact.name}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); startCallSequence(contact.name); }}
                        className="text-[#5b8c6b] hover:opacity-70 transition-opacity"
                      >
                        <Phone size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              {state.contacts.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-12 text-[#a49484] italic text-sm">
                  No contacts loaded
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'Voicemail':
        const voicemails = state.voicemails[state.activeDevice] || [];
        const visibleVoicemails = voicemails.filter((vm: any) => !vm.unlockFlag || Boolean(voicemailFlags[vm.unlockFlag]));
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-6 pb-2 border-b border-[#3a3532] flex-shrink-0">
              <h1 className="text-3xl font-bold">Voicemail</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {visibleVoicemails.length === 0 && (
                <div className="flex items-center justify-center p-12 text-[#a49484] italic text-sm text-center">
                  You have no voicemails
                </div>
              )}
              {visibleVoicemails.map((vm, i) => {
                const needsCleanup = Boolean(
                  vm.noisyAudioFile ||
                  vm.staticAudioFile ||
                  vm.cleanAudioFile ||
                  vm.cleanedAudioFile ||
                  vm.recoveredAudioFile
                );
                const recovered = !needsCleanup || Boolean(voicemailFlags[`voicemail_recovered_${vm.id}`]);

                return (
                  <VoicemailItem
                    key={vm.id || i}
                    voicemail={vm}
                    isRecovered={recovered}
                    onOpenCleanup={() => setActiveVoicemailPuzzle(vm)}
                  />
                );
              })}
            </div>
          </div>
        );
      case 'Keypad':
      default:
        return (
          <div className="flex-1 flex flex-col justify-between pt-8 px-6 pb-6">
            <div>
              <div className="text-center text-4xl mb-1 font-medium h-12 tracking-wider">{number}</div>
              <div className="text-center text-[#5b8c6b] text-sm h-6 cursor-pointer" onClick={() => setNumber('')}>{number ? 'Clear' : ''}</div>
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
                onClick={handleStartCall}
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
          <div className="text-[#a49484] mb-4">{formatTime(callTime)}</div>
          {transcript && (
            <div className="bg-[#2a2522] p-4 rounded-xl border border-[#3a3532] italic text-sm text-[#a49484] min-h-[60px] flex items-center justify-center">
              "{transcript}..."
            </div>
          )}
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
            onClick={handleHangUp}
            className="w-16 h-16 rounded-full bg-[#9c5b5b] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
          >
            <PhoneOff size={32} fill="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      {renderContent()}

      {activeVoicemailPuzzle && (
        <AudioCleanupMinigame
          callerName={activeVoicemailPuzzle.from}
          onClose={() => setActiveVoicemailPuzzle(null)}
          onSuccess={async () => {
            await reportAction('flag_set', {
              flag: `voicemail_recovered_${activeVoicemailPuzzle.id}`,
              value: true,
            });
            setActiveVoicemailPuzzle(null);
          }}
        />
      )}

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
              className={`relative flex flex-col items-center gap-1 cursor-pointer ${activeTab === tab.label ? 'text-[#e8d8c8]' : 'text-[#a49484]'}`}
            >
              {tab.label === 'Voicemail' && voicemailNotificationCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#d14b4b] text-white text-[10px] leading-4 text-center font-bold">
                  {voicemailNotificationCount}
                </span>
              )}
              <tab.icon size={24} fill={activeTab === tab.label ? 'currentColor' : 'none'} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

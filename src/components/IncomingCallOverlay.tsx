import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { useStoryStore } from '../services/story-engine/useStoryStore';

export const IncomingCallOverlay = () => {
    const { state, dispatch } = useGame();
    const { state: storyState } = useStoryStore();
    const [ringingTime, setRingingTime] = useState(0);

    const call = state.incomingCall;

    useEffect(() => {
        if (call) {
            setRingingTime(0);
            const interval = setInterval(() => {
                setRingingTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [call]);

    // Auto decline after 30 seconds
    useEffect(() => {
        if (ringingTime > 30 && call) {
            handleDecline();
        }
    }, [ringingTime, call]);

    if (!call || call.device !== state.activeDevice) return null;

    const handleDecline = () => {
        dispatch({ type: 'SET_INCOMING_CALL', payload: null });
    };

    const handleAccept = () => {
        dispatch({ type: 'SET_INCOMING_CALL', payload: null });
        // Look up contact by voice or persona key
        const contact = state.contacts[state.activeDevice].find(c => c.id === call.personaKey) || { name: call.name };
        dispatch({ type: 'SET_CURRENT_CALL', payload: contact.name });
        dispatch({ type: 'OPEN_APP', payload: 'Phone' });
    };

    return (
        <div className="absolute inset-0 z-[100] bg-[#1a1818]/95 backdrop-blur-xl flex flex-col items-center animate-in slide-in-from-top duration-300">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-24 h-24 bg-[#3a3532] rounded-full flex items-center justify-center mb-6 overflow-hidden">
                    <User size={48} className="text-[#a49484]" />
                </div>

                <h2 className="text-3xl font-light text-[#e8d8c8] mb-2">{call.name}</h2>
                <p className="text-[#a49484] tracking-widest text-sm uppercase">Incoming Call</p>
            </div>

            <div className="w-full flex justify-around px-8 pb-20">
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleDecline}
                        className="w-16 h-16 bg-[#9c5b5b] hover:bg-[#b06a6a] transition-colors rounded-full flex items-center justify-center"
                    >
                        <PhoneOff size={28} className="text-white" />
                    </button>
                    <span className="text-[#a49484] text-sm">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleAccept}
                        className="w-16 h-16 bg-[#5b8c6b] hover:bg-[#6bae7e] transition-colors rounded-full flex items-center justify-center animate-pulse"
                    >
                        <Phone size={28} className="text-white fill-current" />
                    </button>
                    <span className="text-[#a49484] text-sm">Accept</span>
                </div>
            </div>
        </div>
    );
};

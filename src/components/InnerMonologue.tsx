import React, { useEffect, useState } from 'react';
import { useGame } from '../store/GameContext';
import { Sparkles, X } from 'lucide-react';

export const InnerMonologue: React.FC = () => {
    const { state, dispatch } = useGame();
    const [isVisible, setIsVisible] = useState(!!state.currentMonologue);

    useEffect(() => {
        if (state.currentMonologue) {
            setIsVisible(true);
        }
    }, [state.currentMonologue]);

    if (!state.currentMonologue || !isVisible) return null;

    return (
        <div
            className="absolute bottom-32 left-8 right-8 z-[100] cursor-pointer"
            onClick={() => {
                setIsVisible(false);
                dispatch({ type: 'SET_MONOLOGUE', payload: null });
            }}
        >
            <div className="bg-black/80 text-white p-6 rounded-xl text-[14px] text-center italic border border-white/5 shadow-2xl backdrop-blur-md">
                "{state.currentMonologue}"
            </div>
        </div>
    );
};

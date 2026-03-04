import React, { useEffect, useState } from 'react';
import { useGame } from '../store/GameContext';
import { Sparkles, X } from 'lucide-react';

export const InnerMonologue: React.FC = () => {
    const { state, dispatch } = useGame();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (state.currentMonologue) {
            setIsVisible(true);
        }
    }, [state.currentMonologue]);

    if (!state.currentMonologue || !isVisible) return null;

    return (
        <div
            className="absolute bottom-24 left-6 right-6 z-[100] cursor-pointer"
            onClick={() => {
                setIsVisible(false);
                dispatch({ type: 'SET_MONOLOGUE', payload: null });
            }}
        >
            <div className="bg-black/80 text-white p-4 rounded-lg text-sm text-center italic border border-white/20">
                "{state.currentMonologue}"
            </div>
        </div>
    );
};

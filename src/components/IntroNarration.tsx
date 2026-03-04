import React from 'react';
import { useGame } from '../store/GameContext';
import { useStoryStore } from '../services/story-engine/useStoryStore';

export const IntroNarration = () => {
    const { state, dispatch } = useGame();
    const { dismissNarration } = useStoryStore();

    if (!state.currentNarration) return null;

    const handleNext = () => {
        dispatch({ type: 'SET_NARRATION', payload: null });
        dismissNarration();
    };

    return (
        <div
            className="fixed inset-0 bg-black z-[1000] flex items-center justify-center p-12 text-center cursor-pointer select-none overflow-hidden"
            onClick={handleNext}
        >
            <div className="max-w-2xl space-y-10 animate-in fade-in duration-1000">
                {state.currentNarrationTitle && (
                    <h2 className="text-[#c8a86b] text-sm uppercase tracking-[0.4em] font-bold opacity-60">
                        {state.currentNarrationTitle}
                    </h2>
                )}
                <p className="text-[#e8d8c8] text-xl md:text-2xl font-serif leading-relaxed italic tracking-wide">
                    {state.currentNarration}
                </p>
                <div className="text-[#a49484] text-[10px] uppercase tracking-[0.2em] animate-pulse pt-4">
                    [ Click to continue ]
                </div>
            </div>
        </div>
    );
};

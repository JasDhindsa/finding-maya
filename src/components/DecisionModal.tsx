import React from 'react';
import { useGame } from '../store/GameContext';

export const DecisionModal = () => {
  const { state, dispatch } = useGame();

  // Example decision logic based on narrative flags
  if (state.narrativeFlags.playerViewsDeletedPhotos && state.narrativeFlags.liamAtDoor === 'unknown') {
    return (
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-[#1a1818] border border-[#3a3532] rounded-3xl p-6 w-full max-w-sm shadow-2xl">
          <h2 className="text-xl font-bold text-red-500 mb-2">CRITICAL DECISION</h2>
          <p className="text-[#e8d8c8] mb-6">
            David just texted: "Liam is at the door. He says he needs to get something from Maya's apartment. Should I let him in?"
          </p>
          <div className="space-y-3">
            <button
              onClick={() => dispatch({ type: 'SET_FLAG', payload: { key: 'liamAtDoor', value: 'let_in' } })}
              className="w-full p-4 bg-[#2a2522] hover:bg-[#3a3532] border border-[#3a3532] rounded-xl text-left transition-colors"
            >
              <div className="font-bold text-[#e8d8c8]">Tell David to let him in</div>
              <div className="text-xs text-[#a49484] mt-1">Liam might find the hidden flash drive.</div>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_FLAG', payload: { key: 'liamAtDoor', value: 'keep_out' } })}
              className="w-full p-4 bg-[#2a2522] hover:bg-[#3a3532] border border-[#3a3532] rounded-xl text-left transition-colors"
            >
              <div className="font-bold text-[#e8d8c8]">Tell David NOT to let him in</div>
              <div className="text-xs text-[#a49484] mt-1">Keep Liam away from the evidence.</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

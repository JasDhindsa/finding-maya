import React, { useState } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { PasscodeLock } from '../components/PasscodeLock';
export const NotesApp = () => {
  const { state, dispatch } = useGame();
  const { reportAction } = useStoryStore();
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);

  const notes = state.notes[state.activeDevice] || [];

  // Only available on victim phone (though we could allow for player too if data exists)
  if (state.activeDevice !== 'victim' && notes.length === 0) return <div className="p-4 text-white">No notes available.</div>;

  const handleNoteClick = (note: any) => {
    reportAction('note_opened', { note_id: note.id });
    if (note.locked && !state.unlockedApps.includes(`notes-${note.id}`)) {
      setActiveNote(note.id);
      setShowPasscode(true);
    } else {
      setActiveNote(note.id);
    }
  };

  if (activeNote) {
    const note = notes.find((n) => n.id === activeNote);
    if (!note) return null;

    if (showPasscode) {
      return (
        <div className="h-full relative">
          <div className="absolute top-4 left-4 z-10">
            <button onClick={() => { setShowPasscode(false); setActiveNote(null); }} className="text-[#a49484]">
              <ChevronLeft size={28} />
            </button>
          </div>
          <PasscodeLock
            correctPasscode={note.passwordAnswer || note.password || ''}
            hint={note.passwordHint || note.hint || ''}
            onSuccess={() => {
              dispatch({ type: 'UNLOCK_APP', payload: `notes-${note.id}` });
              reportAction('note_unlocked', { note_id: note.id });
              if (note.id === 'proof_note') {
                reportAction('flag_set', { flag: 'proof_note_unlocked', value: true });
                dispatch({ type: 'SET_FLAG', payload: { key: 'playerUnlocksProofNote', value: true } });
              }
              setShowPasscode(false);
            }}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setActiveNote(null)} className="text-[#c8a86b]">
            <ChevronLeft size={28} />
          </button>
          <div className="font-medium text-lg flex-1 text-center pr-7">Notes</div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-[#c8a86b]">{note.title}</h1>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#d8c8b8]">
            {note.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#3a3532] text-3xl font-bold text-[#c8a86b] bg-[#1a1818]">Notes</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.map((note) => {
          const isUnlocked = state.unlockedApps.includes(`notes-${note.id}`);
          return (
            <div
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="p-4 bg-[#2a2522] rounded-2xl shadow-sm border border-[#3a3532] cursor-pointer active:bg-[#3a3532] transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-lg text-[#e8d8c8] truncate pr-2">{note.title}</div>
                {note.locked && !isUnlocked && <Lock size={16} className="text-[#c8a86b] shrink-0" />}
              </div>
              <div className="text-sm text-[#a49484] truncate">
                {note.locked && !isUnlocked ? 'Password Protected' : note.content.split('\n')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { victimPhotos } from '../data/victimContent';

export const PhotosApp = () => {
  const { state, dispatch } = useGame();
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  if (state.activeDevice !== 'victim') return <div className="p-4 text-white">No photos available.</div>;

  if (activePhoto) {
    return (
      <div className="flex flex-col h-full bg-black text-white">
        <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
          <button onClick={() => setActivePhoto(null)} className="text-[#5b8c6b] flex items-center">
            <ChevronLeft size={28} />
            <span>Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <img src={activePhoto.url} alt="Photo" className="w-full h-auto max-h-full object-contain" />
        </div>
        <div className="p-4 bg-black/80 backdrop-blur-md absolute bottom-0 left-0 right-0 z-10">
          <p className="text-sm text-center">{activePhoto.description}</p>
        </div>
      </div>
    );
  }

  if (activeAlbum === 'recently_deleted') {
    // Trigger narrative flag if viewing deleted photos
    if (!state.narrativeFlags.playerViewsDeletedPhotos) {
      dispatch({ type: 'SET_FLAG', payload: { key: 'playerViewsDeletedPhotos', value: true } });
      // Add a notification from Unknown Contact
      setTimeout(() => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { id: 'unknown_photos', title: 'Unknown Contact', message: "Don't tell him you've seen the deleted photos", app: 'Signal' }
        });
      }, 2000);
    }

    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setActiveAlbum(null)} className="text-[#5b8c6b]">
            <ChevronLeft size={28} />
          </button>
          <div className="font-medium text-lg flex-1 text-center pr-7">Recently Deleted</div>
        </div>
        <div className="p-4 text-xs text-center text-[#a49484]">
          Photos and videos show the days remaining before deletion.
        </div>
        <div className="flex-1 overflow-y-auto p-1 grid grid-cols-3 gap-1">
          {victimPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => {
                setActivePhoto(photo);
                dispatch({ type: 'ADD_EVIDENCE', payload: `photo_${photo.id}` });
              }}
              className="aspect-square bg-[#2a2522] relative overflow-hidden cursor-pointer hover:opacity-80"
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover opacity-50" />
              <div className="absolute bottom-1 right-1 text-[10px] bg-black/50 px-1 rounded">22d</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#3a3532] text-2xl font-bold">Albums</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square bg-[#2a2522] rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-[#a49484]">Camera Roll</div>
          </div>
          <div className="aspect-square bg-[#2a2522] rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-[#a49484]">Favorites</div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2 border-b border-[#3a3532] pb-2">Utilities</h3>
          <div 
            className="flex items-center justify-between py-3 cursor-pointer active:bg-[#2a2522]"
            onClick={() => setActiveAlbum('recently_deleted')}
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} className="text-[#a49484]" />
              <span className="text-[#e8d8c8]">Recently Deleted</span>
            </div>
            <span className="text-[#a49484]">{victimPhotos.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

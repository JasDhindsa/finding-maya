import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, Search, Trash2, MapPin, Calendar, Clock,
  Info, X, ZoomIn, LayoutGrid, Heart, User, Play,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../store/GameContext';
import { useStoryStore } from '../services/story-engine/useStoryStore';

// Deterministic pastel color from a string
const colorFromId = (id: string) => {
  const palette = [
    ['#1a2a3a', '#4a7fa5'], ['#2a1a3a', '#7a5a9a'], ['#1a3a2a', '#4a9a7a'],
    ['#3a2a1a', '#a07040'], ['#3a1a1a', '#a05050'], ['#1a3a3a', '#4a9a9a'],
    ['#2a2a1a', '#8a8a40'], ['#1a2a2a', '#4a7a7a'],
  ];
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  return palette[Math.abs(hash) % palette.length];
};

const PhotoCard: React.FC<{ photo: any; onClick: () => void; dim?: boolean }> = ({ photo, onClick, dim }) => {
  const [bg, accent] = colorFromId(photo.id || photo.description || '');
  return (
    <motion.div
      layoutId={`photo-${photo.id}`}
      onClick={onClick}
      className={`relative aspect-square rounded-sm overflow-hidden cursor-pointer bg-[#1c1c1e] ${dim ? 'opacity-60 grayscale' : ''}`}
    >
      {photo.url ? (
        <img src={photo.url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2" style={{ background: bg }}>
          <div className="w-8 h-8 rounded-full mb-1.5 flex items-center justify-center" style={{ background: accent + '44' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: accent }} />
          </div>
          <p className="text-[8px] leading-tight text-center line-clamp-3" style={{ color: accent + 'cc' }}>
            {photo.description}
          </p>
        </div>
      )}
      {dim && (
        <div className="absolute top-1 right-1">
          <Trash2 size={10} className="text-red-500 fill-red-500" />
        </div>
      )}
    </motion.div>
  );
};

const PhotoDetail = ({ photo, onBack, isDeleted }: { photo: any; onBack: () => void; isDeleted?: boolean }) => {
  const [bg, accent] = colorFromId(photo.id || photo.description || '');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-xl border-b border-white/10 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-[#0a84ff] font-medium transition-colors active:opacity-50">
          <ChevronLeft size={24} />
          <span className="text-base">Back</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">{photo.date || 'Photo'}</span>
          <span className="text-[10px] text-white/30">{photo.location || ''}</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Photo / Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Visual */}
        <motion.div
          layoutId={`photo-${photo.id}`}
          className="w-full aspect-4/3 relative flex items-center justify-center bg-[#1c1c1e]"
        >
          {photo.url ? (
            <img src={photo.url} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center" style={{ background: bg }}>
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ background: accent + '33' }}>
                <ZoomIn size={32} style={{ color: accent }} />
              </div>
              <p className="text-base leading-relaxed font-medium" style={{ color: accent }}>
                {photo.description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Bar */}
        <div className="flex justify-around py-4 border-b border-white/5">
          <button className="flex flex-col items-center gap-1 text-[#0a84ff] opacity-40"><Heart size={20} /><span className="text-[9px]">Favorite</span></button>
          <button className="flex flex-col items-center gap-1 text-[#0a84ff]"><Info size={20} /><span className="text-[9px]">Details</span></button>
          <button className="flex flex-col items-center gap-1 text-red-500 opacity-40"><Trash2 size={20} /><span className="text-[9px]">Delete</span></button>
        </div>

        {/* Metadata section */}
        <div className="p-4 space-y-6">
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Metadata</h3>
            <div className="bg-[#1c1c1e] rounded-xl overflow-hidden divide-y divide-white/5">
              {photo.date && (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3"><Calendar size={16} className="text-[#0a84ff]" /><span className="text-sm">Date</span></div>
                  <span className="text-sm text-white/40">{photo.date}</span>
                </div>
              )}
              {photo.location && (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3"><MapPin size={16} className="text-[#0a84ff]" /><span className="text-sm">Location</span></div>
                  <span className="text-sm text-white/40">{photo.location}</span>
                </div>
              )}
              {photo.fileSize && (
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3"><Info size={16} className="text-white/20" /><span className="text-sm">Size</span></div>
                  <span className="text-sm text-white/20">{photo.fileSize}</span>
                </div>
              )}
            </div>
          </section>

          {/* Screen Contents */}
          {(photo.content || photo.bodyVisible || photo.visibleText) && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Digital Extraction</h3>
              <div className="bg-[#1c1c1e] border border-white/10 rounded-xl p-4">
                <pre className="text-xs leading-relaxed text-[#5b8c6b] whitespace-pre-wrap font-mono">
                  {photo.content || photo.bodyVisible || photo.visibleText}
                </pre>
              </div>
            </section>
          )}

          {/* Evidence Note */}
          {photo.significance && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-[#5b8c6b] uppercase tracking-widest">Observation</h3>
              <div className="bg-[#5b8c6b]/10 border border-[#5b8c6b]/30 rounded-xl p-4">
                <p className="text-sm leading-relaxed text-[#a0c8a8] italic">"{photo.significance}"</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PhotosApp = () => {
  const { state, dispatch } = useGame();
  const { reportAction } = useStoryStore();
  const [activeTab, setActiveTab] = useState<'library' | 'foryou' | 'albums' | 'search'>('library');
  const [activeAlbum, setActiveAlbum] = useState<'camera_roll' | 'recently_deleted' | null>(null);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const photosData = state.photos[state.activeDevice];
  const currentPhotos: any[] = Array.isArray(photosData) ? photosData : (photosData?.cameraRollHighlights || []);
  const deletedPhotos: any[] = !Array.isArray(photosData) ? (photosData?.recentlyDeletedPhotos?.photos || []) : [];

  // Sort photos into groups (simulated)
  const todayPhotos = currentPhotos.slice(0, 3);
  const olderPhotos = currentPhotos.slice(3);

  const openPhoto = (photo: any, isDeleted = false) => {
    setActivePhoto({ ...photo, _isDeleted: isDeleted });
    if (!isDeleted) {
      reportAction('photo_viewed', { photo_id: photo.id });
      if (photo.id) dispatch({ type: 'ADD_EVIDENCE', payload: `photo_${photo.id}` });
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      reportAction('photos_searched', { query: searchValue.trim() });
    }
  };

  if (state.activeDevice !== 'victim') {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-black text-[#a49484]">
        <ImageIcon size={48} className="mb-4 opacity-20" />
        <p className="text-sm">No Photos Found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden relative">

      {/* Search Overlay (if active) */}
      {activeTab === 'search' && (
        <div className="flex-1 flex flex-col p-4">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          <div className="bg-[#1c1c1e] flex items-center gap-2 px-3 py-2 rounded-lg mb-6">
            <Search size={18} className="text-white/30" />
            <input
              autoFocus
              type="text"
              placeholder="Photos, People, Places..."
              className="bg-transparent border-none outline-none text-base w-full"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Suggested</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Boston', 'James', 'Meridian', 'Marathon'].map(s => (
                <button key={s} onClick={() => { setSearchValue(s); reportAction('photos_searched', { query: s }) }} className="bg-[#1c1c1e] py-3 rounded-xl text-sm font-medium border border-white/5 active:bg-[#2c2c2e]">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Library View */}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-5 pt-8 pb-4">
            <h1 className="text-3xl font-bold">Library</h1>
            <p className="text-sm text-white/30 font-medium">Recently Captured</p>
          </div>

          {/* Date Group 1 */}
          <div className="mb-6">
            <div className="px-5 py-2 sticky top-0 bg-black/80 backdrop-blur-md z-10 flex justify-between items-baseline border-b border-white/5">
              <h2 className="text-lg font-bold">Today</h2>
              <span className="text-xs text-[#0a84ff] font-medium">Select</span>
            </div>
            <div className="grid grid-cols-3 gap-[2px] pt-1 px-1">
              {todayPhotos.map(p => <PhotoCard key={p.id} photo={p} onClick={() => openPhoto(p)} />)}
            </div>
          </div>

          {/* Date Group 2 */}
          <div className="mb-6">
            <div className="px-5 py-2 sticky top-0 bg-black/80 backdrop-blur-md z-10 flex justify-between items-baseline border-b border-white/5">
              <h2 className="text-lg font-bold">November 16</h2>
              <span className="text-xs text-[#0a84ff] font-medium">Select</span>
            </div>
            <div className="grid grid-cols-3 gap-[2px] pt-1 px-1">
              {olderPhotos.map(p => <PhotoCard key={p.id} photo={p} onClick={() => openPhoto(p)} />)}
            </div>
          </div>
        </div>
      )}

      {/* For You View */}
      {activeTab === 'foryou' && (
        <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-8">
          <h1 className="text-3xl font-bold">For You</h1>

          {/* Memory Card */}
          <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-2xl group cursor-pointer active:scale-95 transition-transform"
            onClick={() => openPhoto(currentPhotos.find(p => p.id === 'boston_marathon_1') || currentPhotos[0])}
          >
            <img src="/assets/images/memory_marathon.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Memory" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30 p-6 flex flex-col justify-end">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">MEMORIES</p>
              <h2 className="text-3xl font-bold leading-tight">6 Years Ago Today</h2>
              <p className="text-sm text-white/70 mt-1">Boston, MA • April 2018</p>
            </div>
          </div>

          {/* Shared Activity */}
          <div className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-[#0a84ff]/20 flex items-center justify-center">
              <User size={24} className="text-[#0a84ff]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Priya shared 12 photos</h3>
              <p className="text-xs text-white/40">Dinner at Flour + Water</p>
            </div>
            <ChevronLeft size={16} className="rotate-180 text-white/20" />
          </div>
        </div>
      )}

      {/* Albums View */}
      {activeTab === 'albums' && (
        <div className="flex-1 overflow-y-auto pb-20">
          {activeAlbum ? (
            <div className="relative h-full flex flex-col bg-black">
              <div className="flex items-center gap-2 px-4 py-3 bg-black/90 backdrop-blur-md border-b border-white/10 shrink-0 sticky top-0 z-20">
                <button onClick={() => setActiveAlbum(null)} className="text-[#0a84ff]"><ChevronLeft size={28} /></button>
                <h2 className="flex-1 text-center font-bold text-base pr-8">{activeAlbum === 'camera_roll' ? 'Camera Roll' : 'Recently Deleted'}</h2>
              </div>
              <div className="flex-1 p-1">
                <div className="grid grid-cols-3 gap-[2px]">
                  {(activeAlbum === 'camera_roll' ? currentPhotos : deletedPhotos).map(p => (
                    <PhotoCard key={p.id} photo={p} onClick={() => openPhoto(p, activeAlbum === 'recently_deleted')} dim={activeAlbum === 'recently_deleted'} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Albums</h1>
                <button className="text-[#0a84ff] font-medium">See All</button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div onClick={() => setActiveAlbum('camera_roll')} className="space-y-2 cursor-pointer active:opacity-50 transition-opacity">
                  <div className="aspect-square bg-[#1c1c1e] rounded-xl overflow-hidden border border-white/5 shadow-lg relative">
                    {currentPhotos[0]?.url ? <img src={currentPhotos[0].url} className="w-full h-full object-cover" /> : <ImageIcon className="absolute inset-0 m-auto text-white/10" size={40} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px]">Recents</h3>
                    <p className="text-xs text-white/30">{currentPhotos.length}</p>
                  </div>
                </div>
                <div className="space-y-2 opacity-40">
                  <div className="aspect-square bg-[#1c1c1e] rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                    <Heart size={32} className="text-pink-500 fill-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px]">Favorites</h3>
                    <p className="text-xs text-white/30">0</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h2 className="text-xl font-bold">Utilities</h2>
                <div className="bg-[#1c1c1e] divide-y divide-white/10 rounded-xl overflow-hidden">
                  <div onClick={() => setActiveAlbum('recently_deleted')} className="flex items-center justify-between p-3.5 cursor-pointer active:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Trash2 size={20} className="text-[#0a84ff]" />
                      <span className="font-medium text-[#0a84ff]">Recently Deleted</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                      <span className="text-sm">{deletedPhotos.length}</span>
                      <ChevronLeft size={16} className="rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-2 z-40">
        <button onClick={() => { setActiveTab('library'); setActiveAlbum(null) }} className={`flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-[#0a84ff]' : 'text-white/40'}`}>
          <LayoutGrid size={24} />
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button onClick={() => { setActiveTab('foryou'); setActiveAlbum(null) }} className={`flex flex-col items-center gap-1 ${activeTab === 'foryou' ? 'text-[#0a84ff]' : 'text-white/40'}`}>
          <Play size={24} />
          <span className="text-[10px] font-medium">For You</span>
        </button>
        <button onClick={() => { setActiveTab('albums'); setActiveAlbum(null) }} className={`flex flex-col items-center gap-1 ${activeTab === 'albums' ? 'text-[#0a84ff]' : 'text-white/40'}`}>
          <ImageIcon size={24} />
          <span className="text-[10px] font-medium">Albums</span>
        </button>
        <button onClick={() => { setActiveTab('search'); setActiveAlbum(null) }} className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-[#0a84ff]' : 'text-white/40'}`}>
          <Search size={24} />
          <span className="text-[10px] font-medium">Search</span>
        </button>
      </div>

      {/* Photo Detail Overlay */}
      <AnimatePresence>
        {activePhoto && (
          <PhotoDetail
            photo={activePhoto}
            onBack={() => setActivePhoto(null)}
            isDeleted={activePhoto._isDeleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

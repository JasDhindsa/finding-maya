import React, { useState } from 'react';
import { ChevronLeft, Folder, Menu, Search } from 'lucide-react';
import { useCurrentStory } from '../services/story-engine/useCurrentStory';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';

type ViewState =
  | { type: 'folders' }
  | { type: 'folder'; folder: any }
  | { type: 'file'; name: string; body: string };

export const DriveApp = () => {
  const { state } = useGame();
  const story = useCurrentStory();
  const { reportAction } = useStoryStore();
  const [view, setView] = useState<ViewState>({ type: 'folders' });
  const drive = story?.victimGoogleDrive;
  const backupFolder = drive?.folders?.find((folder: any) => String(folder.name || '').includes('Personal Backup'));

  if (state.activeDevice !== 'victim' || !drive) {
    return <div className="p-4 text-white">No Drive data available.</div>;
  }

  const openSmokingGun = () => {
    const smokingGun = drive.smokingGunEmail;
    if (!smokingGun) return;

    reportAction('drive_file_opened', { file_id: smokingGun.filename });
    setView({
      type: 'file',
      name: smokingGun.filename,
      body: `${smokingGun.email1.subject}\n\n${smokingGun.email1.body}\n\n---\n\n${smokingGun.email2.subject}\n\n${smokingGun.email2.body}`,
    });
  };

  const renderContent = () => {
    if (view.type === 'file') {
      return (
        <div className="flex-1 overflow-y-auto p-4">
          <h1 className="text-xl font-bold mb-4">{view.name}</h1>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[#d8c8b8] font-mono">{view.body}</pre>
        </div>
      );
    }

    if (view.type === 'folder') {
      const folder = view.folder;
      return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(folder.subfolders || []).map((subfolder: any, index: number) => (
            <div key={index} className="rounded-2xl border border-[#3a3532] bg-[#2a2522] p-4">
              <div className="font-bold mb-3 flex items-center gap-2"><Folder size={16} />{subfolder.name}</div>
              <div className="space-y-2">
                {(subfolder.files || []).map((file: string, fileIndex: number) => (
                  <button
                    key={fileIndex}
                    className="w-full text-left rounded-xl border border-[#3a3532] bg-[#1a1818] px-3 py-2 text-sm text-[#d8c8b8]"
                    onClick={() => {
                      if (file === 'James_to_Liam_Sept_14_SMOKING_GUN.pdf') {
                        openSmokingGun();
                        return;
                      }

                      reportAction('drive_file_opened', { file_id: file });
                      setView({
                        type: 'file',
                        name: file,
                        body: 'This file exists in Maya\'s backup, but only the smoking gun email is currently rendered in detail.',
                      });
                    }}
                  >
                    {file}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(drive.folders || []).map((folder: any, index: number) => (
          <button
            key={index}
            className="w-full rounded-2xl border border-[#3a3532] bg-[#2a2522] p-4 text-left"
            onClick={() => {
              if (String(folder.name || '').includes('Personal Backup')) {
                setView({ type: 'folder', folder });
              }
            }}
          >
            <div className="font-bold flex items-center gap-2"><Folder size={18} />{folder.name}</div>
            {folder.note && <div className="text-sm text-[#a49484] mt-2">{folder.note}</div>}
            {folder.contents && <div className="text-sm text-[#a49484] mt-2">{folder.contents}</div>}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-4 py-3 bg-[#1a1818] border-b border-[#3a3532] flex items-center gap-3">
        {view.type !== 'folders' && (
          <button onClick={() => setView(view.type === 'file' && backupFolder ? { type: 'folder', folder: backupFolder } : { type: 'folders' })}>
            <ChevronLeft size={22} className="text-[#5b8c6b]" />
          </button>
        )}
        <div className="flex items-center gap-3 bg-[#2a2522] rounded-full px-4 py-3 border border-[#3a3532] flex-1">
          <Menu size={20} className="text-[#e8d8c8]" />
          <span className="flex-1 text-[#a49484] text-sm">Search in Drive</span>
          <Search size={16} className="text-[#a49484]" />
        </div>
      </div>
      {renderContent()}
      {view.type === 'folders' && (
        <div className="p-4 border-t border-[#3a3532] bg-[#1a1818] text-xs text-[#a49484]">
          Opening the backup folder exposes the evidence tree Maya shared before she died.
        </div>
      )}
    </div>
  );
};

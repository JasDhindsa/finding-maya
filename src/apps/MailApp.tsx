import React, { useState } from 'react';
import { ChevronLeft, Mail, Send, FileText, Inbox, ChevronRight } from 'lucide-react';
import { useGame } from '../store/GameContext';

export const MailApp = () => {
  const { state } = useGame();
  const [view, setView] = useState<'folders' | 'list' | 'email'>('folders');
  const [selectedFolder, setSelectedFolder] = useState<string>('Inbox');
  const [activeEmail, setActiveEmail] = useState<any | null>(null);

  const emails = state.emails[state.activeDevice] || [];

  const folders = [
    { id: 'Inbox', icon: <Inbox size={20} />, color: 'text-blue-400' },
    { id: 'Sent', icon: <Send size={20} />, color: 'text-green-400' },
    { id: 'Drafts', icon: <FileText size={20} />, color: 'text-orange-400' },
  ];

  const getFolderEmails = (folderName: string) => {
    return emails.filter((e: any) => (e.folder || 'Inbox') === folderName);
  };

  const filteredEmails = getFolderEmails(selectedFolder);

  if (view === 'email' && activeEmail) {
    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setView('list')} className="text-[#5b8c6b]">
            <ChevronLeft size={28} />
          </button>
          <span className="font-medium truncate">{selectedFolder}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h1 className="text-2xl font-bold mb-4">{activeEmail.subject}</h1>
          <div className="flex items-center gap-3 mb-6 border-b border-[#3a3532] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#3a3532] flex items-center justify-center text-[#a49484] font-bold">
              {activeEmail.from ? activeEmail.from[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="font-bold text-[#e8d8c8]">{activeEmail.from || 'Maya Chen'}</div>
              <div className="text-xs text-[#a49484]">To: {activeEmail.to || 'Maya Chen'}</div>
            </div>
            <div className="ml-auto text-xs text-[#a49484] tracking-tighter">{activeEmail.time}</div>
          </div>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#d8c8b8] font-serif">
            {activeEmail.body}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
        <div className="px-4 py-3 border-b border-[#3a3532] bg-[#2a2522] flex items-center gap-3">
          <button onClick={() => setView('folders')} className="text-[#5b8c6b]">
            <ChevronLeft size={24} />
          </button>
          <span className="font-bold text-xl">{selectedFolder}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#a49484] opacity-50">
              <Mail size={48} className="mb-4" />
              <p>No messages in {selectedFolder}</p>
            </div>
          ) : (
            filteredEmails.map((email: any, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveEmail(email);
                  setView('email');
                }}
                className="p-4 border-b border-[#3a3532]/50 cursor-pointer active:bg-[#2a2522] transition-colors relative"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-bold text-[#e8d8c8] truncate pr-2">
                    {selectedFolder === 'Sent' || selectedFolder === 'Drafts' ? `To: ${email.to}` : (email.from || 'Unknown')}
                  </div>
                  <div className="text-[10px] text-[#a49484] flex-shrink-0">{email.time.split(',')[0]}</div>
                </div>
                <div className="text-sm font-medium text-[#d8c8b8] truncate mb-1">{email.subject}</div>
                <div className="text-xs text-[#a49484] truncate opacity-70">{email.body.replace(/\n/g, ' ')}</div>

                {selectedFolder === 'Inbox' && idx < 2 && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-[#5b8c6b] rounded-full shadow-[0_0_8px_rgba(91,140,107,0.8)]"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-8 border-b border-[#3a3532] bg-[#2a2522]">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Mail className="text-[#5b8c6b] w-8 h-8" />
          Mailboxes
        </h1>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => {
              setSelectedFolder(folder.id);
              setView('list');
            }}
            className="flex items-center justify-between p-5 bg-[#2a2522] border border-[#3a3532] rounded-2xl cursor-pointer active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-[#1a1818] ${folder.color} shadow-inner`}>
                {folder.icon}
              </div>
              <div>
                <div className="font-bold text-lg">{folder.id}</div>
                <div className="text-xs text-[#a49484]">{getFolderEmails(folder.id).length} messages</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-[#a49484] group-hover:text-[#5b8c6b] transition-colors" />
          </div>
        ))}

        <div className="mt-8 pt-6 border-t border-[#3a3532]">
          <h3 className="text-xs font-bold text-[#a49484] uppercase tracking-widest mb-4">Accounts</h3>
          <div className="flex items-center gap-3 p-4 bg-[#1a1818] rounded-xl border border-[#3a3532]">
            <div className="w-10 h-10 rounded-full bg-[#5b8c6b] flex items-center justify-center font-bold text-white">M</div>
            <div>
              <div className="font-bold">maya.chen@axiomtech.com</div>
              <div className="text-xs text-[#5b8c6b]">Primary Account</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

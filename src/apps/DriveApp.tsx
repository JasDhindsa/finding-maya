import React from 'react';
import { Search, Menu, Folder, FileText, Image as ImageIcon, FileSpreadsheet, Plus, Home, Star, Users, File } from 'lucide-react';

export const DriveApp = () => (
  <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
    <div className="px-4 py-3 bg-[#1a1818]">
      <div className="flex items-center gap-3 bg-[#2a2522] rounded-full px-4 py-3 border border-[#3a3532]">
        <Menu size={20} className="text-[#e8d8c8]" />
        <span className="flex-1 text-[#a49484] text-sm">Search in Drive</span>
        <div className="w-6 h-6 rounded-full bg-[#5b8c6b] flex items-center justify-center text-xs font-bold text-white">M</div>
      </div>
    </div>

    <div className="flex gap-6 px-4 py-2 border-b border-[#3a3532] text-sm font-bold">
      <span className="text-[#5b8c6b] border-b-2 border-[#5b8c6b] pb-2">Suggested</span>
      <span className="text-[#a49484] pb-2">Notifications</span>
    </div>

    <div className="flex-1 overflow-y-auto p-4 relative">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#2a2522] p-4 rounded-xl border border-[#3a3532] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#a49484]">
            <Folder size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-sm">Meridian Project</span>
        </div>
        <div className="bg-[#2a2522] p-4 rounded-xl border border-[#3a3532] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#a49484]">
            <Folder size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-sm">Personal</span>
        </div>
      </div>

      <h3 className="text-sm font-bold text-[#e8d8c8] mb-3">Recent files</h3>
      <div className="space-y-3">
        {[
          { name: 'Meridian_Specs.pdf', icon: FileText, color: '#9c5b5b', date: 'Nov 15' },
          { name: 'Q3_Report.docx', icon: FileText, color: '#3b6b9c', date: 'Nov 12' },
          { name: 'Project_Timeline.xlsx', icon: FileSpreadsheet, color: '#5b8c6b', date: 'Nov 10' },
          { name: 'IMG_8932.jpg', icon: ImageIcon, color: '#9c8b7b', date: 'Nov 8' }
        ].map((file) => (
          <div key={file.name} className="flex items-center gap-4 p-3 bg-[#2a2522] rounded-xl border border-[#3a3532]">
            <file.icon size={24} color={file.color} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-[#e8d8c8] truncate">{file.name}</div>
              <div className="text-xs text-[#a49484]">You modified • {file.date}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6">
        <button className="w-14 h-14 bg-[#2a2522] rounded-2xl border-2 border-[#3a3532] flex items-center justify-center text-[#5b8c6b] shadow-lg active:scale-95 transition-transform">
          <Plus size={32} />
        </button>
      </div>
    </div>

    <div className="flex-none flex justify-between items-center px-6 py-3 bg-[#1a1818] border-t border-[#3a3532]">
      <div className="flex flex-col items-center gap-1 text-[#5b8c6b]">
        <Home size={24} fill="currentColor" />
        <span className="text-[10px] font-bold">Home</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#a49484]">
        <Star size={24} />
        <span className="text-[10px] font-bold">Starred</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#a49484]">
        <Users size={24} />
        <span className="text-[10px] font-bold">Shared</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[#a49484]">
        <File size={24} />
        <span className="text-[10px] font-bold">Files</span>
      </div>
    </div>
  </div>
);

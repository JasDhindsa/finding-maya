import React, { useState } from 'react';
import { Search, MessageSquare, Home, Users, PlusSquare, Bell, Briefcase, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Send } from 'lucide-react';

export const LinkedInApp = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <div className="flex-1 overflow-y-auto bg-[#121212]">
            {/* Create Post */}
            <div className="bg-[#1a1818] p-4 mb-2 border-b border-[#3a3532]">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[#2a2522] flex items-center justify-center border border-[#3a3532]">
                  <span className="font-bold text-[#a49484]">MC</span>
                </div>
                <div className="flex-1 bg-[#2a2522] rounded-full px-4 py-2 text-sm text-[#a49484] border border-[#3a3532]">
                  Start a post
                </div>
              </div>
            </div>

            {/* Feed Posts */}
            {[
              {
                name: 'Axiom Technologies',
                title: 'Technology Company',
                time: '2h',
                content: 'We are thrilled to announce our latest breakthrough in AI-driven systems architecture. Join us for a live webinar next week to learn more!',
                likes: 245,
                comments: 42,
                initials: 'AT',
                color: '#3b6b9c'
              },
              {
                name: 'Sarah Jenkins',
                title: 'Product Manager at TechCorp',
                time: '5h',
                content: 'Just published a new article on the importance of user-centric design in enterprise software. Check it out!',
                likes: 128,
                comments: 15,
                initials: 'SJ',
                color: '#5b8c6b'
              },
              {
                name: 'David Chen',
                title: 'Senior Data Scientist',
                time: '1d',
                content: 'Excited to share that I will be speaking at the upcoming Data Science Summit in San Francisco! Looking forward to connecting with fellow professionals.',
                likes: 512,
                comments: 89,
                initials: 'DC',
                color: '#9c5b5b'
              }
            ].map((post, i) => (
              <div key={i} className="bg-[#1a1818] mb-2 border-y border-[#3a3532]">
                <div className="p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: post.color }}>
                      {post.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#e8d8c8] text-sm leading-tight">{post.name}</h3>
                      <p className="text-xs text-[#a49484]">{post.title}</p>
                      <p className="text-xs text-[#a49484]">{post.time} • 🌐</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#d8c8b8] leading-relaxed mb-4">
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-[#a49484] border-b border-[#3a3532] pb-2 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-[#3b6b9c] flex items-center justify-center">
                        <ThumbsUp size={10} className="text-white" fill="currentColor" />
                      </div>
                      <span>{post.likes}</span>
                    </div>
                    <span>{post.comments} comments</span>
                  </div>
                  <div className="flex justify-between px-2">
                    <button className="flex items-center gap-2 text-[#a49484] hover:text-[#e8d8c8] py-2">
                      <ThumbsUp size={20} />
                      <span className="text-sm font-medium">Like</span>
                    </button>
                    <button className="flex items-center gap-2 text-[#a49484] hover:text-[#e8d8c8] py-2">
                      <MessageCircle size={20} />
                      <span className="text-sm font-medium">Comment</span>
                    </button>
                    <button className="flex items-center gap-2 text-[#a49484] hover:text-[#e8d8c8] py-2">
                      <Share2 size={20} />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                    <button className="flex items-center gap-2 text-[#a49484] hover:text-[#e8d8c8] py-2">
                      <Send size={20} />
                      <span className="text-sm font-medium">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'Profile':
      default:
        return (
          <div className="flex-1 overflow-y-auto">
            <div className="relative">
              <div className="h-24 bg-[#3b6b9c]"></div>
              <div className="absolute top-12 left-4 w-24 h-24 rounded-full bg-[#2a2522] border-4 border-[#1a1818] flex items-center justify-center">
                <span className="text-3xl font-bold text-[#a49484]">MC</span>
              </div>
            </div>
            
            <div className="pt-14 px-4 pb-4 border-b border-[#3a3532] bg-[#1a1818]">
              <h1 className="text-2xl font-bold text-[#e8d8c8]">Maya Chen</h1>
              <p className="text-sm text-[#e8d8c8] mt-1">Lead Engineer at Axiom Technologies | AI & Systems Architecture</p>
              <p className="text-xs text-[#a49484] mt-2">San Francisco, California • 500+ connections</p>
              
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-[#3b6b9c] text-white rounded-full py-1.5 font-bold text-sm">Connect</button>
                <button className="flex-1 bg-[#1a1818] border border-[#e8d8c8] text-[#e8d8c8] rounded-full py-1.5 font-bold text-sm">Message</button>
                <button className="w-9 h-9 border border-[#a49484] rounded-full flex items-center justify-center text-[#a49484]">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-[#3a3532] bg-[#1a1818] mt-2">
              <h2 className="font-bold text-lg mb-2">About</h2>
              <p className="text-sm text-[#d8c8b8] leading-relaxed line-clamp-3">
                Passionate software engineer with over 8 years of experience building scalable backend systems and AI-driven applications. Currently leading the engineering team at Axiom Technologies...
              </p>
            </div>

            <div className="p-4 bg-[#1a1818] mt-2">
              <h2 className="font-bold text-lg mb-4">Experience</h2>
              <div className="flex gap-3 mb-6">
                <div className="w-12 h-12 bg-[#2a2522] rounded flex items-center justify-center border border-[#3a3532] flex-shrink-0">
                  <span className="font-bold text-[#3b6b9c]">A</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#e8d8c8]">Lead Engineer</h3>
                  <p className="text-sm text-[#e8d8c8]">Axiom Technologies • Full-time</p>
                  <p className="text-xs text-[#a49484]">Jan 2023 - Present • 10 mos</p>
                  <p className="text-xs text-[#a49484]">San Francisco, CA</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-[#2a2522] rounded flex items-center justify-center border border-[#3a3532] flex-shrink-0">
                  <span className="font-bold text-[#5b8c6b]">T</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#e8d8c8]">Senior Software Engineer</h3>
                  <p className="text-sm text-[#e8d8c8]">TechCorp • Full-time</p>
                  <p className="text-xs text-[#a49484]">Mar 2020 - Dec 2022 • 2 yrs 10 mos</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1818] text-[#e8d8c8]">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#2a2522] border-b border-[#3a3532]">
        <div 
          className="w-8 h-8 rounded-full bg-[#3b6b9c] flex items-center justify-center text-white font-bold text-xs cursor-pointer"
          onClick={() => setActiveTab('Profile')}
        >
          in
        </div>
        <div className="flex-1 bg-[#1a1818] rounded-md px-3 py-1.5 flex items-center gap-2 border border-[#3a3532]">
          <Search size={16} className="text-[#a49484]" />
          <span className="text-sm text-[#a49484]">Search</span>
        </div>
        <MessageSquare size={24} className="text-[#a49484]" />
      </div>

      {renderContent()}

      <div className="flex-none flex justify-between items-center px-6 py-3 bg-[#1a1818] border-t border-[#3a3532]">
        {[
          { icon: Home, label: 'Home' },
          { icon: Users, label: 'Network' },
          { icon: PlusSquare, label: 'Post' },
          { icon: Bell, label: 'Notifications' },
          { icon: Briefcase, label: 'Jobs' }
        ].map((tab) => (
          <div 
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === tab.label ? 'text-[#e8d8c8]' : 'text-[#a49484]'}`}
          >
            <tab.icon size={24} fill={activeTab === tab.label ? 'currentColor' : 'none'} />
            <span className="text-[10px]">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Phone,
  MessageSquare,
  Globe,
  Camera,
  Image as ImageIcon,
  Music,
  Settings,
  Search,
  Mic,
  Smile,
  Mail,
  MapPin,
  FileText,
  Shield,
  Briefcase,
  Car,
  Cloud,
  Hash,
  DollarSign
} from 'lucide-react';
import { GameProvider, useGame } from './store/GameContext';
import { useStoryStore } from './services/story-engine/useStoryStore';
import { PhoneShell } from './components/PhoneShell';
import { AppIcon } from './components/AppIcon';
import { NotificationBanner } from './components/NotificationBanner';
import { DecisionModal } from './components/DecisionModal';
import { IncomingCallOverlay } from './components/IncomingCallOverlay';
import { InnerMonologue } from './components/InnerMonologue';
import { IntroNarration } from './components/IntroNarration';

import { MessagesApp } from './apps/MessagesApp';
import { NotesApp } from './apps/NotesApp';
import { PhotosApp } from './apps/PhotosApp';
import { SlackApp } from './apps/SlackApp';
import { SignalApp } from './apps/SignalApp';
import { MailApp } from './apps/MailApp';
import { MapsApp } from './apps/MapsApp';
import { PhoneApp } from './apps/PhoneApp';
import { BrowserApp } from './apps/BrowserApp';
import { CameraApp } from './apps/CameraApp';
import { GalleryApp } from './apps/GalleryApp';
import { MusicApp } from './apps/MusicApp';
import { SettingsApp } from './apps/SettingsApp';
import { LinkedInApp } from './apps/LinkedInApp';
import { UberApp } from './apps/UberApp';
import { DriveApp } from './apps/DriveApp';
import { VenmoApp } from './apps/VenmoApp';
import { SmileApp } from './apps/SmileApp';

const HomeScreen = () => {
  const { state, dispatch } = useGame();
  const isVictim = state.activeDevice === 'victim';

  const handleAppClick = (app: string) => {
    dispatch({ type: 'OPEN_APP', payload: app });
    dispatch({ type: 'CLEAR_APP_NOTIFICATIONS', payload: { device: state.activeDevice, app } });
  };

  const getBadgeCount = (app: string) => {
    return state.notifications.filter(n => n.device === state.activeDevice && n.app === app).length;
  };

  return (
    <div className="flex-1 flex flex-col relative z-10">
      {/* Search Bar */}
      {!isVictim && (
        <div className="mx-6 mt-6 relative">
          <div className="flex items-center justify-between px-5 py-3 bg-[#2a2522] rounded-full border-[3px] border-[#1a1a1a] shadow-[inset_0_3px_6px_rgba(0,0,0,0.8),0_4px_6px_rgba(0,0,0,0.4)] relative overflow-hidden cursor-text">
            <div className="absolute inset-0 rounded-full border-[2px] border-[#8a7a6a]/60 pointer-events-none m-[1px]"></div>
            <Search size={22} className="text-[#a49484] z-10" strokeWidth={2.5} />
            <Mic size={22} className="text-[#a49484] z-10 cursor-pointer hover:text-[#e8d8c8]" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* App Grid */}
      <div className={`grid grid-cols-4 gap-y-8 gap-x-2 px-4 ${isVictim ? 'mt-8' : 'mt-12'}`}>
        <AppIcon icon={MessageSquare} label="Messages" color="#6b7b9c" onClick={() => handleAppClick('Messages')} badgeCount={getBadgeCount('Messages')} />
        <AppIcon icon={Phone} label="Phone" color="#9c5b5b" onClick={() => handleAppClick('Phone')} />

        {isVictim ? (
          <>
            <AppIcon icon={Mail} label="Mail" color="#5b8c6b" onClick={() => handleAppClick('Mail')} badgeCount={getBadgeCount('Mail')} />
            <AppIcon icon={Globe} label="Safari" color="#5b8c6b" onClick={() => handleAppClick('Browser')} />
            <AppIcon icon={ImageIcon} label="Photos" color="#9c8b7b" onClick={() => handleAppClick('Photos')} />
            <AppIcon icon={MapPin} label="Maps" color="#c8a86b" onClick={() => handleAppClick('Maps')} />
            <AppIcon icon={FileText} label="Notes" color="#e8d8c8" onClick={() => handleAppClick('Notes')} />
            <AppIcon icon={Shield} label="Signal" color="#4a7ab0" onClick={() => handleAppClick('Signal')} badgeCount={getBadgeCount('Signal')} />
            <AppIcon icon={Hash} label="Slack" color="#7b5b7b" onClick={() => handleAppClick('Slack')} badgeCount={getBadgeCount('Slack')} />
            <AppIcon icon={Briefcase} label="LinkedIn" color="#3b6b9c" onClick={() => handleAppClick('LinkedIn')} />
            <AppIcon icon={Car} label="Uber" color="#1a1a1a" onClick={() => handleAppClick('Uber')} />
            <AppIcon icon={Cloud} label="Drive" color="#5b8c6b" onClick={() => handleAppClick('Drive')} />
            <AppIcon icon={DollarSign} label="Venmo" color="#3b6b9c" onClick={() => handleAppClick('Venmo')} />
          </>
        ) : (
          <>
            <AppIcon icon={Globe} label="Browser" color="#5b8c6b" onClick={() => handleAppClick('Browser')} />
            <AppIcon icon={Camera} label="Camera" color="#9c5b5b" onClick={() => handleAppClick('Camera')} />
            <AppIcon icon={ImageIcon} label="Gallery" color="#9c8b7b" onClick={() => handleAppClick('Gallery')} />
            <AppIcon icon={Music} label="Music" color="#c8a86b" onClick={() => handleAppClick('Music')} />
            <AppIcon icon={Settings} label="Settings" color="#9c8b7b" onClick={() => handleAppClick('Settings')} />
          </>
        )}
      </div>

      <div className="flex-grow"></div>

      {/* Dock */}
      <div className="flex justify-center items-center gap-8 mb-8">
        <AppIcon icon={Phone} color="#9c5b5b" onClick={() => handleAppClick('Phone')} />
        <AppIcon icon={Smile} color="#9c8b7b" isCircle onClick={() => handleAppClick('Smile')} />
        <AppIcon icon={Camera} color="#9c5b5b" onClick={() => handleAppClick('Camera')} />
      </div>
    </div>
  );
};

const GameApp = () => {
  const { state } = useGame();
  const storyStore = useStoryStore();

  const renderApp = () => {
    switch (state.activeApp) {
      case 'Messages': return <MessagesApp />;
      case 'Notes': return <NotesApp />;
      case 'Photos': return <PhotosApp />;
      case 'Slack': return <SlackApp />;
      case 'Signal': return <SignalApp />;
      case 'Mail': return <MailApp />;
      case 'Maps': return <MapsApp />;
      case 'Phone': return <PhoneApp />;
      case 'Browser': return <BrowserApp />;
      case 'Camera': return <CameraApp />;
      case 'Gallery': return <GalleryApp />;
      case 'Music': return <MusicApp />;
      case 'Settings': return <SettingsApp />;
      case 'LinkedIn': return <LinkedInApp />;
      case 'Uber': return <UberApp />;
      case 'Drive': return <DriveApp />;
      case 'Venmo': return <VenmoApp />;
      case 'Smile': return <SmileApp />;
      case null: return <HomeScreen />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-[#e8d8c8] p-6 text-center">
            <div className="w-20 h-20 bg-[#2a2522] rounded-3xl flex items-center justify-center mb-6 border-4 border-[#3a3532]">
              <Settings size={40} className="text-[#a49484]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{state.activeApp}</h2>
            <p className="text-[#a49484]">This app is not essential to the investigation right now.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen overflow-hidden bg-black p-4">
      {!storyStore.state.flags.intro_seen ? (
        <div className="flex items-center justify-center h-full w-full bg-black">
          {/* Background is black while narration is playing */}
        </div>
      ) : (
        <PhoneShell>
          <IncomingCallOverlay />
          <NotificationBanner />
          <InnerMonologue />
          {renderApp()}
          <DecisionModal />
        </PhoneShell>
      )}
    </div>
  );
};

import { StoryProvider } from './components/StoryProvider';

export default function App() {
  return (
    <GameProvider>
      <StoryProvider>
        <GameApp />
        <IntroNarration />
      </StoryProvider>
    </GameProvider>
  );
}

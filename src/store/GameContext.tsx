import React, { createContext, useContext, useReducer, ReactNode } from 'react';

type Device = 'player' | 'victim';

export type MessageThread = { id: string; name: string; messages: { time: string; sender: string; text: string; day?: string }[] };
export type Contact = { id: string; name: string; voice?: string };
export type RecentCall = { name: string; type: string; time: string; missed: boolean };

export interface GameState {
  activeDevice: Device;
  unlockedApps: string[];
  evidenceInventory: string[];
  narrativeFlags: {
    davidTrust: number;
    liamAwareness: boolean;
    playerViewsDeletedPhotos: boolean;
    playerUnlocksProofNote: boolean;
    liamAtDoor: 'unknown' | 'let_in' | 'keep_out';
  };
  currentTime: string;
  notifications: { id: string; title: string; message: string; app: string; threadId?: string; device: Device; timestamp: string }[];
  activeApp: string | null;
  currentCall: string | null;
  incomingCall: { name: string; personaKey: string; voice: string; device: Device } | null;
  pendingThreadOpen: string | null;
  contacts: { player: Contact[]; victim: Contact[] };
  recentCalls: { player: RecentCall[]; victim: RecentCall[] };
  messages: { player: MessageThread[]; victim: MessageThread[] };
  emails: { player: any[]; victim: any[] };
  slack: { player: any[]; victim: any[] };
  notes: { player: any[]; victim: any[] };
  signal: { player: any[]; victim: any[] };
  venmo: { player: any; victim: any };
  voicemails: { player: any[]; victim: any[] };
  photos: { player: any[]; victim: any[] };
  maps: { player: any[]; victim: any[] };
  currentMonologue: string | null;
  currentNarration: string | null;
  currentNarrationTitle: string | null;
  currentNarrationId: string | null;
  victimUnlocked: boolean;
}

type Action =
  | { type: 'SET_MONOLOGUE'; payload: string | null }
  | { type: 'SET_NARRATION'; payload: { text: string; title?: string; id?: string } | null }
  | { type: 'SWITCH_DEVICE'; payload: Device }
  | { type: 'UNLOCK_DEVICE'; payload: Device }
  | { type: 'UNLOCK_APP'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: string }
  | { type: 'SET_FLAG'; payload: { key: keyof GameState['narrativeFlags']; value: any } }
  | { type: 'ADD_NOTIFICATION'; payload: { id: string; title: string; message: string; app: string; threadId?: string; device: Device; timestamp: string } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'OPEN_APP'; payload: string | null }
  | { type: 'SET_CURRENT_CALL'; payload: string | null }
  | { type: 'SET_INCOMING_CALL'; payload: { name: string; personaKey: string; voice: string; device: Device } | null }
  | { type: 'OPEN_THREAD'; payload: string | null }
  | { type: 'SYNC_CHATS'; payload: { device: Device; chats: MessageThread[] } }
  | { type: 'SYNC_CONTACTS'; payload: { device: Device; contacts: Contact[] } }
  | { type: 'SYNC_RECENT_CALLS'; payload: { device: Device; calls: RecentCall[] } }
  | { type: 'SYNC_EMAILS'; payload: { device: Device; emails: any[] } }
  | { type: 'SYNC_SLACK'; payload: { device: Device; slack: any[] } }
  | { type: 'SYNC_NOTES'; payload: { device: Device; notes: any[] } }
  | { type: 'SYNC_SIGNAL'; payload: { device: Device; signal: any[] } }
  | { type: 'SYNC_VENMO'; payload: { device: Device; venmo: any } }
  | { type: 'SYNC_VOICEMAILS'; payload: { device: Device; voicemails: any[] } }
  | { type: 'SYNC_PHOTOS'; payload: { device: Device; photos: any[] } }
  | { type: 'SYNC_MAPS'; payload: { device: Device; maps: any[] } }
  | { type: 'SYNC_NOTIFICATIONS'; payload: { player: any[]; victim: any[] } }
  | { type: 'ADD_RECENT_CALL'; payload: { device: Device; call: RecentCall } }
  | { type: 'CLEAR_APP_NOTIFICATIONS'; payload: { device: Device; app: string } }
  | { type: 'CLEAR_NOTIFICATIONS'; payload: { device: Device } }
  | { type: 'ADD_MESSAGE'; payload: { device: Device; threadId: string; sender: string; text: string } }
  | { type: 'SYNC_PROGRESS'; payload: { unlockedApps?: string[]; activeDevice?: Device; victimUnlocked?: boolean } }
  | { type: 'LOAD_STATE'; payload: GameState };

const initialState: GameState = {
  activeDevice: 'player',
  unlockedApps: ['Messages', 'Settings'],
  evidenceInventory: [],
  narrativeFlags: {
    davidTrust: 50,
    liamAwareness: false,
    playerViewsDeletedPhotos: false,
    playerUnlocksProofNote: false,
    liamAtDoor: 'unknown',
  },
  currentTime: new Date().toISOString(),
  notifications: [],
  activeApp: null,
  currentCall: null,
  incomingCall: null,
  pendingThreadOpen: null,
  contacts: { player: [], victim: [] },
  recentCalls: { player: [], victim: [] },
  messages: { player: [], victim: [] },
  emails: { player: [], victim: [] },
  slack: { player: [], victim: [] },
  notes: { player: [], victim: [] },
  signal: { player: [], victim: [] },
  venmo: { player: null, victim: null },
  voicemails: { player: [], victim: [] },
  photos: { player: [], victim: [] },
  maps: { player: [], victim: [] },
  currentMonologue: null,
  currentNarration: null,
  currentNarrationTitle: null,
  currentNarrationId: null,
  victimUnlocked: true,
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_MONOLOGUE':
      return { ...state, currentMonologue: action.payload };
    case 'SET_NARRATION':
      return {
        ...state,
        currentNarration: action.payload ? action.payload.text : null,
        currentNarrationTitle: action.payload ? (action.payload.title || null) : null,
        currentNarrationId: action.payload ? (action.payload.id || null) : null
      };
    case 'SWITCH_DEVICE':
      return { ...state, activeDevice: action.payload, activeApp: null };
    case 'UNLOCK_DEVICE':
      if (action.payload === 'victim') {
        return { ...state, victimUnlocked: true };
      }
      return state;
    case 'UNLOCK_APP':
      if (state.unlockedApps.includes(action.payload)) return state;
      return { ...state, unlockedApps: [...state.unlockedApps, action.payload] };
    case 'ADD_EVIDENCE':
      if (state.evidenceInventory.includes(action.payload)) return state;
      return { ...state, evidenceInventory: [...state.evidenceInventory, action.payload] };
    case 'SET_FLAG':
      return {
        ...state,
        narrativeFlags: { ...state.narrativeFlags, [action.payload.key]: action.payload.value },
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter((n) => n.id !== action.payload) };
    case 'OPEN_APP':
      return { ...state, activeApp: action.payload };
    case 'SET_CURRENT_CALL':
      return { ...state, currentCall: action.payload };
    case 'SET_INCOMING_CALL':
      return { ...state, incomingCall: action.payload };
    case 'OPEN_THREAD':
      return { ...state, pendingThreadOpen: action.payload };
    case 'SYNC_CHATS':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.device]: action.payload.chats
        }
      };
    case 'ADD_MESSAGE': {
      const { device, threadId, sender, text } = action.payload;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const threadExists = state.messages[device].some(t => t.id === threadId);

      let newThreads;
      if (threadExists) {
        newThreads = state.messages[device].map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: [...thread.messages, { time, sender, text, day: 'Today' }]
            };
          }
          return thread;
        });
      } else {
        newThreads = [...state.messages[device], {
          id: threadId,
          name: sender,
          messages: [{ time, sender, text, day: 'Today' }]
        }];
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [device]: newThreads
        }
      };
    }
    case 'SYNC_CONTACTS':
      return {
        ...state,
        contacts: { ...state.contacts, [action.payload.device]: action.payload.contacts }
      };
    case 'SYNC_RECENT_CALLS':
      return {
        ...state,
        recentCalls: { ...state.recentCalls, [action.payload.device]: action.payload.calls }
      };
    case 'SYNC_EMAILS':
      return {
        ...state,
        emails: { ...state.emails, [action.payload.device]: action.payload.emails }
      };
    case 'SYNC_SLACK':
      return {
        ...state,
        slack: { ...state.slack, [action.payload.device]: action.payload.slack }
      };
    case 'SYNC_NOTES':
      return {
        ...state,
        notes: { ...state.notes, [action.payload.device]: action.payload.notes }
      };
    case 'SYNC_SIGNAL':
      return {
        ...state,
        signal: { ...state.signal, [action.payload.device]: action.payload.signal }
      };
    case 'SYNC_VOICEMAILS':
      return {
        ...state,
        voicemails: { ...state.voicemails, [action.payload.device]: action.payload.voicemails }
      };
    case 'SYNC_PHOTOS':
      return {
        ...state,
        photos: { ...state.photos, [action.payload.device]: action.payload.photos }
      };
    case 'SYNC_MAPS':
      return {
        ...state,
        maps: { ...state.maps, [action.payload.device]: action.payload.maps }
      };
    case 'SYNC_NOTIFICATIONS':
      return {
        ...state,
        notifications: [
          ...action.payload.player.map((n: any) => ({ ...n, device: 'player' })),
          ...action.payload.victim.map((n: any) => ({ ...n, device: 'victim' }))
        ]
      };
    case 'SYNC_VENMO':
      return {
        ...state,
        venmo: { ...state.venmo, [action.payload.device]: action.payload.venmo }
      };
    case 'ADD_RECENT_CALL':
      return {
        ...state,
        recentCalls: {
          ...state.recentCalls,
          [action.payload.device]: [action.payload.call, ...state.recentCalls[action.payload.device]]
        }
      };
    case 'CLEAR_APP_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.device !== action.payload.device || n.app !== action.payload.app)
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.device !== action.payload.device)
      };
    case 'SYNC_PROGRESS':
      return {
        ...state,
        unlockedApps: action.payload.unlockedApps || state.unlockedApps,
        activeDevice: action.payload.activeDevice || state.activeDevice,
        victimUnlocked: action.payload.victimUnlocked ?? state.victimUnlocked,
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

type Device = 'player' | 'victim';

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
  notifications: { id: string; title: string; message: string; app: string }[];
  activeApp: string | null;
}

type Action =
  | { type: 'SWITCH_DEVICE'; payload: Device }
  | { type: 'UNLOCK_APP'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: string }
  | { type: 'SET_FLAG'; payload: { key: keyof GameState['narrativeFlags']; value: any } }
  | { type: 'ADD_NOTIFICATION'; payload: { id: string; title: string; message: string; app: string } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'OPEN_APP'; payload: string | null };

const initialState: GameState = {
  activeDevice: 'player',
  unlockedApps: ['Messages', 'Phone', 'Mail', 'Safari', 'Photos', 'Maps', 'Notes', 'Signal', 'Venmo', 'LinkedIn', 'Uber', 'Google Drive', 'Slack'],
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
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SWITCH_DEVICE':
      return { ...state, activeDevice: action.payload, activeApp: null };
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

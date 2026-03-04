export interface StoryData {
    story: Story;
}

export interface Persona {
    prompt: string;
    online: boolean;
}

export interface ChatGroup {
    id: string;
    name: string;
    type: 'group' | 'dm';
    messages: any[];
}

export interface Contact {
    id: string;
    name: string;
    description: string;
    stress: number;
    knowledge: string[];
}

export interface Story {
    id: string;
    title: string;
    version: string;
    description: string;
    initialState?: Record<string, any>;
    chats: ChatGroup[];
    items: any[];
    voicemails: any[];
    news: any[];
    messages: any[];
    player_chats?: ChatGroup[];
    victim_chats?: ChatGroup[];
    player_contacts?: Contact[];
    victim_contacts?: Contact[];
    player_recent_calls?: any[];
    victim_recent_calls?: any[];
    player_slack?: any[];
    victim_slack?: any[];
    player_emails?: any[];
    victim_emails?: any[];
    player_notes?: any[];
    victim_notes?: any[];
    player_signal?: any[];
    victim_signal?: any[];
    player_venmo?: any;
    victim_venmo?: any;
    player_voicemails?: any[];
    victim_voicemails?: any[];
    personas: Record<string, Persona>;
    contacts: Contact[];
    galleryMetadata: any[];
    tideData?: Record<string, any>;
    personaKnowledge?: Record<string, { unlocked: string[]; locked: Record<string, string> }>;
    currentObjectives?: { id: string; description: string; hint?: string }[];
    events: StoryEvent[];
}

export interface StoryEvent {
    id: string;
    type: string;
    trigger?: StoryTrigger;
    content: Record<string, any>;
    next?: string;
    actions?: StoryAction[];
}

export interface StoryTrigger {
    type: 'auto' | 'item_collected' | 'room_entered' | 'message_sent' | 'app_opened' | 'call_ended' | 'article_read' | 'conditions_met';
    delay?: number;
    itemId?: string;
    roomId?: string;
    evidenceId?: string;
    callId?: string;
    appId?: string;
    recipientId?: string;
    messageQuery?: string;
    articleId?: string;
    conditions?: Record<string, any>;
}

export interface StoryAction {
    type: string;
    flag?: string;
    value?: any;
    variable?: string;
    chatId?: string;
    sender?: string;
    text?: string;
    roomId?: string;
    action?: string;
    item?: any;
    sound?: string;
    music?: string;
    article?: any;
    monologue?: string;
    userId?: string;
    persona?: string;
    evidence?: any;
    target?: string;
    amount?: number;
    knowledgeId?: string;
    clue?: string;
    id?: string;
    assetPath?: string;
    note?: string;
    appId?: string;
}

export interface StoryState {
    currentEvent?: string;
    completedEvents: string[];
    flags: Record<string, any>;
    variables: Record<string, any>;
    evidenceCollected: string[];
    roomsUnlocked: string[];
    roomsVisited: string[];
    itemsCollected: string[];
    personas: Record<string, Persona>;
    npcStress: Record<string, number>;
    npcKnowledge: Record<string, string[]>;
    currentObjectives: { id: string; description: string; hint?: string }[];
    unlockedKnowledge: Record<string, string[]>;
    activeNarrationId?: string;
    startTime: number;
    lastUpdated: number;
}

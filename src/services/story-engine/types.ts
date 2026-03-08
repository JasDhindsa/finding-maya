export interface StoryData {
    story: Story;
}

export interface Persona {
    prompt?: string;
    systemPrompt?: string;
    fullName?: string;
    role?: string;
    available?: string;
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
    playerChats?: ChatGroup[];
    victimChats?: ChatGroup[];
    player_contacts?: Contact[];
    victim_contacts?: Contact[];
    playerContacts?: Contact[];
    victimContacts?: Contact[];
    player_recent_calls?: any[];
    victim_recent_calls?: any[];
    playerRecentCalls?: any[];
    victimRecentCalls?: any[];
    player_slack?: any[];
    victim_slack?: any[];
    playerSlack?: any[];
    victimSlack?: any[];
    player_emails?: any[];
    victim_emails?: any[];
    playerEmails?: any[];
    victimEmails?: any[];
    playerMail?: any[];
    victimMail?: any[];
    player_notes?: any[];
    victim_notes?: any[];
    playerNotes?: any[];
    victimNotes?: any[];
    player_signal?: any[];
    victim_signal?: any[];
    playerSignal?: any[];
    victimSignal?: any[];
    player_venmo?: any;
    victim_venmo?: any;
    playerVenmo?: any;
    victimVenmo?: any;
    player_voicemails?: any[];
    victim_voicemails?: any[];
    playerVoicemails?: any[];
    victimVoicemails?: any[];
    playerPhotos?: any[];
    victimPhotos?: any[];
    playerMaps?: any[];
    victimMaps?: any[];
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
    type: 'auto' | 'item_collected' | 'room_entered' | 'message_sent' | 'app_opened' | 'call_ended' | 'article_read' | 'conditions_met' | 'player_opens_app' | 'player_opens_thread' | 'player_opens_note' | 'player_searches_photos' | 'flag_set' | 'note_unlocked' | 'ai_objective_met';
    delay?: number;
    itemId?: string;
    roomId?: string;
    evidenceId?: string;
    callId?: string;
    appId?: string;
    app?: string;
    thread?: string;
    noteId?: string;
    query?: string;
    recipientId?: string;
    messageQuery?: string;
    articleId?: string;
    flag?: string;
    value?: any;
    conditions?: Record<string, any>;
    objective?: string;
    targetPersona?: string;
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

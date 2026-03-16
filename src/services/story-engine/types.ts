export interface StoryData {
    story: Story;
}

export interface Persona {
    prompt?: string;
    systemPrompt?: string;
    callPrompt?: string;
    fullName?: string;
    role?: string;
    available?: string;
    online: boolean;
}

export interface ConversationStage {
    id: string;
    guidance: string;
    completionObjective?: string;
    playerShouldKnow?: string[];
    requiredFlags?: string[];
    closeThreadAfterCompletion?: boolean;
}

export interface ConversationRule {
    enabled: boolean;
    threadId?: string;
    channels?: string[];
    stages: ConversationStage[];
}

export interface ConversationProgress {
    completedStageIds: string[];
    knownFacts: string[];
    finished: boolean;
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
    victimLocationHistory?: Record<string, any>;
    victimCalendar?: Record<string, any[]>;
    victimReminders?: Record<string, any[]>;
    victimHealthData?: Record<string, any>;
    victimLinkedIn?: Record<string, any>;
    victimGoogleDrive?: Record<string, any>;
    conversationRules?: Record<string, ConversationRule>;
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
    type: 'auto' | 'item_collected' | 'room_entered' | 'message_sent' | 'app_opened' | 'call_ended' | 'article_read' | 'conditions_met' | 'player_opens_app' | 'player_opens_thread' | 'player_opens_note' | 'player_searches_photos' | 'flag_set' | 'note_unlocked' | 'ai_objective_met' | 'player_searches_linkedin' | 'player_views_deleted_photo' | 'player_opens_drive_file' | 'player_checks_uber_history' | 'player_goes_to_fort_point' | 'time_elapsed';
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
    photoId?: string;
    fileId?: string;
    minutes?: number;
    afterFlag?: string;
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
    flagTimestamps: Record<string, number>;
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
    conversationRules: Record<string, ConversationRule>;
    conversationProgress: Record<string, ConversationProgress>;
    activeNarrationId?: string;
    startTime: number;
    lastUpdated: number;
}

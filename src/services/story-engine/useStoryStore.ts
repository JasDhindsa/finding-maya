import { create } from 'zustand';
import { StoryState, StoryEvent, StoryAction, StoryTrigger } from './types';
import { storyEngine } from './StoryEngine';

interface StoryStore {
    currentStoryId: string | null;
    state: StoryState;
    executingEvents: Set<string>;
    isBusy: boolean;

    // Actions
    initializeStory: (storyId: string) => Promise<void>;
    checkPendingEvents: () => Promise<void>;
    executeEvent: (eventId: string, isChain?: boolean) => Promise<Record<string, any> | null>;
    reportAction: (actionType: string, data: Record<string, any>) => Promise<Record<string, any> | null>;
    completeEvent: (eventId: string) => void;
    dismissNarration: () => void;
    setFlag: (key: string, value: any) => void;
    resetAll: () => void;
    startPolling: (intervalMs?: number) => () => void;
}

export const useStoryStore = create<StoryStore>((set, get) => ({
    currentStoryId: null,
    state: {
        completedEvents: [],
        flags: { inner_monologue_enabled: true },
        variables: {},
        personas: {},
        evidenceCollected: [],
        roomsUnlocked: [],
        roomsVisited: [],
        itemsCollected: [],
        npcStress: {},
        npcKnowledge: {},
        currentObjectives: [],
        unlockedKnowledge: {},
        startTime: Date.now(),
        lastUpdated: Date.now(),
    },
    executingEvents: new Set(),
    isBusy: false,

    initializeStory: async (storyId: string) => {
        try {
            const storyData = await storyEngine.loadStory(storyId);
            const initialState = storyData.story.initialState || {};

            set((s) => ({
                currentStoryId: storyId,
                state: {
                    ...s.state,
                    ...initialState,
                    personas: { ...s.state.personas, ...storyData.story.personas },
                    currentObjectives: storyData.story.currentObjectives || [],
                    unlockedKnowledge: Object.keys(storyData.story.personaKnowledge || {}).reduce((acc, personaId) => {
                        acc[personaId] = storyData.story.personaKnowledge?.[personaId].unlocked || [];
                        return acc;
                    }, {} as Record<string, string[]>),
                    startTime: Date.now(),
                    lastUpdated: Date.now(),
                }
            }));

            console.log(`StoryStore: Initialized story ${storyId}`);
        } catch (error) {
            console.error('StoryStore: Failed to initialize story', error);
        }
    },

    checkPendingEvents: async () => {
        try {
            const { state, currentStoryId, executingEvents, executeEvent } = get();
            if (!currentStoryId || state.activeNarrationId) return;

            const events = await storyEngine.getAllEvents(currentStoryId);
            const pendingEvents = events.filter(event => {
                if (state.completedEvents.includes(event.id)) return false;
                return checkTrigger(event, state);
            });

            for (const event of pendingEvents) {
                // Defensive check: if an event in this loop started a narration or made us busy, stop
                if (get().state.activeNarrationId || get().isBusy) break;

                if (executingEvents.has(event.id)) continue;
                executingEvents.add(event.id);
                await executeEvent(event.id);
                executingEvents.delete(event.id);
            }
        } catch (error) {
            console.error('StoryStore: Error checking pending events', error);
        }
    },

    executeEvent: async (eventId, isChain = false) => {
        const { currentStoryId, isBusy, completeEvent } = get();
        if (!currentStoryId || (!isChain && isBusy)) return null;

        try {
            if (!isChain) set({ isBusy: true });
            const event = await storyEngine.getEvent(currentStoryId, eventId);
            console.log(`StoryStore: Executing event ${eventId} (type: ${event.type})`);

            // Mark as complete immediately to avoid duplicate triggers during async operations
            completeEvent(eventId);

            // Execute actions (handled by StoryEventHandler usually, but here for now)
            if (event.type === 'inner_monologue' && event.content?.text) {
                window.dispatchEvent(new CustomEvent('story-monologue', { detail: { text: event.content.text } }));
            }
            if (event.type === 'narration' && event.content?.text) {
                set(s => ({ state: { ...s.state, activeNarrationId: event.id } }));
                window.dispatchEvent(new CustomEvent('story-narration', {
                    detail: {
                        text: event.content.text,
                        title: event.content.title,
                        eventId: event.id
                    }
                }));
            }
            if (event.type === 'message' && event.content?.text) {
                window.dispatchEvent(new CustomEvent('story-message', {
                    detail: {
                        sender: event.content.sender,
                        text: event.content.text,
                        chat_id: event.content.chat_id
                    }
                }));
            }
            if (event.type === 'transition') {
                // Handle screen transitions
                console.log('TRANSITION:', event.content);
                // We could dispatch an event here if we had a global screen manager
            }

            if (event.actions) {
                for (const action of event.actions) {
                    await executeAction(action, get());
                }
            }

            // Chain next event if available
            // Chain next event if available (unless it's a narration, which waits for click)
            if (event.next && event.type !== 'narration') {
                const nextEvent = await storyEngine.getEvent(currentStoryId, event.next);
                if (checkTrigger(nextEvent, get().state)) {
                    await get().executeEvent(event.next, true);
                }
            }

            return { eventId, type: event.type };
        } catch (error) {
            console.error(`StoryStore: Error executing event ${eventId}`, error);
            return null;
        } finally {
            if (!isChain) set({ isBusy: false });
        }
    },

    dismissNarration: async () => {
        const { state, currentStoryId, executeEvent } = get();
        const narrationId = state.activeNarrationId;

        if (!narrationId || !currentStoryId) return;

        // Clear the active narration
        set(s => ({ state: { ...s.state, activeNarrationId: undefined } }));

        try {
            const event = await storyEngine.getEvent(currentStoryId, narrationId);
            if (event.next) {
                console.log(`StoryStore: Narration dismissed, following next: ${event.next}`);
                await executeEvent(event.next);
            } else {
                get().checkPendingEvents();
            }
        } catch (error) {
            console.error('StoryStore: Error dismissing narration', error);
            get().checkPendingEvents();
        }
    },

    reportAction: async (actionType, data) => {
        const { currentStoryId, state, executeEvent } = get();
        if (!currentStoryId) return null;

        try {
            const triggerData = { type: actionType, ...data };

            // Update state based on action
            switch (actionType) {
                case 'item_collected': set(s => ({ state: { ...s.state, itemsCollected: [...s.state.itemsCollected, data.item_id] } })); break;
                case 'room_entered': set(s => ({ state: { ...s.state, roomsVisited: [...s.state.roomsVisited, data.room_id] } })); break;
                case 'evidence_added': set(s => ({ state: { ...s.state, evidenceCollected: [...s.state.evidenceCollected, data.evidence_id] } })); break;
                case 'app_opened': set(s => ({ state: { ...s.state, flags: { ...s.state.flags, last_app_opened: data.app_id } } })); break;
            }

            const events = await storyEngine.getAllEvents(currentStoryId);
            for (const event of events) {
                if (get().state.completedEvents.includes(event.id)) continue;
                if (checkTrigger(event, get().state, triggerData)) {
                    await executeEvent(event.id);
                }
            }

            return { action: actionType, data };
        } catch (error) {
            console.error(`StoryStore: Error reporting action ${actionType}`, error);
            return null;
        }
    },

    completeEvent: (eventId) => {
        set(s => ({
            state: {
                ...s.state,
                completedEvents: [...s.state.completedEvents, eventId],
                lastUpdated: Date.now()
            }
        }));
    },

    setFlag: (key, value) => {
        set(s => ({
            state: {
                ...s.state,
                flags: { ...s.state.flags, [key]: value },
                lastUpdated: Date.now()
            }
        }));
    },

    resetAll: () => {
        storyEngine.clearCache();
        set({
            currentStoryId: null,
            state: {
                completedEvents: [],
                flags: { inner_monologue_enabled: true },
                variables: {},
                personas: {},
                evidenceCollected: [],
                roomsUnlocked: [],
                roomsVisited: [],
                itemsCollected: [],
                npcStress: {},
                npcKnowledge: {},
                currentObjectives: [],
                unlockedKnowledge: {},
                startTime: Date.now(),
                lastUpdated: Date.now(),
            }
        });
    },

    startPolling: (intervalMs = 2000) => {
        const timer = setInterval(() => {
            get().checkPendingEvents();
        }, intervalMs);
        return () => clearInterval(timer);
    }
}));

// --- Helper Functions ---

function checkTrigger(event: StoryEvent, state: StoryState, triggerData?: Record<string, any>): boolean {
    const trigger = event.trigger;
    if (!trigger) return false;

    // Delay check
    if (trigger.delay && trigger.delay > 0) {
        if (Date.now() - state.startTime < trigger.delay) return false;
    }

    switch (trigger.type) {
        case 'auto': return true;
        case 'item_collected': return triggerData?.type === 'item_collected' && triggerData?.item_id === trigger.itemId;
        case 'room_entered': return triggerData?.type === 'room_entered' && triggerData?.room_id === trigger.roomId;
        case 'message_sent': {
            const matchesRecipient = !trigger.recipientId || trigger.recipientId === triggerData?.recipient_id;
            let matchesQuery = true;
            if (trigger.messageQuery && triggerData?.content) {
                matchesQuery = triggerData.content.toLowerCase().includes(trigger.messageQuery.toLowerCase());
            }
            return triggerData?.type === 'message_sent' && matchesRecipient && matchesQuery;
        }
        case 'app_opened': return triggerData?.type === 'app_opened' && triggerData?.app_id === trigger.appId;
        case 'call_ended': return triggerData?.type === 'call_ended' && triggerData?.call_id === trigger.callId;
        case 'article_read': return triggerData?.type === 'article_read' && triggerData?.article_id === trigger.articleId;
        case 'conditions_met': {
            if (!trigger.conditions) return false;
            return checkConditions(state, trigger.conditions);
        }
        default: return false;
    }
}

function checkConditions(state: StoryState, conditions: Record<string, any>): boolean {
    // Handle 'event_completed' condition
    if (conditions.event_completed) {
        if (!state.completedEvents.includes(conditions.event_completed)) return false;
    }

    // Handle 'flag' and 'value' condition
    if (conditions.flag) {
        const flagName = conditions.flag;
        const expectedValue = conditions.value;
        if (state.flags[flagName] !== expectedValue) return false;
    }

    // Handle direct key-value checks (legacy or simple)
    for (const [key, expectedValue] of Object.entries(conditions)) {
        if (key === 'event_completed' || key === 'flag' || key === 'value') continue;

        if (state.flags[key] !== expectedValue && state.variables[key] !== expectedValue) {
            if (key === 'evidence_collected' && Array.isArray(expectedValue)) {
                if (!expectedValue.every(v => state.evidenceCollected.includes(v))) return false;
            } else {
                return false;
            }
        }
    }
    return true;
}

async function executeAction(action: StoryAction, store: any) {
    console.log(`StoryStore: Executing action ${action.type}`, action);

    switch (action.type) {
        case 'set_flag': store.setFlag(action.flag || '', action.value); break;
        case 'message': {
            // Logic to add message to DB/Store
            console.log(`STORY MESSAGE: [${action.sender}] ${action.text}`);
            // Dispatch custom event for UI to pick up
            window.dispatchEvent(new CustomEvent('story-message', { detail: action }));
            break;
        }
        case 'play_sound': {
            // Play sound
            break;
        }
        case 'narration': {
            window.dispatchEvent(new CustomEvent('story-narration', { detail: action }));
            break;
        }
        case 'unlock_knowledge': {
            store.set(s => ({
                state: {
                    ...s.state,
                    unlockedKnowledge: {
                        ...s.state.unlockedKnowledge,
                        [action.persona!]: [...(s.state.unlockedKnowledge[action.persona!] || []), action.knowledgeId!]
                    }
                }
            }));
            break;
        }
        case 'incoming_call': {
            window.dispatchEvent(new CustomEvent('story-call', { detail: action }));
            break;
        }
        case 'inner_monologue': {
            window.dispatchEvent(new CustomEvent('story-monologue', { detail: action }));
            break;
        }
        // Add more cases as needed
    }
}

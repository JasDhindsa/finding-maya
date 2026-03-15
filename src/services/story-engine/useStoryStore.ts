import { create } from 'zustand';
import { StoryState, StoryEvent, StoryAction, StoryTrigger, ConversationProgress, ConversationRule, ConversationStage } from './types';
import { storyEngine } from './StoryEngine';
import { geminiService } from '../ai/GeminiService';

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
    evaluateObjectives: (history: any[], targetContext: string) => Promise<void>;
    completeEvent: (eventId: string) => void;
    dismissNarration: () => void;
    setFlag: (key: string, value: any) => void;
    getConversationContext: (personaId: string, threadId?: string, channel?: string) => { rule: ConversationRule; progress: ConversationProgress; currentStage: ConversationStage | null } | null;
    isPersonaAvailable: (personaId: string, threadId?: string, channel?: string) => boolean;
    updateConversationProgress: (personaId: string, history: any[]) => Promise<ConversationProgress | null>;
    resetAll: () => void;
    startPolling: (intervalMs?: number) => () => void;
}

export const useStoryStore = create<StoryStore>((set, get) => ({
    currentStoryId: null,
    state: {
        completedEvents: [],
        flags: { inner_monologue_enabled: true },
        flagTimestamps: {},
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
        conversationRules: {},
        conversationProgress: {},
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
                    flagTimestamps: buildInitialFlagTimestamps(initialState.flags || {}),
                    personas: { ...s.state.personas, ...storyData.story.personas },
                    currentObjectives: storyData.story.currentObjectives || [],
                    unlockedKnowledge: Object.keys(storyData.story.personaKnowledge || {}).reduce((acc, personaId) => {
                        acc[personaId] = storyData.story.personaKnowledge?.[personaId].unlocked || [];
                        return acc;
                    }, {} as Record<string, string[]>),
                    conversationRules: storyData.story.conversationRules || {},
                    conversationProgress: buildInitialConversationProgress(storyData.story.conversationRules || {}),
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
            const { state, currentStoryId, executeEvent } = get();
            if (!currentStoryId || state.activeNarrationId) return;

            const events = await storyEngine.getAllEvents(currentStoryId);
            const pendingEvents = events.filter(event => {
                if (state.completedEvents.includes(event.id)) return false;
                return checkTrigger(event, state);
            });

            for (const event of pendingEvents) {
                // Defensive check: if an event in this loop started a narration or made us busy, stop
                if (get().state.activeNarrationId || get().isBusy) break;

                await executeEvent(event.id);
            }
        } catch (error) {
            console.error('StoryStore: Error checking pending events', error);
        }
    },

    executeEvent: async (eventId, isChain = false) => {
        const { currentStoryId, isBusy, completeEvent, executingEvents } = get();
        if (!currentStoryId || (!isChain && isBusy) || executingEvents.has(eventId)) return null;

        try {
            executingEvents.add(eventId);
            if (!isChain) set({ isBusy: true });
            const event = await storyEngine.getEvent(currentStoryId, eventId);
            const narrationTypes = new Set(['narration', 'discovery', 'location_event', 'major_decision', 'epilogue', 'credits']);
            const narrationText = formatNarrationText(event);
            console.log(`StoryStore: Executing event ${eventId} (type: ${event.type})`);

            // Execute actions (handled by StoryEventHandler usually, but here for now)
            if (event.type === 'inner_monologue' && event.content?.text) {
                window.dispatchEvent(new CustomEvent('story-monologue', { detail: { text: event.content.text } }));
            }
            if (narrationTypes.has(event.type) && narrationText) {
                set(s => ({ state: { ...s.state, activeNarrationId: event.id } }));
                window.dispatchEvent(new CustomEvent('story-narration', {
                    detail: {
                        text: narrationText,
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
            if (event.type === 'notification_push' && event.content) {
                window.dispatchEvent(new CustomEvent('story-notification', { detail: event.content }));
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

            // Chain next event unconditionally — 'next' is an explicit directive, not trigger-gated.
            // Triggers only matter for events found by the polling/pending system.
            if (event.next && !narrationTypes.has(event.type)) {
                await get().executeEvent(event.next, true);
            }

            completeEvent(eventId);
            return { eventId, type: event.type };
        } catch (error) {
            console.error(`StoryStore: Error executing event ${eventId}`, error);
            return null;
        } finally {
            executingEvents.delete(eventId);
            if (!isChain) set({ isBusy: false });
        }
    },

    dismissNarration: async () => {
        const { state, currentStoryId, executeEvent } = get();
        const narrationId = state.activeNarrationId;

        if (!narrationId || !currentStoryId) return;

        // Clear the active narration
        set(s => {
            const newState = { ...s.state };
            delete newState.activeNarrationId;
            return { state: newState };
        });

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
                case 'flag_set': set(s => ({
                    state: {
                        ...s.state,
                        flags: { ...s.state.flags, [data.flag]: data.value !== undefined ? data.value : true },
                        flagTimestamps: { ...s.state.flagTimestamps, [data.flag]: Date.now() }
                    }
                })); break;
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

    evaluateObjectives: async (history, targetContext) => {
        const { currentStoryId, state, reportAction } = get();
        if (!currentStoryId) return;

        try {
            const events = await storyEngine.getAllEvents(currentStoryId);
            const pendingObjectiveEvents = events.filter(event => {
                const trigger = event.trigger;
                if (!trigger || trigger.type !== 'ai_objective_met' || state.completedEvents.includes(event.id)) return false;
                if (trigger.targetPersona && !matchesConversationTarget(trigger.targetPersona, targetContext, state.conversationRules)) return false;

                if (trigger.delay && trigger.delay > 0) {
                    if (Date.now() - state.startTime < trigger.delay) return false;
                }
                return true;
            });

            for (const event of pendingObjectiveEvents) {
                if (!event.trigger?.objective) continue;
                console.log(`StoryStore: Evaluating objective: "${event.trigger.objective}" for context: ${targetContext}...`);
                const isMet = await geminiService.evaluateObjective(event.trigger.objective, history);
                if (isMet) {
                    console.log(`StoryStore: Objective MET: "${event.trigger.objective}"`);
                    await reportAction('ai_objective_met', { objective: event.trigger.objective, targetPersona: targetContext });
                }
            }
        } catch (error) {
            console.error('StoryStore: Error evaluating objectives', error);
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
                flagTimestamps: { ...s.state.flagTimestamps, [key]: Date.now() },
                lastUpdated: Date.now()
            }
        }));
    },

    getConversationContext: (personaId, threadId, channel = 'Messages') => {
        const { state } = get();
        const rule = state.conversationRules[personaId];
        if (!rule?.enabled) return null;
        if (rule.threadId && threadId && rule.threadId !== threadId) return null;
        if (rule.channels?.length && !rule.channels.includes(channel)) return null;

        const progress = state.conversationProgress[personaId] || emptyConversationProgress();
        const currentStage = getCurrentConversationStage(rule, progress, state.flags);

        return { rule, progress, currentStage };
    },

    isPersonaAvailable: (personaId, threadId, channel = 'Messages') => {
        const { state } = get();
        const persona = state.personas[personaId];
        if (!persona?.online) return false;

        const context = get().getConversationContext(personaId, threadId, channel);
        if (!context) return false;
        if (context.progress.finished) return false;

        return context.currentStage !== null;
    },

    updateConversationProgress: async (personaId, history) => {
        const context = get().getConversationContext(personaId);
        if (!context?.currentStage) return context?.progress || null;

        const { currentStage } = context;
        if (!currentStage.completionObjective) return context.progress;

        const achieved = await geminiService.evaluateObjective(currentStage.completionObjective, history);
        if (!achieved) return get().state.conversationProgress[personaId] || context.progress;

        const nextProgress = mergeConversationProgress(context.progress, currentStage, context.rule, get().state.flags);

        set(s => ({
            state: {
                ...s.state,
                conversationProgress: {
                    ...s.state.conversationProgress,
                    [personaId]: nextProgress
                },
                lastUpdated: Date.now()
            }
        }));

        return nextProgress;
    },

    resetAll: () => {
        storyEngine.clearCache();
        set({
            currentStoryId: null,
            state: {
                completedEvents: [],
                flags: { inner_monologue_enabled: true },
                flagTimestamps: {},
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
                conversationRules: {},
                conversationProgress: {},
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
        case 'app_opened':
        case 'player_opens_app': return triggerData?.type === 'app_opened' && (triggerData?.app_id === trigger.appId || triggerData?.app_id?.toLowerCase() === trigger.app?.toLowerCase());
        case 'player_opens_thread': return triggerData?.type === 'thread_opened' && triggerData?.thread_id === trigger.thread;
        case 'player_opens_note': return triggerData?.type === 'note_opened' && triggerData?.note_id === trigger.noteId;
        case 'note_unlocked': return triggerData?.type === 'note_unlocked' && triggerData?.note_id === trigger.noteId;
        case 'flag_set': return state.flags[trigger.flag!] === (trigger.value !== undefined ? trigger.value : true);
        case 'player_searches_photos': return triggerData?.type === 'photos_searched' && triggerData?.query?.toLowerCase().includes(trigger.query?.toLowerCase() || '');
        case 'player_searches_linkedin': return triggerData?.type === 'linkedin_searched' && triggerData?.query?.toLowerCase().includes(trigger.query?.toLowerCase() || '');
        case 'player_views_deleted_photo': return triggerData?.type === 'photo_viewed' && triggerData?.photo_id === trigger.photoId;
        case 'player_opens_drive_file': return triggerData?.type === 'drive_file_opened' && triggerData?.file_id === trigger.fileId;
        case 'player_checks_uber_history': return triggerData?.type === 'uber_history_checked';
        case 'player_goes_to_fort_point': return triggerData?.type === 'location_visited' && triggerData?.location_id === 'fort_point';
        case 'call_ended': return triggerData?.type === 'call_ended' && triggerData?.call_id === trigger.callId;
        case 'article_read': return triggerData?.type === 'article_read' && triggerData?.article_id === trigger.articleId;
        case 'ai_objective_met': return triggerData?.type === 'ai_objective_met' && triggerData?.objective === trigger.objective;
        case 'time_elapsed': {
            if (!trigger.minutes) return false;
            if (trigger.afterFlag && !state.flags[trigger.afterFlag]) return false;
            const startedAt = trigger.afterFlag ? state.flagTimestamps[trigger.afterFlag] : state.startTime;
            if (!startedAt) return false;
            return Date.now() - startedAt >= trigger.minutes * 60 * 1000;
        }
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
        case 'unlock_app': {
            window.dispatchEvent(new CustomEvent('story-unlock-app', { detail: action }));
            break;
        }
        // Add more cases as needed
    }
}

function emptyConversationProgress(): ConversationProgress {
    return {
        completedStageIds: [],
        knownFacts: [],
        finished: false,
    };
}

function formatNarrationText(event: StoryEvent): string {
    const baseText = event.content?.text || '';
    if (event.type !== 'major_decision' || !Array.isArray(event.content?.options)) {
        return baseText;
    }

    const optionsText = event.content.options
        .map((option: Record<string, any>) => `${option.label}: ${option.description}`)
        .join('\n\n');

    return `${baseText}\n\n${optionsText}`.trim();
}

function matchesConversationTarget(
    targetPersona: string,
    targetContext: string,
    rules: Record<string, ConversationRule>
): boolean {
    if (targetPersona === targetContext) return true;

    return Object.entries(rules).some(([personaId, rule]) => {
        const targetMatchesRule = targetPersona === personaId || targetPersona === rule.threadId;
        const contextMatchesRule = targetContext === personaId || targetContext === rule.threadId;
        return targetMatchesRule && contextMatchesRule;
    });
}

function buildInitialConversationProgress(rules: Record<string, ConversationRule>): Record<string, ConversationProgress> {
    return Object.keys(rules).reduce((acc, personaId) => {
        acc[personaId] = emptyConversationProgress();
        return acc;
    }, {} as Record<string, ConversationProgress>);
}

function buildInitialFlagTimestamps(flags: Record<string, any>): Record<string, number> {
    const now = Date.now();
    return Object.keys(flags).reduce((acc, key) => {
        if (flags[key]) acc[key] = now;
        return acc;
    }, {} as Record<string, number>);
}

function getCurrentConversationStage(rule: ConversationRule, progress: ConversationProgress, flags: Record<string, any>): ConversationStage | null {
    for (const stage of rule.stages) {
        if (progress.completedStageIds.includes(stage.id)) continue;
        if (stage.requiredFlags && !stage.requiredFlags.every(flag => !!flags[flag])) continue;
        return stage;
    }
    return null;
}

function mergeConversationProgress(
    progress: ConversationProgress,
    completedStage: ConversationStage,
    rule: ConversationRule,
    flags: Record<string, any>
): ConversationProgress {
    const completedStageIds = progress.completedStageIds.includes(completedStage.id)
        ? progress.completedStageIds
        : [...progress.completedStageIds, completedStage.id];

    const knownFacts = Array.from(new Set([
        ...progress.knownFacts,
        ...(completedStage.playerShouldKnow || []),
    ]));

    const nextStage = getCurrentConversationStage(rule, { ...progress, completedStageIds, knownFacts, finished: progress.finished }, flags);
    const finished = completedStage.closeThreadAfterCompletion || nextStage === null;

    return {
        completedStageIds,
        knownFacts,
        finished,
    };
}

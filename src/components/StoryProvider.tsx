import React, { useEffect } from 'react';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';
import { storyEngine } from '../services/story-engine/StoryEngine';

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { initializeStory, startPolling, reportAction } = useStoryStore();
    const { state: gameState, dispatch } = useGame();

    useEffect(() => {
        const load = async () => {
            console.log('StoryProvider: Loading story...');
            await initializeStory('maya_chen_investigation');

            const storyData = await storyEngine.loadStory('maya_chen_investigation');
            if (!storyData) return;

            const formatChats = (chats: any[]) => chats.map(chat => ({
                id: chat.id,
                name: chat.name,
                messages: (chat.messages || []).map((msg: any) => ({
                    time: msg.time || new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: msg.senderId || msg.sender || 'Unknown',
                    text: msg.content || msg.text || '',
                    day: msg.day || 'Today'
                }))
            }));

            const story = storyData.story;

            // --- Sync Chats ---
            if (story.player_chats) dispatch({ type: 'SYNC_CHATS', payload: { device: 'player', chats: formatChats(story.player_chats) } });
            if (story.victim_chats) dispatch({ type: 'SYNC_CHATS', payload: { device: 'victim', chats: formatChats(story.victim_chats) } });

            // --- Sync Contacts ---
            if (story.player_contacts) dispatch({ type: 'SYNC_CONTACTS', payload: { device: 'player', contacts: story.player_contacts } });
            if (story.victim_contacts) dispatch({ type: 'SYNC_CONTACTS', payload: { device: 'victim', contacts: story.victim_contacts } });

            // --- Sync Recent Calls ---
            if (story.player_recent_calls) dispatch({ type: 'SYNC_RECENT_CALLS', payload: { device: 'player', calls: story.player_recent_calls } });
            if (story.victim_recent_calls) dispatch({ type: 'SYNC_RECENT_CALLS', payload: { device: 'victim', calls: story.victim_recent_calls } });

            // --- Sync Emails ---
            if (story.player_emails) dispatch({ type: 'SYNC_EMAILS', payload: { device: 'player', emails: story.player_emails } });
            if (story.victim_emails) dispatch({ type: 'SYNC_EMAILS', payload: { device: 'victim', emails: story.victim_emails } });

            // --- Sync Slack ---
            if (story.player_slack) dispatch({ type: 'SYNC_SLACK', payload: { device: 'player', slack: story.player_slack } });
            if (story.victim_slack) dispatch({ type: 'SYNC_SLACK', payload: { device: 'victim', slack: story.victim_slack } });

            // --- Sync Notes ---
            if (story.player_notes) dispatch({ type: 'SYNC_NOTES', payload: { device: 'player', notes: story.player_notes } });
            if (story.victim_notes) dispatch({ type: 'SYNC_NOTES', payload: { device: 'victim', notes: story.victim_notes } });

            // --- Sync Signal ---
            if (story.player_signal) dispatch({ type: 'SYNC_SIGNAL', payload: { device: 'player', signal: story.player_signal } });
            if (story.victim_signal) dispatch({ type: 'SYNC_SIGNAL', payload: { device: 'victim', signal: story.victim_signal } });

            // --- Sync Venmo ---
            if (story.player_venmo) dispatch({ type: 'SYNC_VENMO', payload: { device: 'player', venmo: story.player_venmo } });
            if (story.victim_venmo) dispatch({ type: 'SYNC_VENMO', payload: { device: 'victim', venmo: story.victim_venmo } });

            // --- Sync Voicemails ---
            if (story.player_voicemails) dispatch({ type: 'SYNC_VOICEMAILS', payload: { device: 'player', voicemails: story.player_voicemails } });
            if (story.victim_voicemails) dispatch({ type: 'SYNC_VOICEMAILS', payload: { device: 'victim', voicemails: story.victim_voicemails } });

            // --- Sync Notifications ---
            if (story.initialState?.notifications) {
                dispatch({
                    type: 'SYNC_NOTIFICATIONS',
                    payload: {
                        player: story.initialState.notifications.player || [],
                        victim: story.initialState.notifications.victim || []
                    }
                });
            }
        };

        load();
        const stopPolling = startPolling(2000);
        return () => stopPolling();
    }, [initializeStory, startPolling]);


    // Sync GameContext actions with StoryStore
    useEffect(() => {
        const handleStoryMessage = (e: any) => {
            const action = e.detail;
            const targetDevice = action.device || 'player';
            // Add notification or message to local state
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    device: targetDevice,
                    threadId: action.chat_id || action.sender,
                    sender: action.sender,
                    text: action.text
                }
            });
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    id: Date.now().toString(),
                    title: `Message from ${action.sender}`,
                    message: action.text,
                    app: 'Messages',
                    threadId: action.chat_id || action.sender,
                    device: targetDevice,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            });
        };

        const handleStoryNarration = (e: any) => {
            console.log('NARRATION:', e.detail.text);
            dispatch({
                type: 'SET_NARRATION',
                payload: {
                    ...e.detail,
                    id: e.detail.eventId
                }
            });
        };

        const handleStoryCall = (e: any) => {
            const action = e.detail;
            dispatch({
                type: 'SET_INCOMING_CALL',
                payload: {
                    name: action.caller_name || action.persona || 'Unknown',
                    personaKey: action.persona || 'unknown',
                    voice: action.voice || '',
                    device: action.device || 'player'
                }
            });
        };

        const handleStoryMonologue = (e: any) => {
            const action = e.detail;
            dispatch({ type: 'SET_MONOLOGUE', payload: action.text });
        };

        window.addEventListener('story-message', handleStoryMessage);
        window.addEventListener('story-narration', handleStoryNarration);
        window.addEventListener('story-call', handleStoryCall);
        window.addEventListener('story-monologue', handleStoryMonologue);

        return () => {
            window.removeEventListener('story-message', handleStoryMessage);
            window.removeEventListener('story-narration', handleStoryNarration);
            window.removeEventListener('story-call', handleStoryCall);
            window.removeEventListener('story-monologue', handleStoryMonologue);
        };
    }, [dispatch]);

    // Report app opens to story engine
    useEffect(() => {
        if (gameState.activeApp) {
            reportAction('app_opened', { app_id: gameState.activeApp });
        }
    }, [gameState.activeApp, reportAction]);

    return <>{children}</>;
};

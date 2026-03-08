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
                messages: (chat.messages || [])
                    // Only include messages that are already "in the past" — no triggerFlag
                    // and not decision_point entries (those are handled by the story engine)
                    .filter((msg: any) => !msg.triggerFlag && msg.type !== 'decision_point' && msg.senderId !== 'player')
                    .map((msg: any) => {
                        let sender = msg.senderId || msg.sender || 'Unknown';
                        // Normalize common IDs to display names
                        if (sender === 'player' || sender === 'jordan') sender = 'Jordan';
                        if (sender === 'maya' || sender === 'victim') sender = 'Maya';

                        return {
                            time: msg.time || new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            sender,
                            text: msg.content || msg.text || '',
                            day: msg.day || 'Today'
                        };
                    })
            }));

            const story = storyData.story;

            // --- Sync Chats ---
            if (story.playerChats) dispatch({ type: 'SYNC_CHATS', payload: { device: 'player', chats: formatChats(story.playerChats) } });
            if (story.victimChats) dispatch({ type: 'SYNC_CHATS', payload: { device: 'victim', chats: formatChats(story.victimChats) } });

            // --- Sync Contacts ---
            if (story.playerContacts) dispatch({ type: 'SYNC_CONTACTS', payload: { device: 'player', contacts: story.playerContacts } });
            if (story.victimContacts) dispatch({ type: 'SYNC_CONTACTS', payload: { device: 'victim', contacts: story.victimContacts } });

            // --- Sync Recent Calls ---
            if (story.playerRecentCalls) dispatch({ type: 'SYNC_RECENT_CALLS', payload: { device: 'player', calls: story.playerRecentCalls } });
            if (story.victimRecentCalls) dispatch({ type: 'SYNC_RECENT_CALLS', payload: { device: 'victim', calls: story.victimRecentCalls } });

            // --- Sync Emails ---
            if (story.playerEmails || story.playerMail) dispatch({ type: 'SYNC_EMAILS', payload: { device: 'player', emails: story.playerEmails || story.playerMail } });
            if (story.victimEmails || story.victimMail) dispatch({ type: 'SYNC_EMAILS', payload: { device: 'victim', emails: story.victimEmails || story.victimMail } });

            // --- Sync Slack ---
            const formatSlack = (slackObj: any) => {
                if (!slackObj) return [];
                if (Array.isArray(slackObj)) return slackObj;
                const result: any[] = [];
                if (slackObj.channels) {
                    slackObj.channels.forEach((c: any) => {
                        result.push({
                            channel: c.locked ? `${c.name} 🔒` : c.name,
                            messages: c.messages || []
                        });
                    });
                }
                if (slackObj.directMessages) {
                    slackObj.directMessages.forEach((dm: any) => {
                        result.push({
                            channel: `DM: ${dm.with || dm.name || dm.id}`,
                            messages: dm.messages || []
                        });
                    });
                }
                return result;
            };

            if (story.playerSlack) dispatch({ type: 'SYNC_SLACK', payload: { device: 'player', slack: formatSlack(story.playerSlack) } });
            if (story.victimSlack) dispatch({ type: 'SYNC_SLACK', payload: { device: 'victim', slack: formatSlack(story.victimSlack) } });
            // --- Sync Notes ---
            if (story.playerNotes) dispatch({ type: 'SYNC_NOTES', payload: { device: 'player', notes: story.playerNotes } });
            if (story.victimNotes) dispatch({ type: 'SYNC_NOTES', payload: { device: 'victim', notes: story.victimNotes } });

            // --- Sync Signal ---
            if (story.playerSignal) dispatch({ type: 'SYNC_SIGNAL', payload: { device: 'player', signal: story.playerSignal } });
            if (story.victimSignal) dispatch({ type: 'SYNC_SIGNAL', payload: { device: 'victim', signal: story.victimSignal } });

            // --- Sync Venmo ---
            if (story.playerVenmo) dispatch({ type: 'SYNC_VENMO', payload: { device: 'player', venmo: story.playerVenmo } });
            if (story.victimVenmo) dispatch({ type: 'SYNC_VENMO', payload: { device: 'victim', venmo: story.victimVenmo } });

            // --- Sync Voicemails ---
            if (story.playerVoicemails) dispatch({ type: 'SYNC_VOICEMAILS', payload: { device: 'player', voicemails: story.playerVoicemails } });
            if (story.victimVoicemails) dispatch({ type: 'SYNC_VOICEMAILS', payload: { device: 'victim', voicemails: story.victimVoicemails } });

            // --- Sync Photos ---
            if (story.playerPhotos) dispatch({ type: 'SYNC_PHOTOS', payload: { device: 'player', photos: story.playerPhotos } });
            if (story.victimPhotos) dispatch({ type: 'SYNC_PHOTOS', payload: { device: 'victim', photos: story.victimPhotos } });

            // --- Sync Maps ---
            if (story.playerMaps) dispatch({ type: 'SYNC_MAPS', payload: { device: 'player', maps: story.playerMaps } });
            if (story.victimMaps) dispatch({ type: 'SYNC_MAPS', payload: { device: 'victim', maps: story.victimMaps } });

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

            // --- Sync Progress ---
            // If the YAML defines unlockedApps in initialState, use them.
            if (story.initialState?.unlockedApps || story.initialState?.activeDevice) {
                dispatch({
                    type: 'SYNC_PROGRESS',
                    payload: {
                        unlockedApps: story.initialState.unlockedApps,
                        activeDevice: story.initialState.activeDevice
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

            // Characters on Maya's phone (victim device)
            const victimSenders = ['liam', 'priya', 'marcus', 'james', 'sophie', 'sarah', 'rachel', 'david'];
            const senderLower = (action.sender || '').toLowerCase();
            const isVictimSender = victimSenders.some(v => senderLower.includes(v));
            const targetDevice = action.device || (isVictimSender ? 'victim' : 'player');

            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    device: targetDevice,
                    threadId: action.chat_id || senderLower.replace(/\s+/g, '_') + '_messages',
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
                    threadId: action.chat_id || senderLower.replace(/\s+/g, '_') + '_messages',
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

        const handleStoryUnlockApp = (e: any) => {
            const action = e.detail;
            dispatch({ type: 'UNLOCK_APP', payload: action.appId });
        };

        const handleStoryNotification = (e: any) => {
            const content = e.detail;

            // Figure out which device to add this to.
            // Story notifications for Liam/Priya/David typically come to the victim phone (Maya's phone).
            // Signal/Unknown go to victim phone too. Player phone contacts go to player device.
            const senderName: string = content.from || '';
            const playerContacts = ['David Chen', 'Unknown Number', 'Unknown Contact (Signal)'];

            // Priority: explicit device in payload > fallback logic
            const targetDevice = content.device || (playerContacts.some(n => senderName.includes(n.split(' ')[0])) ? 'player' : 'victim');

            const notifId = Date.now().toString();

            // If the push notification has a message, also inject it as a thread message so the player can see it in context
            if (content.message || content.text) {
                const msgText = content.message || content.text;
                const sender = senderName || 'Unknown';
                // Derive a sensible thread ID from the sender name
                let threadId = content.chat_id ||
                    senderName.toLowerCase().replace(/[^a-z]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') + '_messages';

                // Mapping common name patterns to YAML IDs to avoid duplication
                if (!content.chat_id) {
                    if (senderName.includes('David')) threadId = targetDevice === 'player' ? 'player_david' : 'david_messages';
                    if (senderName.includes('Liam')) threadId = targetDevice === 'player' ? 'player_liam' : 'liam_messages';
                    if (senderName.includes('Priya')) threadId = 'priya_messages';
                    if (senderName.includes('Unknown')) threadId = targetDevice === 'player' ? 'player_unknown' : 'signal_unknown';
                }

                dispatch({
                    type: 'ADD_MESSAGE',
                    payload: { device: targetDevice, threadId, sender, text: msgText }
                });
            }

            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    id: notifId,
                    title: senderName || 'Notification',
                    message: content.message || content.text,
                    app: content.app || 'Messages',
                    device: targetDevice,
                    threadId: content.chat_id || content.threadId,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            });
        };

        window.addEventListener('story-message', handleStoryMessage);
        window.addEventListener('story-narration', handleStoryNarration);
        window.addEventListener('story-call', handleStoryCall);
        window.addEventListener('story-monologue', handleStoryMonologue);
        window.addEventListener('story-unlock-app', handleStoryUnlockApp);
        window.addEventListener('story-notification', handleStoryNotification);

        return () => {
            window.removeEventListener('story-message', handleStoryMessage);
            window.removeEventListener('story-narration', handleStoryNarration);
            window.removeEventListener('story-call', handleStoryCall);
            window.removeEventListener('story-monologue', handleStoryMonologue);
            window.removeEventListener('story-unlock-app', handleStoryUnlockApp);
            window.removeEventListener('story-notification', handleStoryNotification);
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

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Edit, Phone, Plus, Send, Video } from 'lucide-react';
import { geminiService } from '../services/ai/GeminiService';
import { storyEngine } from '../services/story-engine/StoryEngine';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';

export const MessagesApp = () => {
  const { state, dispatch } = useGame();
  const {
    state: storyState,
    reportAction,
    getConversationContext,
    isPersonaAvailable,
    updateConversationProgress,
  } = useStoryStore();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = state.messages[state.activeDevice];

  const getPersonaKey = (threadId: string | null) => {
    if (!threadId) return null;
    if (threadId === 'unknown') return 'unknown_contact';
    const key = threadId.replace('_messages', '').replace('_thread', '').replace('player_', '');
    if (storyState.personas[key]) return key;
    if (storyState.personas[`${key}_contact`]) return `${key}_contact`;
    return null;
  };

  const personaKey = getPersonaKey(activeThread);
  const activePersona = personaKey ? storyState.personas[personaKey] : null;
  const activeConversation = personaKey ? getConversationContext(personaKey, activeThread || undefined, 'Messages') : null;
  const activePersonaOnline = personaKey ? isPersonaAvailable(personaKey, activeThread || undefined, 'Messages') : false;

  useEffect(() => {
    if (activeThread) {
      dispatch({ type: 'CLEAR_APP_NOTIFICATIONS', payload: { device: state.activeDevice, app: 'Messages' } });
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread, dispatch, isTyping, messages, state.activeDevice]);

  useEffect(() => {
    if (state.pendingThreadOpen) {
      setActiveThread(state.pendingThreadOpen);
      dispatch({ type: 'OPEN_THREAD', payload: null });
    }
  }, [dispatch, state.pendingThreadOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeThread) return;

    const userText = inputValue.trim();
    setInputValue('');

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        device: state.activeDevice,
        threadId: activeThread,
        sender: 'You',
        text: userText,
      },
    });

    await reportAction('message_sent', {
      recipient_id: activeThread,
      content: userText,
    });

    if (!activePersona || !personaKey || !activePersonaOnline || activeConversation?.progress.finished) {
      return;
    }

    setIsTyping(true);

    const thread = messages.find(t => t.id === activeThread);
    if (!thread) {
      setIsTyping(false);
      return;
    }

    const pastHistory = thread.messages.map(msg => ({
      sender: (msg.sender === 'You' || msg.sender === 'Maya') ? 'user' : ('model' as const),
      id: msg.sender,
      text: msg.text,
    }));

    const history = [
      ...pastHistory.filter(message => message.text !== userText),
      { sender: 'user' as const, id: 'You', text: userText },
    ];

    const context = {
      state: storyState,
      personaId: personaKey,
      fullKnowledge: storyEngine.stories[useStoryStore.getState().currentStoryId || '']?.story.personaKnowledge,
      conversation: getConversationContext(personaKey, activeThread, 'Messages'),
    };

    try {
      const resolvedPrompt = activePersona.systemPrompt || activePersona.prompt || `You are ${thread.name}, a character in a mystery investigation.`;
      const reply = await geminiService.generateResponse(resolvedPrompt, history, context);

      setIsTyping(false);
      if (!reply) return;

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          device: state.activeDevice,
          threadId: activeThread,
          sender: thread.name,
          text: reply,
        },
      });

      const updatedHistory = [...history, { sender: 'model' as const, id: thread.name, text: reply }];
      await updateConversationProgress(personaKey, updatedHistory);
      useStoryStore.getState().evaluateObjectives(updatedHistory, activeThread);
    } catch (error) {
      console.error('MessagesApp: AI generation failed', error);
      setIsTyping(false);
    }
  };

  if (activeThread) {
    const thread = messages.find(messageThread => messageThread.id === activeThread);
    if (!thread) return null;

    const statusText = activeConversation?.progress.finished
      ? 'Conversation complete'
      : activePersonaOnline
        ? 'Online'
        : 'Offline';

    return (
      <div className="flex flex-col h-full min-h-0 bg-[#1a1818] text-[#e8d8c8]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3a3532] bg-[#2a2522]">
          <button onClick={() => setActiveThread(null)} className="text-[#5b8c6b]">
            <ChevronLeft size={24} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#9c5b5b] flex items-center justify-center text-sm font-bold">
            {thread.name[0]}
          </div>
          <div className="font-medium flex-1">
            <div>{thread.name}</div>
            <div className={`text-[10px] ${activePersonaOnline ? 'text-[#5b8c6b]' : 'text-[#a49484]'}`}>
              {statusText}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#5b8c6b]">
            <button
              onClick={() => {
                dispatch({ type: 'SET_CURRENT_CALL', payload: thread.name });
                dispatch({ type: 'OPEN_APP', payload: 'Phone' });
              }}
              className="hover:opacity-70 transition-opacity"
            >
              <Phone size={20} />
            </button>
            <Video size={20} className="opacity-50" />
          </div>
        </div>

        {activeConversation && (
          <div className="px-4 py-3 bg-[#201d1b] border-b border-[#3a3532]">
            {activeConversation.progress.finished ? (
              <div className="text-xs text-[#c8a86b]">You have what this thread can reliably give you.</div>
            ) : activeConversation.currentStage ? (
              <div className="text-xs text-[#a49484]">{activeConversation.currentStage.guidance}</div>
            ) : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.messages.map((msg, idx) => {
            const senderLower = msg.sender.toLowerCase();
            const isMe = senderLower === 'you' ||
              senderLower === 'me' ||
              senderLower === 'player' ||
              senderLower === 'victim' ||
              (state.activeDevice === 'victim' && (senderLower === 'maya' || senderLower === 'maya chen')) ||
              (state.activeDevice === 'player' && (senderLower === 'jordan' || senderLower === 'jordan reeves'));

            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${isMe
                    ? 'bg-[#5b8c6b] text-white rounded-br-sm'
                    : 'bg-[#3a3532] text-[#e8d8c8] rounded-bl-sm'
                    }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#a49484] mt-1 mx-1">{msg.time}</span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="bg-[#3a3532] text-[#e8d8c8] p-3 rounded-2xl rounded-bl-sm italic text-xs animate-pulse">
                Typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 pb-8 bg-[#2a2522] border-t border-[#3a3532] flex items-center gap-3">
          <button className="text-[#a49484] hover:text-[#e8d8c8] transition-colors">
            <Plus size={24} />
          </button>
          <div className="flex-1 bg-[#1a1818] rounded-full border border-[#3a3532] flex items-center px-4 py-2">
            <input
              type="text"
              placeholder={activeConversation?.progress.finished ? 'Thread complete' : activePersonaOnline ? 'iMessage' : 'Contact is offline'}
              className="flex-1 bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a49484]"
              disabled={!activePersonaOnline || !!activeConversation?.progress.finished}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              className={`${inputValue.trim() ? 'text-[#5b8c6b]' : 'text-[#a49484]'} ml-2 transition-colors`}
              disabled={!activePersonaOnline || !!activeConversation?.progress.finished}
              onClick={handleSendMessage}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#1a1818] text-[#e8d8c8]">
      <div className="px-6 py-4 border-b border-[#3a3532] text-2xl font-bold bg-[#1a1818] flex justify-between items-center">
        <span>Messages</span>
        <button className="text-[#5b8c6b]">
          <Edit size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.map((thread) => {
          const lastMsg = thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
          const threadPersonaKey = getPersonaKey(thread.id);
          const threadConversation = threadPersonaKey ? getConversationContext(threadPersonaKey, thread.id, 'Messages') : null;
          const threadOnline = threadPersonaKey ? isPersonaAvailable(threadPersonaKey, thread.id, 'Messages') : false;

          return (
            <div
              key={thread.id}
              onClick={() => {
                setActiveThread(thread.id);
                reportAction('thread_opened', { thread_id: thread.id, app_id: 'Messages' });
              }}
              className="flex items-center gap-4 p-4 border-b border-[#3a3532]/50 cursor-pointer active:bg-[#2a2522] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#9c5b5b] shrink-0 flex items-center justify-center text-xl font-bold">
                {thread.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-medium truncate flex items-center gap-2">
                    {thread.name}
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${threadOnline ? 'bg-[#5b8c6b]' : 'bg-[#a49484]'}`}
                      title={threadConversation?.progress.finished ? 'Conversation complete' : threadOnline ? 'Online' : 'Offline'}
                    />
                  </div>
                  {lastMsg && <div className="text-[10px] text-[#a49484] shrink-0 ml-2">{lastMsg.time}</div>}
                </div>
                <div className="text-xs text-[#a49484] truncate flex items-center gap-1.5">
                  <span className={threadOnline ? 'text-[#5b8c6b] font-medium' : 'font-medium'}>
                    {threadConversation?.progress.finished ? 'Complete' : threadOnline ? 'Online' : 'Offline'}
                  </span>
                  <span className="opacity-20">•</span>
                  <span className="truncate">{lastMsg ? lastMsg.text : 'New conversation'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

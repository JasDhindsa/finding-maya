import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Image as ImageIcon, Plus, Phone, Video, Edit } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { geminiService } from '../services/ai/GeminiService';
import { storyEngine } from '../services/story-engine/StoryEngine';

export const MessagesApp = () => {
  const { state, dispatch } = useGame();
  const { state: storyState, reportAction } = useStoryStore();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = state.messages[state.activeDevice];
  const activePersona = activeThread ? (storyState.personas[activeThread] || (activeThread === 'unknown' ? storyState.personas['unknown'] : null)) : null;

  useEffect(() => {
    if (activeThread) {
      dispatch({ type: 'CLEAR_APP_NOTIFICATIONS', payload: { device: state.activeDevice, app: 'Messages' } });
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread, messages, isTyping]);

  useEffect(() => {
    if (state.pendingThreadOpen) {
      setActiveThread(state.pendingThreadOpen);
      dispatch({ type: 'OPEN_THREAD', payload: null });
    }
  }, [state.pendingThreadOpen, dispatch]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeThread) return;

    const userText = inputValue.trim();
    setInputValue('');

    // 1. Add player message to local state
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        device: state.activeDevice,
        threadId: activeThread,
        sender: 'You',
        text: userText
      }
    });

    // 2. Report to story engine
    await reportAction('message_sent', {
      recipient_id: activeThread,
      content: userText
    });

    // 3. Trigger AI response if it's a person/system we have a persona for
    const persona = activePersona;

    if (persona) {
      if (!persona.online) {
        console.log(`MessagesApp: ${activeThread} is offline, no AI response.`);
        return;
      }
      console.log(`MessagesApp: Triggering AI response for ${activeThread}...`);
      setIsTyping(true);

      // Artificial delay to simulate thinking
      setTimeout(async () => {
        const thread = messages.find(t => t.id === activeThread);
        if (!thread) {
          setIsTyping(false);
          return;
        }

        // Construct history for Gemini
        const history = thread.messages.map(msg => ({
          sender: (msg.sender === 'You' || msg.sender === 'Maya') ? 'user' : 'model' as 'user' | 'model',
          id: msg.sender,
          text: msg.text
        }));

        const context = {
          state: storyState,
          personaId: activeThread,
          fullKnowledge: storyEngine.stories[useStoryStore.getState().currentStoryId || '']?.story.personaKnowledge
        };

        try {
          const reply = await geminiService.generateResponse(persona.prompt, history, context);
          console.log(`MessagesApp: AI responded: "${reply}"`);

          setIsTyping(false);
          if (reply) {
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                device: state.activeDevice,
                threadId: activeThread,
                sender: thread.name,
                text: reply
              }
            });
          }
        } catch (err) {
          console.error("MessagesApp: AI Generation failed", err);
          setIsTyping(false);
        }
      }, 1500);
    } else {
      console.warn(`MessagesApp: No persona found for ${activeThread}`);
    }
  };

  if (activeThread) {
    const thread = messages.find((m) => m.id === activeThread);
    if (!thread) return null;

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
            <div className={`text-[10px] ${activePersona?.online ? 'text-[#5b8c6b]' : 'text-[#a49484]'}`}>
              {activePersona?.online ? '• Online' : '• Offline'}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.messages.map((msg, idx) => {
            const senderLower = msg.sender.toLowerCase();
            const isMe = senderLower === 'you' ||
              senderLower === 'me' ||
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
              placeholder="iMessage"
              className="flex-1 bg-transparent outline-none text-sm text-[#e8d8c8] placeholder-[#a49484]"
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
          return (
            <div
              key={thread.id}
              onClick={() => setActiveThread(thread.id)}
              className="flex items-center gap-4 p-4 border-b border-[#3a3532]/50 cursor-pointer active:bg-[#2a2522] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#9c5b5b] flex-shrink-0 flex items-center justify-center text-xl font-bold">
                {thread.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="font-medium truncate flex items-center gap-2">
                    {thread.name}
                    <div className={`w-1.5 h-1.5 rounded-full ${storyState.personas[thread.id]?.online ? 'bg-[#5b8c6b]' : 'bg-[#a49484]'}`} title={storyState.personas[thread.id]?.online ? 'Online' : 'Offline'} />
                  </div>
                  {lastMsg && <div className="text-[10px] text-[#a49484] flex-shrink-0 ml-2">{lastMsg.time}</div>}
                </div>
                <div className="text-xs text-[#a49484] truncate flex items-center gap-1.5">
                  <span className={storyState.personas[thread.id]?.online ? 'text-[#5b8c6b] font-medium' : 'font-medium'}>
                    {storyState.personas[thread.id]?.online ? 'Online' : 'Offline'}
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

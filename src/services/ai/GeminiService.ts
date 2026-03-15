export interface ChatMessage {
    sender: 'user' | 'model' | 'system';
    id: string; // The character ID or 'me'
    text: string;
    type?: 'text' | 'image' | 'typing';
}

interface ConversationContext {
    progress: {
        completedStageIds: string[];
        knownFacts: string[];
        finished: boolean;
    };
    currentStage: {
        id: string;
        guidance: string;
        playerShouldKnow?: string[];
    } | null;
}

import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

export class GeminiService {
    private ai: GoogleGenAI | null = null;

    constructor() {
        if (GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        }
    }

    async generateResponse(
        systemPrompt: string,
        history: ChatMessage[],
        context?: {
            state: any,
            personaId: string,
            fullKnowledge?: Record<string, any>,
            conversation?: ConversationContext | null,
        }
    ): Promise<string | null> {
        if (!this.ai) {
            console.error('GeminiService: Gemini API Key missing');
            return null;
        }

        try {
            let knowledgeContent = "";
            let objectiveContent = "";

            if (context) {
                const { state, personaId, fullKnowledge, conversation } = context;

                // Add current objectives
                if (state.currentObjectives?.length > 0) {
                    objectiveContent = "\n=== CURRENT STORY OBJECTIVES ===\n" +
                        state.currentObjectives.map((obj: any) => `- ${obj.description}`).join('\n');
                }

                // Add unlocked knowledge for this persona
                const unlockedIds = state.unlockedKnowledge?.[personaId] || [];
                const personaFullKnowledge = fullKnowledge?.[personaId]?.locked || {};

                if (unlockedIds.length > 0) {
                    knowledgeContent = "\n=== UNLOCKED KNOWLEDGE (You know this and can talk about it) ===\n" +
                        unlockedIds.map((id: string) => {
                            const detail = personaFullKnowledge[id];
                            return `- ${id}${detail ? ': ' + detail : ''}`;
                        }).join('\n');
                }

                if (conversation) {
                    const stageContent = conversation.currentStage
                        ? `\n=== CURRENT CONVERSATION STAGE ===\nStage: ${conversation.currentStage.id}\nGuidance: ${conversation.currentStage.guidance}`
                        : '\n=== CURRENT CONVERSATION STAGE ===\nNo live conversation stage is currently active.';

                    const learnedFacts = conversation.progress.knownFacts.length > 0
                        ? "\n=== FACTS THE PLAYER SHOULD ALREADY UNDERSTAND ===\n" + conversation.progress.knownFacts.map((fact: string) => `- ${fact}`).join('\n')
                        : '';

                    knowledgeContent += stageContent + learnedFacts;
                }
            }

            const systemContent = `
You are currently roleplaying a character in an immersive mystery game. 

=== CONTEXT & SITUATION ===
- You are texting with Jordan Reeves.
- Jordan is using the phone of your coworker/friend Maya Chen. 
- Maya died last night (Thursday) falling from her balcony. The police say it was an accident.
- Jordan is investigating her death. Jordan does not trust anyone.
- IMPORTANT: You DO NOT magically know that Jordan is using Maya's phone unless the chat history shows Jordan telling you, or your Unlocked Knowledge mentions it. If someone texts you from this number and doesn't identify themselves, you should assume it's Maya or be confused about who it is if it doesn't sound like her.

=== CORE INSTRUCTIONS ===
1. YOU ARE THE CHARACTER. Respond naturally like a real person texting from their phone. Do NOT sound like an AI assistant.
2. NEVER prefix your responses with your name.
3. Keep messages relatively concise, typical for SMS, but feel free to be expressive, defensive, evasive, or emotional depending on the context.
4. ADHERE TO YOUR KNOWLEDGE. You only know what is in your "Unlocked Knowledge" and "Identity".
5. DO NOT volunteer answers easily. If Jordan accuses you, be defensive. If they ask about something you don't know, deflect or act confused. 
6. If Jordan states a random fake fact or unsupported detail, do NOT accept it as true. Either challenge it, ask where they got it, or say you can't confirm it.
7. Stay inside the current conversation stage. Do not skip ahead to future reveals unless the unlocked knowledge explicitly supports it.
8. Do NOT randomly end the conversation or say goodbye unless it makes sense.

=== YOUR IDENTITY & CURRENT KNOWLEDGE ===
${systemPrompt}
${objectiveContent}
${knowledgeContent}
      `.trim();

            const messages = [
                ...history.slice(-10).map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{text: msg.text}]
                }))
            ];

            const tools = [{
                functionDeclarations: [
                    {
                        name: "recall_memory",
                        description: "Search your latent memory for specific hidden knowledge you might have about a topic, location, or person.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                query: {
                                    type: "STRING",
                                    description: "The name, topic, or keyword to silently recall about (e.g., 'Fort Point', 'Maya', 'flash drive')."
                                }
                            },
                            required: ["query"]
                        }
                    }
                ]
            }];

            console.log("GeminiService: Requesting Gemini Agent...");
            let response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: messages,
                config: {
                    systemInstruction: systemContent,
                    temperature: 0.45,
                    tools: tools as any
                }
            });

            // Agent Loop: Check if the model decided to call a tool
            if (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                console.log(`GeminiService: Agent called tool ${call.name} with args`, call.args);

                let toolResult = "No relevant memory found.";
                if (call.name === "recall_memory") {
                    const query = (call.args as any).query?.toLowerCase() || '';
                    
                    // Search actual Zustand state / fullKnowledge passed in via context
                    if (context && context.fullKnowledge && context.personaId) {
                        const personaKnowledge = context.fullKnowledge[context.personaId];
                        
                        if (personaKnowledge && Array.isArray(personaKnowledge.locked)) {
                            // Find any locked knowledge piece that matches the query
                            const matches = personaKnowledge.locked.filter((lk: any) => 
                                (lk.text && lk.text.toLowerCase().includes(query)) || 
                                (lk.id && lk.id.toLowerCase().includes(query)) ||
                                (lk.unlocksWhen && lk.unlocksWhen.toLowerCase().includes(query))
                            );
                            
                            if (matches.length > 0) {
                                toolResult = "Recalled memory: " + matches.map((m: any) => m.text).join(" | ");
                            } else {
                                toolResult = `No specific memories found for '${query}'.`;
                            }
                        }
                    }
                }

                // Add the model's tool call and our tool response to the conversation history
                messages.push(
                    { role: 'model', parts: [{ functionCall: call }] } as any,
                    { 
                        role: 'user', 
                        parts: [{ 
                            functionResponse: {
                                name: call.name,
                                response: { result: toolResult }
                            }
                        }] 
                    } as any
                );

                // Call the model again with the tool's result so it can construct its final answer
                response = await this.ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: messages,
                    config: {
                        systemInstruction: systemContent,
                        temperature: 0.45,
                        tools: tools as any
                    }
                });
            }

            let text = response.text || '';
            if (!text) return null;

            // Clean up response — strip character name prefixes like "Liam: "
            text = text.replace(/^\[?[\w\s]+\]?:\s*/, '').trim();
            text = text.replace(/^[\[\]\:\s]+/, '').replace(/[\[\]\:\s]+$/, '').trim();
            if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
                text = text.substring(1, text.length - 1);
            }

            return text || null;
        } catch (error) {
            console.error('GeminiService: Error generating response', error);
            return null;
        }
    }

    async evaluateObjective(
        objective: string,
        history: ChatMessage[]
    ): Promise<boolean> {
        if (!this.ai) return false;

        try {
            const systemPrompt = `You are a game narrative evaluator. Your job is to read a chat transcript between a player and a character, and determine if the player has achieved a specific narrative objective.\n\nOBJECTIVE:\n"${objective}"\n\nAnalyze the conversation and return ONLY a JSON object with a single boolean property "achieved". For example: {"achieved": true} or {"achieved": false}. Do not return any other text.`;

            const conversation = history.map(msg => `${msg.sender === 'user' ? 'Player' : 'Character'}: ${msg.text}`).join('\n');

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: conversation,
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            });

            let rawText = response.text || '';
            if (!rawText) return false;

            try {
                // Extract JSON object from the response
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : rawText;
                const result = JSON.parse(jsonStr);
                return !!result.achieved;
            } catch (e) {
                console.error("Failed to parse JSON from evaluator", rawText);
                return false;
            }
        } catch (error) {
            console.error('GeminiService: Error evaluating objective', error);
            return false;
        }
    }
}

export const geminiService = new GeminiService();

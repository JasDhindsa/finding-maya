export interface ChatMessage {
    sender: 'user' | 'model' | 'system';
    id: string; // The character ID or 'me'
    text: string;
    type?: 'text' | 'image' | 'typing';
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class GeminiService {
    async generateResponse(
        systemPrompt: string,
        history: ChatMessage[],
        context?: {
            state: any,
            personaId: string,
            fullKnowledge?: Record<string, any>
        }
    ): Promise<string | null> {
        if (!OPENROUTER_API_KEY) {
            console.error('GeminiService: OpenRouter API Key missing');
            return null;
        }

        try {
            let knowledgeContent = "";
            let objectiveContent = "";

            if (context) {
                const { state, personaId, fullKnowledge } = context;

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
            }

            const systemContent = `
You are currently roleplaying a character in an immersive mystery game. 

=== CORE INSTRUCTIONS ===
1. YOU ARE THE CHARACTER. Do not break character. Do not act like an AI.
2. USE THE MEMORY. The context below describes your current situation and what you know.
3. ADHERE TO YOUR KNOWLEDGE. Do not talk about things that are NOT in your "Unlocked Knowledge" or your "Identity".
4. If a user asks about something you don't know, stay in character and act confused or deflect.
5. DO NOT prefix your messages with your name.
6. Keep messages concise and natural for a text message.
7. If the user goes off-topic, gently nudge them back to the investigation.

=== YOUR IDENTITY ===
${systemPrompt}
${objectiveContent}
${knowledgeContent}
      `.trim();

            const messages = [
                { role: "system", content: systemContent },
                ...history.slice(-10).map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }))
            ];

            console.log("GeminiService: Requesting OpenRouter with fetch...");
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "The Silence Between Bells",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "arcee-ai/trinity-large-preview:free",
                    messages: messages,
                    max_tokens: 200,
                    temperature: 0.7,
                    provider: {
                        data_collection: "allow"
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`GeminiService: OpenRouter Error ${response.status} ${response.statusText}`, JSON.stringify(errorData));
                return null;
            }

            const data = await response.json();
            let text = data.choices?.[0]?.message?.content;
            if (!text) return null;

            // Clean up response
            text = text.replace(/^\[?[\w\s]+\]?:\s*/, '').trim();
            if (text.includes('\n')) {
                text = text.split('\n')[0];
            }
            text = text.replace(/^[\[\]\:\s]+/, '').replace(/[\[\]\:\s]+$/, '').trim();
            if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
                text = text.substring(1, text.length - 1);
            }

            return text;
        } catch (error) {
            console.error('GeminiService: Error generating response', error);
            return null;
        }
    }
}

export const geminiService = new GeminiService();

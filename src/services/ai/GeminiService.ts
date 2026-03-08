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
6. Do NOT randomly end the conversation or say goodbye unless it makes sense.

=== YOUR IDENTITY & CURRENT KNOWLEDGE ===
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
                    model: "qwen/qwen3-vl-235b-a22b-thinking",
                    messages: messages,
                    max_tokens: 300,
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
            let text: string = data.choices?.[0]?.message?.content || '';
            if (!text) return null;

            // Strip thinking model <think>...</think> blocks (qwen3 reasoning)
            text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

            // After stripping think blocks, take the last non-empty line as the actual reply
            const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
            text = lines[lines.length - 1] || '';
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
        if (!OPENROUTER_API_KEY) return false;

        try {
            const systemPrompt = `You are a game narrative evaluator. Your job is to read a chat transcript between a player and a character, and determine if the player has achieved a specific narrative objective.\n\nOBJECTIVE:\n"${objective}"\n\nAnalyze the conversation and return ONLY a JSON object with a single boolean property "achieved". For example: {"achieved": true} or {"achieved": false}. Do not return any other text.`;

            const conversation = history.map(msg => `${msg.sender === 'user' ? 'Player' : 'Character'}: ${msg.text}`).join('\n');

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "The Silence Between Bells",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "qwen/qwen3-vl-235b-a22b-thinking",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: conversation }
                    ],
                    temperature: 0.1
                })
            });

            if (!response.ok) return false;
            const data = await response.json();
            let rawText: string = data.choices?.[0]?.message?.content || '';
            if (!rawText) return false;

            // Strip <think>...</think> blocks from reasoning models
            rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

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

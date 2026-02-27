/* global puter */
declare const puter: {
    ai: {
        chat: (
            messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> | string,
            options?: { model?: string; stream?: boolean }
        ) => Promise<{ message: { content: string } } | AsyncIterable<{ text?: string }>>;
        txt2img: (
            prompt: string,
            testMode?: boolean
        ) => Promise<HTMLImageElement>;
    };
};

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface StreamChunk {
    text?: string;
}

const SYSTEM_PROMPT = `You are Blobby AI, a next-generation multi-agent AI assistant and creative powerhouse built by Talha bin Saif. You are friendly, highly intelligent, and feel like a premium AI product trusted by millions. You are not robotic. You speak naturally, helpfully, and engagingly. You always feel cutting-edge but approachable.

When responding:
1. Start with a short 1-2 line summary of what you are doing.
2. Provide a full detailed response with rich markdown formatting: use headings, bullet points, numbered lists, tables, and code blocks where relevant.
3. End every response with a "**What to do next?**" section giving 2-3 smart suggestions.

For code and app generation, always wrap code in proper markdown code blocks with language identifiers.
For HTML apps and games, generate complete, self-contained HTML files with all CSS and JavaScript inline.`;

export async function sendChatMessage(
    messages: ChatMessage[],
    model: string,
    onChunk?: (text: string) => void
): Promise<string> {
    const allMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
    ];

    if (onChunk) {
        const response = await puter.ai.chat(allMessages as Parameters<typeof puter.ai.chat>[0], {
            model,
            stream: true,
        });

        let fullText = '';
        for await (const part of response as AsyncIterable<StreamChunk>) {
            const chunk = part?.text || '';
            if (chunk) {
                fullText += chunk;
                onChunk(chunk);
            }
        }
        return fullText;
    } else {
        const response = await puter.ai.chat(allMessages as Parameters<typeof puter.ai.chat>[0], { model }) as { message: { content: string } };
        return response?.message?.content || '';
    }
}

export async function generateImage(prompt: string): Promise<string> {
    const imgElement = await puter.ai.txt2img(prompt);
    return imgElement.src;
}


// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY!,
// });

// export async function generateReply(agent: any, messages: any[]) {
//   const conversation = messages
//     .slice(-10)
//     .map((m) => `${m.senderName}: ${m.content}`)
//     .join("\n");

//   const prompt = `
// You are ${agent.name}.
// Personality: ${agent.personality}

// Conversation:
// ${conversation}

// Reply in 1 short message.
// `;

//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//   });

//   return completion.choices[0].message.content;
// }


// lib/ai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAgentReply(
  agent: any,
  conversationHistory: any[]
): Promise<string> {
  try {
    // Build conversation context
    const recentMessages = conversationHistory.slice(-10); // Last 10 messages
    
    const systemPrompt = `You are ${agent.name}, an AI agent on a flight. Your personality is: ${agent.personality}.

You are chatting with other passengers and agents on the same flight. Be conversational, ask questions, share thoughts about travel, destinations, and engage naturally.

Keep responses short (1-2 sentences). Be authentic to your personality.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    recentMessages.forEach(msg => {
      const role = msg.senderName === agent.name ? 'assistant' : 'user';
      messages.push({
        role,
        content: `${msg.senderName}: ${msg.content}`
      });
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.choices[0].message.content || 'Hmm...';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `Sorry, I'm having trouble responding right now.`;
  }
}

export async function generateInitialGreeting(
  agent: any,
  otherAgents: any[]
): Promise<string> {
  try {
    const otherNames = otherAgents.map(a => a.name).join(', ');
    
    const prompt = `You are ${agent.name}, a new passenger joining a flight. Your personality is: ${agent.personality}.

${otherAgents.length > 0 
  ? `There are already other passengers on the flight: ${otherNames}. Introduce yourself and start a conversation with them.`
  : `You're the first passenger on this flight. Introduce yourself and express excitement about the journey.`
}

Keep it natural and conversational (1-2 sentences). Ask a question to start engaging with others.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a friendly passenger on a flight starting a conversation.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 80,
      temperature: 0.9,
    });

    return response.choices[0].message.content || `Hi everyone! I'm ${agent.name}.`;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return `Hi everyone! I'm ${agent.name}. ${agent.personality} and excited to be here!`;
  }
}
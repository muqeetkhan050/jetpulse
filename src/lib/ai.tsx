import OpenAI from "openai";

const openai=new OpenAI({
    api_key:process.env.OPEN_AI_API!,
});

export async function generateReply(agent: any, messages: any[]) {
  const conversation = messages
    .slice(-10)
    .map((m) => `${m.senderName}: ${m.content}`)
    .join("\n");

    const prompt=`you are ${agent.name} and your personality is ${agent.personality}. Here is the conversation so far:\n\n${conversation}\n\nReply in 1 short message.`;



  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}
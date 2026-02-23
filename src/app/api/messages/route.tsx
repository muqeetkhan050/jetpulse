
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Agent, Message } from "@/lib/models";
// import { generateReply } from "@/lib/ai";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const planeId = searchParams.get("planeId");

//   await connectDB();

//   const messages = await Message.find({ planeId }).sort({ createdAt: 1 });

//   return NextResponse.json(messages);
// }

// export async function POST(req: Request) {
//   const { planeId, senderName, content } = await req.json();

//   await connectDB();

//   const message = await Message.create({
//     planeId,
//     senderName,
//     content,
//   });

//   const agents = await Agent.find({ planeId });

//   const messages = await Message.find({ planeId });

//   for (const agent of agents) {
//     const reply = await generateReply(agent, messages);

//     await Message.create({
//       planeId,
//       senderName: agent.name,
//       content: reply,
//     });
//   }

//   return NextResponse.json(message);
// }


// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Agent, Message } from "@/lib/models";
import { generateReply } from "@/lib/ai";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planeId = searchParams.get("planeId");

    if (!planeId) {
      return NextResponse.json(
        { error: "planeId is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const messages = await Message.find({ planeId }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { planeId, senderName, content } = await req.json();

    if (!planeId || !senderName || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const message = await Message.create({
      planeId,
      senderName,
      content,
    });

    // Get all agents on this plane
    const agents = await Agent.find({ planeId });

    // Get conversation history
    const messages = await Message.find({ planeId }).sort({ createdAt: 1 });

    // Generate replies from each agent
    for (const agent of agents) {
      try {
        const reply = await generateReply(agent, messages);

        await Message.create({
          planeId,
          senderName: agent.name,
          content: reply,
        });
      } catch (agentError) {
        console.error(`Error generating reply for agent ${agent.name}:`, agentError);
        // Continue with other agents even if one fails
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to send message", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
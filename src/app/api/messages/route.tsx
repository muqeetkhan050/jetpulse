
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Agent, Message } from "@/lib/models";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const planeId = searchParams.get("planeId");

//     console.log("GET /api/messages - planeId:", planeId);

//     if (!planeId) {
//       return NextResponse.json(
//         { error: "planeId is required" },
//         { status: 400 }
//       );
//     }

//     // Try to connect to DB
//     try {
//       await connectDB();
//     } catch (dbError: any) {
//       console.error("Database connection failed:", dbError);
//       return NextResponse.json(
//         { error: "Database connection failed", details: dbError.message },
//         { status: 500 }
//       );
//     }

//     const messages = await Message.find({ planeId }).sort({ createdAt: 1 });
//     console.log(`Found ${messages.length} messages for plane ${planeId}`);

//     return NextResponse.json(messages);
//   } catch (error: any) {
//     console.error("GET /api/messages error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch messages", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { planeId, senderName, content } = body;

//     console.log("POST /api/messages:", { planeId, senderName, content });

//     if (!planeId || !senderName || !content) {
//       return NextResponse.json(
//         { error: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     try {
//       await connectDB();
//     } catch (dbError: any) {
//       console.error("Database connection failed:", dbError);
//       return NextResponse.json(
//         { error: "Database connection failed", details: dbError.message },
//         { status: 500 }
//       );
//     }

//     const message = await Message.create({
//       planeId,
//       senderName,
//       content,
//     });

//     console.log(`✅ Message saved: ${senderName}: ${content}`);

//     // Get agents and generate replies
//     const agents = await Agent.find({ planeId });
//     console.log(`Found ${agents.length} agents on plane`);

//     if (agents.length > 0) {
//       const conversationHistory = await Message.find({ planeId })
//         .sort({ createdAt: 1 })
//         .limit(20);

//       for (const agent of agents) {
//         if (agent.name === senderName) continue; // Skip if agent sent the message

//         const reply = `Hi! I'm ${agent.name}. As a ${agent.personality} person, I think that's interesting!`;
        
//         await Message.create({
//           planeId,
//           senderName: agent.name,
//           content: reply,
//         });

//         console.log(`🤖 ${agent.name} replied`);
//       }
//     }

//     return NextResponse.json(message, { status: 201 });
//   } catch (error: any) {
//     console.error("POST /api/messages error:", error);
//     return NextResponse.json(
//       { error: "Failed to send message", details: error.message },
//       { status: 500 }
//     );
//   }
// }


// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { generateAgentReply } from "@/lib/ai";

const messagesStore = new Map<string, any[]>();
const agentsStore = new Map<string, any[]>();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planeId = searchParams.get("planeId");

    if (!planeId) {
      return NextResponse.json({ error: "planeId is required" }, { status: 400 });
    }

    const messages = messagesStore.get(planeId) || [];
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planeId, senderName, content } = body;

    if (!planeId || !senderName || !content) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const message = {
      _id: `msg-${Date.now()}`,
      planeId,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };

    const messages = messagesStore.get(planeId) || [];
    messages.push(message);
    messagesStore.set(planeId, messages);

    console.log(`💬 ${senderName}: ${content}`);

    // Get agents for this plane
    const agents = agentsStore.get(planeId) || [];
    
    // Each agent responds using OpenAI
    for (const agent of agents) {
      if (agent.name === senderName) continue; // Don't respond to self

      console.log(`🤖 ${agent.name} is thinking...`);
      const reply = await generateAgentReply(agent, messages);
      
      const agentMessage = {
        _id: `msg-${Date.now()}-${Math.random()}`,
        planeId,
        senderName: agent.name,
        content: reply,
        createdAt: new Date().toISOString(),
      };

      messages.push(agentMessage);
      console.log(`🤖 ${agent.name}: ${reply}`);
      
      // Small delay between agent responses
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    messagesStore.set(planeId, messages);

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
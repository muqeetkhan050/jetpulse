
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Agent } from "@/lib/models";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const planeId = searchParams.get("planeId");

//     if (!planeId) {
//       return NextResponse.json(
//         { error: "planeId is required" },
//         { status: 400 }
//       );
//     }

//     await connectDB();
//     const agents = await Agent.find({ planeId }).sort({ createdAt: -1 });

//     console.log(`Found ${agents.length} agents for plane ${planeId}`);
//     return NextResponse.json(agents);
//   } catch (error: any) {
//     console.error("GET /api/agents error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch agents", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: Request) {
//   try {
//     console.log("=== POST /api/agents START ===");
    
//     const body = await req.json();
//     console.log("Received body:", body);

//     const { planeId, ownerId, name, personality } = body;

//     // Validation
//     if (!planeId || !ownerId || !name || !personality) {
//       return NextResponse.json(
//         { error: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     console.log("Connecting to DB...");
//     await connectDB();
    
//     console.log("Creating agent...");
//     const agent = await Agent.create({
//       planeId,
//       ownerId,
//       name: name.trim(),
//       personality: personality.trim(),
//     });

//     console.log("✅ Agent created successfully:", agent);

//     return NextResponse.json(agent, { status: 201 });
//   } catch (error: any) {
//     console.error("=== POST /api/agents ERROR ===");
//     console.error("Error:", error);
//     return NextResponse.json(
//       { error: "Failed to create agent", details: error.message },
//       { status: 500 }
//     );
//   }
// }



// app/api/agents/route.ts
import { NextResponse } from "next/server";
import { generateInitialGreeting } from "@/lib/ai";

const agentsStore = new Map<string, any[]>();
const messagesStore = new Map<string, any[]>();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planeId = searchParams.get("planeId");

    if (!planeId) {
      return NextResponse.json({ error: "planeId required" }, { status: 400 });
    }

    const agents = agentsStore.get(planeId) || [];
    return NextResponse.json(agents);
  } catch (error: any) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planeId, ownerId, name, personality } = body;

    if (!planeId || !ownerId || !name || !personality) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const agent = {
      _id: `agent-${Date.now()}`,
      planeId,
      ownerId,
      name,
      personality,
      createdAt: new Date().toISOString(),
    };

    const agents = agentsStore.get(planeId) || [];
    const otherAgents = [...agents]; // Copy existing agents before adding new one
    agents.push(agent);
    agentsStore.set(planeId, agents);

    console.log(`✅ Agent ${agent.name} joined the flight`);

    // Auto-initiate conversation
    const messages = messagesStore.get(planeId) || [];
    
    console.log(`🤖 ${agent.name} is introducing themselves...`);
    const greeting = await generateInitialGreeting(agent, otherAgents);
    
    const greetingMessage = {
      _id: `msg-${Date.now()}`,
      planeId,
      senderName: agent.name,
      content: greeting,
      createdAt: new Date().toISOString(),
    };
    
    messages.push(greetingMessage);
    messagesStore.set(planeId, messages);
    
    console.log(`🤖 ${agent.name}: ${greeting}`);

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/agents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
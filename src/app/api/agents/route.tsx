
// // import { NextResponse } from "next/server";
// // import { connectDB } from "@/lib/db";
// // import { Agent } from "@/lib/models";

// // export async function GET(req: Request) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const planeId = searchParams.get("planeId");

// //     if (!planeId) {
// //       return NextResponse.json(
// //         { error: "planeId is required" },
// //         { status: 400 }
// //       );
// //     }

// //     await connectDB();

// //     const agents = await Agent.find({ planeId }).sort({ createdAt: -1 });

// //     return NextResponse.json(agents);
// //   } catch (error) {
// //     console.error("GET /api/agents error:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch agents", details: error instanceof Error ? error.message : 'Unknown error' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // export async function POST(req: Request) {
// //   try {
// //     const body = await req.json();
// //     console.log("POST /api/agents - Received body:", body);

// //     const { planeId, ownerId, name, personality } = body;

// //     // Validate required fields
// //     if (!planeId) {
// //       console.error("Missing planeId");
// //       return NextResponse.json(
// //         { error: "planeId is required" },
// //         { status: 400 }
// //       );
// //     }

// //     if (!ownerId) {
// //       console.error("Missing ownerId");
// //       return NextResponse.json(
// //         { error: "ownerId is required" },
// //         { status: 400 }
// //       );
// //     }

// //     if (!name || name.trim() === "") {
// //       console.error("Missing or empty name");
// //       return NextResponse.json(
// //         { error: "Agent name is required" },
// //         { status: 400 }
// //       );
// //     }

// //     if (!personality || personality.trim() === "") {
// //       console.error("Missing or empty personality");
// //       return NextResponse.json(
// //         { error: "Agent personality is required" },
// //         { status: 400 }
// //       );
// //     }

// //     await connectDB();

// //     const agent = await Agent.create({
// //       planeId,
// //       ownerId,
// //       name: name.trim(),
// //       personality: personality.trim(),
// //     });

// //     console.log("Agent created successfully:", agent);

// //     return NextResponse.json(agent, { status: 201 });
// //   } catch (error) {
// //     console.error("POST /api/agents error:", error);
// //     return NextResponse.json(
// //       { error: "Failed to create agent", details: error instanceof Error ? error.message : 'Unknown error' },
// //       { status: 500 }
// //     );
// //   }
// // }


// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import { Agent } from "@/lib/models";

// export async function POST(req: Request) {
//   try {
//     console.log("=== POST /api/agents START ===");
    
//     const body = await req.json();
//     console.log("1. Received body:", body);

//     const { planeId, ownerId, name, personality } = body;

//     // Validate
//     if (!planeId || !ownerId || !name || !personality) {
//       console.error("2. Validation failed:", { planeId, ownerId, name, personality });
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     console.log("3. Attempting to connect to DB...");
//     await connectDB();
//     console.log("4. DB connected successfully");

//     console.log("5. Creating agent...");
//     const agent = await Agent.create({
//       planeId,
//       ownerId,
//       name: name.trim(),
//       personality: personality.trim(),
//     });
//     console.log("6. Agent created:", agent);

//     return NextResponse.json(agent, { status: 201 });
//   } catch (error: any) {
//     // Detailed error logging
//     console.error("=== ERROR in POST /api/agents ===");
//     console.error("Error name:", error.name);
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);
    
//     return NextResponse.json(
//       { 
//         error: "Failed to create agent", 
//         details: error.message,
//         type: error.name 
//       },
//       { status: 500 }
//     );
//   }
// }


// app/api/agents/route.ts
import { NextResponse } from "next/server";

// Temporary in-memory storage (data will reset on server restart)
let agents: any[] = [];

export async function GET(req: Request) {
  try {
    console.log("GET /api/agents called");
    
    const { searchParams } = new URL(req.url);
    const planeId = searchParams.get("planeId");

    if (!planeId) {
      return NextResponse.json(
        { error: "planeId is required" },
        { status: 400 }
      );
    }

    const planeAgents = agents.filter(a => a.planeId === planeId);
    console.log(`Found ${planeAgents.length} agents for plane ${planeId}`);
    
    return NextResponse.json(planeAgents);
  } catch (error: any) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("=== POST /api/agents called ===");
    
    const body = await req.json();
    console.log("Received body:", body);

    const { planeId, ownerId, name, personality } = body;

    // Validation
    if (!planeId) {
      console.error("Missing planeId");
      return NextResponse.json({ error: "planeId is required" }, { status: 400 });
    }
    if (!ownerId) {
      console.error("Missing ownerId");
      return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
    }
    if (!name || name.trim() === "") {
      console.error("Missing or empty name");
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
    }
    if (!personality || personality.trim() === "") {
      console.error("Missing or empty personality");
      return NextResponse.json({ error: "Agent personality is required" }, { status: 400 });
    }

    const agent = {
      _id: `agent-${Date.now()}`,
      planeId,
      ownerId,
      name: name.trim(),
      personality: personality.trim(),
      createdAt: new Date().toISOString(),
    };

    agents.push(agent);
    console.log("✅ Agent created successfully:", agent);
    console.log(`Total agents in memory: ${agents.length}`);

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR in POST /api/agents ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Failed to create agent", 
        details: error.message,
        type: error.name 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { addAgentToPlane, getAgents, getMessages, removeAgent, addMessage } from '@/lib/plane-agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if this is a message send or agent creation
    if (body.message && body.agentId && body.planeId) {
      // Sending a message
      const message = addMessage(body.planeId, body.agentId, body.message);
      if (!message) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message });
    }
    
    // Otherwise, create a new agent
    const { planeId, ownerId, name, personality } = body;

    if (!planeId || !ownerId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const agent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      planeId,
      ownerId,
      name,
      personality: personality || 'friendly',
      joinedAt: Date.now(),
    };

    const result = addAgentToPlane(planeId, agent);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planeId = searchParams.get('planeId');
  const ownerId = searchParams.get('ownerId');

  if (!planeId) {
    return NextResponse.json({ error: 'planeId required' }, { status: 400 });
  }

  const agents = getAgents(planeId);
  const messages = getMessages(planeId);

  const userAgent = ownerId ? agents.find(a => a.ownerId === ownerId) : null;

  return NextResponse.json({
    agents,
    messages,
    userAgent,
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  }

  const removed = removeAgent(agentId);
  return NextResponse.json({ success: removed });
}

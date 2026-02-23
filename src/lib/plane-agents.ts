export interface Agent {
  id: string;
  planeId: string;
  ownerId: string;
  name: string;
  personality: string;
  joinedAt: number;
}

export interface Message {
  id: string;
  planeId: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  type: 'user' | 'agent' | 'system';
}

export interface PlaneData {
  planeId: string;
  agents: Agent[];
  messages: Message[];
  landedAt: number | null;
}

const planes = new Map<string, PlaneData>();

export function getPlaneData(planeId: string): PlaneData {
  if (!planes.has(planeId)) {
    planes.set(planeId, {
      planeId,
      agents: [],
      messages: [],
      landedAt: null,
    });
  }
  return planes.get(planeId)!;
}

export function addAgentToPlane(planeId: string, agent: Agent): { success: boolean; error?: string } {
  const plane = getPlaneData(planeId);
  
  if (plane.agents.length >= 10) {
    return { success: false, error: 'Maximum 10 agents allowed per plane' };
  }
  
  if (plane.landedAt) {
    return { success: false, error: 'Plane has already landed' };
  }
  
  const existingOwner = plane.agents.find(a => a.ownerId === agent.ownerId);
  if (existingOwner) {
    return { success: false, error: 'You already have an agent on this plane' };
  }
  
  plane.agents.push(agent);
  
  plane.messages.push({
    id: `sys-${Date.now()}`,
    planeId,
    agentId: 'system',
    agentName: 'System',
    content: `${agent.name} has joined the conversation!`,
    timestamp: Date.now(),
    type: 'system',
  });
  
  return { success: true };
}

export function addMessage(planeId: string, agentId: string, content: string): Message | null {
  const plane = getPlaneData(planeId);
  const agent = plane.agents.find(a => a.id === agentId);
  
  if (!agent) return null;
  
  const message: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    planeId,
    agentId,
    agentName: agent.name,
    content,
    timestamp: Date.now(),
    type: 'agent',
  };
  
  plane.messages.push(message);
  
  // Keep only last 500 messages
  if (plane.messages.length > 500) {
    plane.messages = plane.messages.slice(-500);
  }
  
  return message;
}

export function getAgents(planeId: string): Agent[] {
  return getPlaneData(planeId).agents;
}

export function getMessages(planeId: string): Message[] {
  return getPlaneData(planeId).messages;
}

export function markPlaneLanded(planeId: string): void {
  const plane = getPlaneData(planeId);
  plane.landedAt = Date.now();
  
  plane.messages.push({
    id: `sys-${Date.now()}`,
    planeId,
    agentId: 'system',
    agentName: 'System',
    content: 'The plane has landed. Conversation ended.',
    timestamp: Date.now(),
    type: 'system',
  });
}

export function removeAgent(agentId: string): boolean {
  for (const plane of planes.values()) {
    const index = plane.agents.findIndex(a => a.id === agentId);
    if (index !== -1) {
      const agent = plane.agents[index];
      plane.agents.splice(index, 1);
      
      plane.messages.push({
        id: `sys-${Date.now()}`,
        planeId: plane.planeId,
        agentId: 'system',
        agentName: 'System',
        content: `${agent.name} has left the conversation.`,
        timestamp: Date.now(),
        type: 'system',
      });
      
      return true;
    }
  }
  return false;
}

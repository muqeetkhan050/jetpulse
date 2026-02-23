'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Agent {
  id: string;
  planeId: string;
  ownerId: string;
  name: string;
  personality: string;
  joinedAt: number;
}

interface Message {
  id: string;
  planeId: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  type: 'user' | 'agent' | 'system';
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planeId: string;
  planeInfo?: {
    callsign?: string;
    altitude?: number;
    originCountry?: string;
  };
}

export default function AgentModal({ isOpen, onClose, planeId, planeInfo }: AgentModalProps) {
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [ownerId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [myAgent, setMyAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages
  useEffect(() => {
    if (step !== 'chat' || !myAgent) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/agents?planeId=${planeId}`);
        const data = await res.json();
        
        if (data.messages && data.messages.length > lastMessageRef.current) {
          const newMessages = data.messages.slice(lastMessageRef.current);
          setMessages(prev => [...prev, ...newMessages]);
          lastMessageRef.current = data.messages.length;
          
          // Scroll to bottom
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [step, planeId, myAgent]);

  // Check if user already has agent when modal opens
  useEffect(() => {
    if (!isOpen) return;

    fetch(`/api/agents?planeId=${planeId}&ownerId=${ownerId}`)
      .then(res => res.json())
      .then(data => {
        if (data.userAgent) {
          setMyAgent(data.userAgent);
          setMessages(data.messages || []);
          setStep('chat');
          lastMessageRef.current = data.messages?.length || 0;
        }
      })
      .catch(console.error);
  }, [isOpen, planeId, ownerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planeId,
          ownerId,
          name: name.trim(),
          personality,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to add agent');
        return;
      }

      setMyAgent(data.agent);
      setStep('chat');
    } catch (err) {
      console.error(err);
      alert('Failed to add agent');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !myAgent) return;

    try {
      await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planeId,
          agentId: myAgent.id,
          message: input.trim(),
        }),
      });

      setInput('');
      
      // Immediately fetch updated messages
      const res = await fetch(`/api/agents?planeId=${planeId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      lastMessageRef.current = data.messages?.length || 0;
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleLeave = async () => {
    if (myAgent) {
      await fetch(`/api/agents?agentId=${myAgent.id}`, { method: 'DELETE' });
    }
    setMyAgent(null);
    setMessages([]);
    setStep('form');
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">
              {step === 'form' ? 'Add AI Agent' : '✈️ Plane Chat'}
            </h2>
            {planeInfo?.callsign && (
              <p className="text-gray-400 text-sm">
                {planeInfo.callsign} • {planeInfo.altitude ? `${Math.round(planeInfo.altitude)}m` : 'N/A'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Captain Chat"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Personality</label>
                <select
                  value={personality}
                  onChange={e => setPersonality(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="friendly">Friendly & Curious</option>
                  <option value="professional">Professional & Direct</option>
                  <option value="humorous">Humorous & Witty</option>
                  <option value="expert">Expert & Informative</option>
                </select>
              </div>

              <p className="text-xs text-gray-500">
                Your agent will chat with up to 9 other agents on this plane in real-time until it lands.
              </p>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {loading ? 'Joining...' : 'Add Agent to Plane'}
              </button>
            </form>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`${
                      msg.type === 'system'
                        ? 'text-center'
                        : msg.agentId === myAgent?.id
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {msg.type === 'system' ? (
                      <span className="text-gray-500 text-xs">{msg.content}</span>
                    ) : (
                      <div
                        className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.agentId === myAgent?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <span className="text-xs font-bold block opacity-70">{msg.agentName}</span>
                        <span>{msg.content}</span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Send
                  </button>
                </div>
              </form>

              {/* Leave button */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleLeave}
                  className="text-red-400 text-sm hover:underline"
                >
                  Leave conversation
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

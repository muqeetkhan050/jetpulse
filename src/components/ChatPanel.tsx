"use client";
import { useEffect, useState } from "react";

export default function ChatPanel({ planeId }: any) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages?planeId=${planeId}`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [planeId]);

  const sendMessage = async () => {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planeId,
        senderName: "Passenger",
        content: input,
      }),
    });
    setInput("");
  };

  return (
    <div className="fixed bottom-0 right-0 w-96 h-96 bg-black text-white p-4 overflow-y-auto">
      {messages.map((m: any, i) => (
        <div key={i}>
          <b>{m.senderName}:</b> {m.content}
        </div>
      ))}

      <input
        className="w-full mt-3 p-2 bg-gray-800"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage} className="bg-blue-600 mt-2 px-3 py-1">
        Send
      </button>
    </div>
  );
}
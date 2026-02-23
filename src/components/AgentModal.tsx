
// // "use client";
// // import { useState } from "react";
// // import { getOwnerId } from "@/lib/getOwnerId";

// // interface AgentModalProps {
// //   planeId: string;
// //   onClose: () => void;
// // }

// // export default function AgentModal({ planeId, onClose }: AgentModalProps) {
// //   const [name, setName] = useState("");
// //   const [personality, setPersonality] = useState("");

// //   const createAgent = async () => {
// //     await fetch("/api/agents", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         planeId,
// //         ownerId: getOwnerId(),
// //         name,
// //         personality,
// //       }),
// //     });

// //     onClose();
// //   };

// //   return (
// //     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
// //       <div className="bg-gray-900 p-6 rounded w-96">
// //         <div className="flex justify-between items-center mb-4">
// //           <h2 className="text-white text-xl font-bold">Create AI Agent</h2>
// //           <button
// //             onClick={onClose}
// //             className="text-white hover:text-gray-300 text-2xl font-bold"
// //           >
// //             ×
// //           </button>
// //         </div>
        
// //         <input
// //           className="w-full mb-3 p-2 bg-gray-800 text-white rounded"
// //           placeholder="Agent Name"
// //           value={name}
// //           onChange={(e) => setName(e.target.value)}
// //         />
// //         <textarea
// //           className="w-full mb-3 p-2 bg-gray-800 text-white rounded"
// //           placeholder="Personality"
// //           rows={4}
// //           value={personality}
// //           onChange={(e) => setPersonality(e.target.value)}
// //         />
// //         <div className="flex gap-2">
// //           <button 
// //             onClick={createAgent} 
// //             className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition-colors"
// //           >
// //             Join Flight
// //           </button>
// //           <button 
// //             onClick={onClose}
// //             className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
// //           >
// //             Cancel
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";
// import { useState } from "react";
// import { getOwnerId } from "@/lib/getOwnerId";

// interface AgentModalProps {
//   planeId: string;
//   onClose: () => void;
// }

// export default function AgentModal({ planeId, onClose }: AgentModalProps) {
//   const [name, setName] = useState("");
//   const [personality, setPersonality] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const createAgent = async () => {
//     // Validation
//     if (!name.trim()) {
//       setError("Please enter an agent name");
//       return;
//     }

//     if (!personality.trim()) {
//       setError("Please enter a personality description");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const payload = {
//         planeId,
//         ownerId: getOwnerId(),
//         name: name.trim(),
//         personality: personality.trim(),
//       };

//       console.log("Creating agent with payload:", payload);

//       const response = await fetch("/api/agents", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || `HTTP error! status: ${response.status}`);
//       }

//       console.log("Agent created successfully:", data);
//       onClose();
//     } catch (err) {
//       console.error("Error creating agent:", err);
//       setError(err instanceof Error ? err.message : "Failed to create agent");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//       <div className="bg-gray-900 p-6 rounded w-96">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-white text-xl font-bold">Create AI Agent</h2>
//           <button
//             onClick={onClose}
//             className="text-white hover:text-gray-300 text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
//             <p className="text-red-400 text-sm">⚠️ {error}</p>
//           </div>
//         )}
        
//         <input
//           className="w-full mb-3 p-2 bg-gray-800 text-white rounded"
//           placeholder="Agent Name (e.g., Travel Buddy)"
//           value={name}
//           onChange={(e) => {
//             setName(e.target.value);
//             setError(null);
//           }}
//         />
        
//         <textarea
//           className="w-full mb-3 p-2 bg-gray-800 text-white rounded"
//           placeholder="Personality (e.g., Friendly and helpful travel companion)"
//           rows={4}
//           value={personality}
//           onChange={(e) => {
//             setPersonality(e.target.value);
//             setError(null);
//           }}
//         />
        
//         <div className="flex gap-2">
//           <button 
//             onClick={createAgent}
//             disabled={loading}
//             className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded text-white transition-colors"
//           >
//             {loading ? "Creating..." : "Join Flight"}
//           </button>
//           <button 
//             onClick={onClose}
//             disabled={loading}
//             className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { getOwnerId } from "@/lib/getOwnerId";

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
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setPersonality("");
      setError(null);
    }
  }, [isOpen]);

  const createAgent = async () => {
    // Validation
    if (!name.trim()) {
      setError("Please enter an agent name");
      return;
    }

    if (!personality.trim()) {
      setError("Please enter a personality description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        planeId,
        ownerId: getOwnerId(),
        name: name.trim(),
        personality: personality.trim(),
      };

      console.log("Creating agent with payload:", payload);

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Agent created successfully:", data);
      onClose();
    } catch (err) {
      console.error("Error creating agent:", err);
      setError(err instanceof Error ? err.message : "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-96 max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-white text-xl font-bold">Create AI Agent</h2>
            {planeInfo?.callsign && (
              <p className="text-gray-400 text-sm">
                Flight: {planeInfo.callsign}
                {planeInfo.altitude && ` • ${Math.round(planeInfo.altitude)}m`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Agent Name
            </label>
            <input
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Travel Buddy, Business Pro"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">
              Personality
            </label>
            <textarea
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="e.g., Friendly and helpful travel companion who loves to chat"
              rows={4}
              value={personality}
              onChange={(e) => {
                setPersonality(e.target.value);
                setError(null);
              }}
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button 
            onClick={createAgent}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-white transition-colors font-medium"
          >
            {loading ? "Creating..." : "Join Flight"}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
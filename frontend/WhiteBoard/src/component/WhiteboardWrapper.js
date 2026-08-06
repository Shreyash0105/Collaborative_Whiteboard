import React, { useEffect, useContext, useState } from 'react';
import Board from './board';
import BoardContext from '../store/board-context';
import ToolBar from './ToolBar';
import ToolBox from './ToolBox/ToolBox';
import ShareModal from './Share/ShareModal';
import { socket } from '../socket';
// Import your existing ToolBar and ToolBox here if they aren't in App.js

const WhiteboardWrapper = ({ sessionId, onBack }) => {
  const { loadSessionData, elements } = useContext(BoardContext);
  const [loading, setLoading] = useState(true);
  // New state variables for the sharing modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Send token to backend
        }
      });
      const data = await res.json();
      loadSessionData(data.elements);
      setLoading(false);
    };
    fetchSession();

    // --- NEW: Socket Connection Logic ---
    socket.emit('join-board', sessionId);

    // Listen for incoming drawings from other users
    socket.on('board-updated', (updatedElements) => {
      loadSessionData(updatedElements);
    });

    // Cleanup when leaving the board
    return () => {
      socket.off('board-updated');
    };

    
  }, [sessionId]);

  const saveSession = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${process.env.REACT_APP_API_URL}/sessions/${sessionId}`, { //[cite: 7]
      method: 'PUT', //[cite: 7]
      headers: { 
        'Content-Type': 'application/json', //[cite: 7]
        'Authorization': `Bearer ${token}` // Send token to backend
      },
      body: JSON.stringify({ elements }) //[cite: 7]
    });
    alert("Saved Successfully!");
  };

  if (loading) return <div>Loading canvas...</div>;

  return (
    <>
        <div className="absolute top-4 right-4 z-50 flex gap-3">
          <button 
            onClick={onBack} 
            className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded shadow hover:bg-gray-300 transition-colors"
          >
            Dashboard
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded shadow hover:bg-blue-600 transition-colors"
          >
            Share
          </button>
          <button 
            onClick={saveSession}
            className="px-4 py-2 bg-green-500 text-white font-medium rounded shadow hover:bg-green-600 transition-colors"
          >
            Save Progress
          </button>
        </div>

        <ShareModal 
          isOpen={isShareModalOpen} 
          sessionId={sessionId}
          onClose={() => setIsShareModalOpen(false)} 
        />
      
      {/* Ensure your existing ToolBar and ToolBox are rendered here or inside Board */}
      <ToolBar/>
      <Board />
      <ToolBox/>
    </>
  );
};

export default WhiteboardWrapper;
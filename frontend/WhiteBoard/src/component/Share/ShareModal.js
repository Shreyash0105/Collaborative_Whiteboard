import React, { useState } from 'react';

const ShareModal = ({ isOpen, onClose, sessionId }) => {
  const [shareEmail, setShareEmail] = useState('');

  // If the modal is not meant to be open, render nothing
  if (!isOpen) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/sessions/${sessionId}/share`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: shareEmail })
      });
      
      const data = await res.json();
      alert(data.msg); 
      
      if (res.ok) {
        setShareEmail(''); // Reset input
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Share error:", error);
      alert("An error occurred while sharing.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Share Whiteboard</h2>
        <form onSubmit={handleShare}>
          <input 
            type="email" 
            placeholder="User's email address" 
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            required
            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => {
                setShareEmail('');
                onClose();
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
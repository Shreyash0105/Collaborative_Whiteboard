import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import ShareModal from '../Share/ShareModal';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [title, setTitle] = useState('');
  //ShareModal
  const [shareConfig, setShareConfig] = useState({ isOpen: false, sessionId: null });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get the token

    fetch(`${process.env.REACT_APP_API_URL}/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}` // Send the token to the backend
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(data => setSessions(data))
      .catch(err => console.error(err));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.REACT_APP_API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: title || 'New Whiteboard' })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Create session failed:', res.status, text);
      throw new Error(`Server error: ${res.status}`);
    }

    if (res.ok) {
      const newSession = await res.json();
      navigate(`/board/${newSession._id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="mb-8 flex items-center">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Session title..." 
          className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r-md hover:bg-blue-600 transition-colors"
        >
          Create New Session
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sessions.map(session => (
          <div 
            key={session._id} 
            onClick={() => navigate(`/board/${session._id}`)}
            className="border border-gray-200 bg-white p-5 cursor-pointer rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
              {session.title}
            </h3>
            <p className="text-sm text-gray-500">
              Last Edit: {new Date(session.lastModified).toLocaleDateString()}
            </p>

            <button 
              onClick={(e) => { 
                e.stopPropagation(); // Prevents the div onClick from firing
                setShareConfig({ isOpen: true, sessionId: session._id }); 
              }}
              className="mt-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded hover:bg-blue-200"
            >
              Share Session
            </button>
          </div>
        ))}
      </div>
      {/* Render the reusable modal */}
      <ShareModal 
        isOpen={shareConfig.isOpen} 
        sessionId={shareConfig.sessionId}
        onClose={() => setShareConfig({ isOpen: false, sessionId: null })} 
      />
    </div>
  );
};

export default Dashboard;
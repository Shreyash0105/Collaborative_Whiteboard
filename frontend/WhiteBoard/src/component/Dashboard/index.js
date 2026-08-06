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
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* 
        TOP COLORED SECTION (30-40% of viewport) 
        Uses #300A6E and #0B00CF from the palette
      */}
      <div className="relative min-h-[35vh] flex flex-col justify-center bg-gradient-to-br from-[#300A6E] to-[#0B00CF] px-6 py-12 shadow-lg overflow-hidden">
        
        {/* Elegant "DASHBOARD" Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5">
          <h1 className="text-7xl md:text-[180px] font-serif font-black text-white tracking-widest uppercase whitespace-nowrap">
            Dashboard
          </h1>
        </div>

        {/* Header Controls */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white drop-shadow-md">My Workspace</h2>
            {/* Uses #C10A28 from the palette */}
            <button 
              onClick={handleLogout} 
              className="px-5 py-2 bg-[#C10A28] text-white font-medium rounded-md hover:bg-opacity-80 transition-all shadow-md"
            >
              Logout
            </button>
          </div>

          {/* Creation Form */}
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-center w-full max-w-2xl bg-white p-2 rounded-lg shadow-2xl">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter session title..." 
              className="flex-1 p-3 text-gray-800 rounded-md focus:outline-none bg-transparent"
            />
            {/* Uses #FF2D2B from the palette */}
            <button 
              type="submit" 
              className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 bg-[#FF2D2B] text-white font-semibold rounded-md hover:bg-opacity-90 transition-transform active:scale-95"
            >
              Create New Session
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM SECTION (Sessions Grid) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sessions.map(session => (
            <div 
              key={session._id} 
              onClick={() => navigate(`/board/${session._id}`)}
              className="group flex flex-col border border-gray-200 bg-white p-6 cursor-pointer rounded-xl shadow-sm hover:shadow-xl hover:border-[#0B00CF] transition-all duration-300 min-h-[160px]"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-[#0B00CF] transition-colors">
                {session.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Last Edit: {new Date(session.lastModified).toLocaleDateString()}
              </p>

              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setShareConfig({ isOpen: true, sessionId: session._id }); 
                }}
                className="mt-auto px-4 py-2 bg-[#0B00CF]/10 text-[#0B00CF] text-sm font-bold rounded-md hover:bg-[#0B00CF] hover:text-white transition-colors w-full"
              >
                Share Session
              </button>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center text-gray-400 mt-12 text-lg">
            No sessions available. Create one to get started!
          </div>
        )}
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
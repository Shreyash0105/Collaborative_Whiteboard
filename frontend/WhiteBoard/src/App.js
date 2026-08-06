// import Board from "./component/board";
// import ToolBar from "./component/ToolBar";
// import ToolBox from "./component/ToolBox/ToolBox";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import BoardContentProvider from "./store/BoardContentProvider";
import ToolBoxProvider from "./store/toolBoxProvider";
import Dashboard from "./component/Dashboard";
import WhiteboardWrapper from "./component/WhiteboardWrapper";
import Login from './component/Auth/Login';
import Register from './component/Auth/Register';
// import { useState } from "react";


const BoardRouteWrapper = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  return (
    <ToolBoxProvider>
      <BoardContentProvider currentSessionId={sessionId}>
        <WhiteboardWrapper 
          sessionId={sessionId} 
          onBack={() => navigate('/dashboard')} 
        />
      </BoardContentProvider>
    </ToolBoxProvider>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/board/:sessionId" element={
          <ProtectedRoute>
            <BoardRouteWrapper />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

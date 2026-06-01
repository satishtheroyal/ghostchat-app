import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';
import ChatRoom from './pages/ChatRoom';
import './styles/globals.css';

function App() {
  const [page, setPage] = useState('home');
  const [sessionData, setSessionData] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleCreateSession = (data) => {
    setSessionData(data);
    setPage('chat');
  };

  const handleJoinSession = (data) => {
    setSessionData(data);
    setPage('chat');
  };

  const handleExitChat = () => {
    setSessionData(null);
    setPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👻</span>
            <h1 className="text-xl font-bold text-white">GhostChat</h1>
          </div>
          <p className="text-sm text-gray-400">v1.0 - GHOST</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {page === 'home' && (
          <div className="space-y-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-white">Secure. Private. Ephemeral.</h2>
              <p className="text-gray-300 text-lg">End-to-end encrypted chat with zero server storage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CreateSession onSessionCreated={handleCreateSession} />
              <JoinSession onSessionJoined={handleJoinSession} />
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="font-bold text-white mb-2">End-to-End Encrypted</h3>
                <p className="text-gray-400 text-sm">Messages encrypted with AES-256-GCM</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="font-bold text-white mb-2">Auto-Expiring</h3>
                <p className="text-gray-400 text-sm">Sessions and messages disappear automatically</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="font-bold text-white mb-2">No Signup Required</h3>
                <p className="text-gray-400 text-sm">Share a link, use a PIN, start chatting</p>
              </div>
            </div>
          </div>
        )}

        {page === 'chat' && socket && (
          <ChatRoom
            sessionData={sessionData}
            socket={socket}
            onExit={handleExitChat}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>🔒 Secure. Private. Open Source.</p>
          <p className="mt-2 text-xs text-gray-500">© 2024 GhostChat. MIT License.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

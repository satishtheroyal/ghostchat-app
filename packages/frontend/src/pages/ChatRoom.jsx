import React, { useState, useEffect, useRef } from 'react';

function ChatRoom({ sessionData, socket, onExit }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [destroyTimer, setDestroyTimer] = useState('never');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        setMessages(prev => [...prev, data]);
      });
    }

    return () => {
      if (socket) socket.off('receive-message');
    };
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    const message = {
      text: messageText,
      timestamp: new Date().toISOString(),
      destroyAfter: destroyTimer,
      id: Date.now().toString()
    };

    if (socket) {
      socket.emit('send-message', {
        sessionId: sessionData.sessionId,
        message,
        encryptedMessage: messageText // In real implementation, this would be encrypted
      });
    }

    setMessages(prev => [...prev, { ...message, fromUser: 'me' }]);
    setMessageText('');
  };

  return (
    <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 px-4 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">Chat Session</h3>
          <p className="text-xs text-gray-400">ID: {sessionData.sessionId.slice(0, 8)}...</p>
        </div>
        <button
          onClick={onExit}
          className="text-sm px-3 py-1 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30"
        >
          ✕ Exit
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-center">
              <div className="text-4xl mb-2">👻</div>
              <p>No messages yet. Start typing to begin!</p>
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.fromUser === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.fromUser === 'me'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800/50 border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex gap-2">
            <select
              value={destroyTimer}
              onChange={(e) => setDestroyTimer(e.target.value)}
              className="px-2 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            >
              <option value="never">Keep</option>
              <option value="read">On Read</option>
              <option value="1min">1 Min</option>
              <option value="5min">5 Min</option>
            </select>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type message..."
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-white"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;

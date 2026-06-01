import React, { useState } from 'react';

function CreateSession({ onSessionCreated }) {
  const [loading, setLoading] = useState(false);
  const [sessionTTL, setSessionTTL] = useState(600);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: sessionTTL })
      });

      const data = await response.json();
      onSessionCreated(data);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Create New Chat</h2>
      <p className="text-gray-300 mb-6">Start a new secure conversation and share the link</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Session Duration</label>
          <select
            value={sessionTTL}
            onChange={(e) => setSessionTTL(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
            <option value={1800}>30 minutes</option>
            <option value={3600}>1 hour</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded font-medium text-white transition"
        >
          {loading ? 'Creating...' : '✨ Create Chat Link'}
        </button>
      </div>
    </div>
  );
}

export default CreateSession;

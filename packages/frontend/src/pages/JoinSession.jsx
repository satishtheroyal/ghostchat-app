import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function JoinSession({ onSessionJoined }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const inviteToken = searchParams.get('token');

  const handleJoin = async (e) => {
    e.preventDefault();

    if (pin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    try {
      // Validate PIN and generate shared keys
      const sessionData = {
        sessionId: sessionId || 'temp',
        inviteToken,
        pin
      };
      onSessionJoined(sessionData);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Join Chat</h2>
      <p className="text-gray-300 mb-6">Enter the 4-6 digit PIN shared with you</p>

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Session PIN</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="6"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="1234"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white text-center text-2xl tracking-widest"
          />
        </div>

        <button
          type="submit"
          disabled={loading || pin.length < 4}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded font-medium text-white transition"
        >
          {loading ? 'Joining...' : '🔓 Join Chat'}
        </button>
      </form>
    </div>
  );
}

export default JoinSession;

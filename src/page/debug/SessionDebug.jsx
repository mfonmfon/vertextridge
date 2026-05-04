import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

const SessionDebug = () => {
  const { user } = useUser();
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem('tradz_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setSessionInfo({
          keys: Object.keys(session),
          hasAccessToken: !!session.access_token,
          hasToken: !!session.token,
          hasRefreshToken: !!session.refresh_token,
          tokenPreview: (session.access_token || session.token || 'NONE').substring(0, 100),
          expiresAt: session.expires_at,
          expiresIn: session.expires_in,
          user: session.user
        });
      } catch (e) {
        setSessionInfo({ error: e.message });
      }
    } else {
      setSessionInfo({ error: 'No session found' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Session Debug Info</h1>
        
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-bold mb-4">User Context</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Session Storage</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Login to your account</li>
            <li>Come back to this page</li>
            <li>Take a screenshot of the session info</li>
            <li>Check if access_token exists and is valid</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SessionDebug;

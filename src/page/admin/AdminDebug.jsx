import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../component/shared/UI';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Admin Debug Page - Helps diagnose authentication issues
 */
const AdminDebug = () => {
  const [checks, setChecks] = useState({
    sessionExists: null,
    hasAccessToken: null,
    tokenValid: null,
    isAdmin: null
  });
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = {
      sessionExists: false,
      hasAccessToken: false,
      tokenValid: false,
      isAdmin: false
    };

    try {
      // Check 1: Session exists in localStorage
      const sessionStr = localStorage.getItem('tradz_session');
      results.sessionExists = !!sessionStr;

      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        setSessionData(session);

        // Check 2: Has access token
        results.hasAccessToken = !!session.access_token;

        if (session.access_token) {
          // Check 3: Token is valid (try to call API)
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/admin/stats`, {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });

            if (response.status === 401) {
              results.tokenValid = false;
              setError('Token is invalid or expired');
            } else if (response.status === 403) {
              results.tokenValid = true;
              results.isAdmin = false;
              setError('User is not an admin');
            } else if (response.ok) {
              results.tokenValid = true;
              results.isAdmin = true;
            } else {
              results.tokenValid = false;
              setError(`Unexpected status: ${response.status}`);
            }
          } catch (err) {
            setError(`API call failed: ${err.message}`);
          }
        }
      }
    } catch (err) {
      setError(`Diagnostic error: ${err.message}`);
    }

    setChecks(results);
  };

  const CheckItem = ({ label, status, details }) => {
    const Icon = status === true ? CheckCircle : status === false ? XCircle : AlertCircle;
    const color = status === true ? 'text-green-500' : status === false ? 'text-red-500' : 'text-yellow-500';

    return (
      <div className="flex items-start gap-3 p-4 bg-dark-lighter rounded-lg">
        <Icon className={`w-5 h-5 ${color} mt-0.5`} />
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {details && <div className="text-sm text-white/60 mt-1">{details}</div>}
        </div>
      </div>
    );
  };

  const clearAndReload = () => {
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-dark p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Authentication Diagnostics</h1>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Checks</h2>
          <div className="space-y-3">
            <CheckItem
              label="Session exists in localStorage"
              status={checks.sessionExists}
              details={checks.sessionExists ? 'Session found' : 'No session found - please login'}
            />
            <CheckItem
              label="Access token present"
              status={checks.hasAccessToken}
              details={checks.hasAccessToken ? 'Token found in session' : 'No access token in session'}
            />
            <CheckItem
              label="Token is valid"
              status={checks.tokenValid}
              details={checks.tokenValid ? 'Token validated with backend' : 'Token validation failed'}
            />
            <CheckItem
              label="User is admin"
              status={checks.isAdmin}
              details={checks.isAdmin ? 'Admin privileges confirmed' : 'User is not in admin_users table'}
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <div className="font-medium text-red-500">Error</div>
                  <div className="text-sm text-white/80 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {sessionData && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Data</h2>
            <div className="bg-dark-lighter p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm text-white/80">
                {JSON.stringify({
                  hasAccessToken: !!sessionData.access_token,
                  hasRefreshToken: !!sessionData.refresh_token,
                  tokenType: sessionData.token_type,
                  expiresAt: sessionData.expires_at,
                  expiresIn: sessionData.expires_in,
                  accessTokenPreview: sessionData.access_token?.substring(0, 30) + '...'
                }, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <Button onClick={runDiagnostics} className="w-full">
              Re-run Diagnostics
            </Button>
            <Button onClick={clearAndReload} variant="outline" className="w-full">
              Clear Session & Return to Login
            </Button>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-dark-lighter rounded-lg">
          <h3 className="font-semibold mb-2">Common Solutions</h3>
          <ul className="text-sm text-white/80 space-y-2">
            <li>• If no session: Login at /admin/login</li>
            <li>• If no access token: Backend login response is incorrect</li>
            <li>• If token invalid: Token expired or malformed - clear session and login again</li>
            <li>• If not admin: Run CREATE_ADMIN_USER.sql in Supabase to add your user to admin_users table</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;

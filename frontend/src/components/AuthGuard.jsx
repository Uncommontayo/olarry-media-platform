import { useEffect, useState } from "react";
import { isAuthenticated } from "../api";
import { theme } from "../styles/theme";

export default function AuthGuard({ children }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check authentication and verify role with backend
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
      }

      try {
        const token = localStorage.getItem('authToken');
        
        // Verify token with backend and get current role
        const response = await fetch('/api/verify_token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Token invalid, logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('username');
          window.location.href = '/login.html';
          return;
        }

        const data = await response.json();
        
        if (!data.valid) {
          // Token invalid, logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('username');
          window.location.href = '/login.html';
          return;
        }

        // Update localStorage with current role from database
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('username', data.username);
        
        console.log('✅ Auth verified. Role:', data.role);

        // Redirect creators to creator dashboard
        if (data.role === 'creator') {
          console.log('Creator detected, redirecting to creator dashboard...');
          window.location.href = '/creator-dashboard.html';
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.colors.background
      }}>
        <div style={{
          textAlign: 'center',
          color: theme.colors.textMuted
        }}>
          <div style={{
            width: 60,
            height: 60,
            border: `4px solid ${theme.colors.border}`,
            borderTopColor: theme.colors.accentBright,
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return children;
}
